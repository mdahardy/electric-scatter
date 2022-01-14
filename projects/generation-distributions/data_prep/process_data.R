library(Hmisc)
library(jsonlite)
library(dplyr)
library(ipumsr)
library(plyr)

# This is the multiplier for putting everything into 2020 dollars
# You can get this from https://cps.ipums.org/cps/cpi99.shtml
CPI_multiplier = 0.644

# Bandwidth for kernels
bandwidth = 10000

# Actual ages are one less than the reported ages as participants report income during previous year
# Eg, age 19 in survey corresponds to an actual estimated age of 18
min_age = 19
max_age = 66

# T/F for redoing x axis max calculation
# Only need to do this if you're changing the plots or updating the ipums data
# Note that there are different x axis maxes for each worker subset
recompute_x_axis_maxes = F

# T/F for redoing data caching that's already been done 
# i.e., should you overwrite json that already exist
overwrite_jsons = T

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- - HELPER FUNCTIONS - -- --
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 

get_average_weeks_worked = function(input){
  if (input==1) return(7)  # 1 - 13 weeks
  if (input==2) return(20) # 14-26 weeks
  return(27) # 27+ weeks, don't take midpoint as all will be included
}

get_average_weeks_unemployed = function(input){
  if (input==0) return(0)
  if (input==1) return (2.5)  # 1-4 weeks
  if (input==2) return (7.5) # 5 - 10 weeks
  if (input==3) return(12.5)  # 11- 14 weeks
  if (input==4) return(20.5) # 15 - 26 weeks
  if (input==9) return(0) # 27+ weeks, don't take midpoint as all will be included
  return(27) 
}

get_generation = function(birth_year){
  for (gen_i in gen_list){
    if (between(birth_year,gen_cutoffs[gen_i][[1]][1],gen_cutoffs[gen_i][[1]][2])) return(gen_i)
  }
  return('other')
}

subset_generation = function(input_data,generation_string){
  if (generation_string=='all_generations') return(input_data)
  return(subset(input_data,generation==generation_string))
}

mirror_data = function(input_data){
  data_to_mirror = subset(input_data,real_income < bandwidth)
  data_to_mirror$real_income = data_to_mirror$real_income * -1
  return(rbind(input_data,data_to_mirror))
}

epanechnikov_kernel = function(bandwidth,threshold,kernel_center,asecwt) {
  weighted_difference = abs((threshold - kernel_center) / bandwidth)
  if (weighted_difference >= 1) return(0)
  return(asecwt * (0.75 * (1 - (weighted_difference^2)) / bandwidth))
}

estimate_densities = function(input_data,x_axis_max){
  thresholds = seq(0,x_axis_max,by=2000)
  # Initialize zero vector of thresholds
  densities = rep(0.0,length(thresholds))
  normalization_factor = sum(input_data$ASECWT)
  plotting_data = input_data %>% mirror_data() %>% subset(real_income < x_axis_max + bandwidth)
  # cut off the threhsolds above the max of the data
  thresholds_to_loop = thresholds[thresholds < max(plotting_data$real_income) + bandwidth]
  # Loop over the threhoslds, get the density for each, an then normalize
  densities = sapply(thresholds_to_loop,get_threshold_density,data_for_estimation = plotting_data) / normalization_factor
  # Append zeros for thresholds above the max in the data
  densities = c(densities,rep(0,length(thresholds) - length(thresholds_to_loop)))
  return(densities)
}

get_threshold_density = function(threshold,data_for_estimation){
  # get the data that will influence the estimated density at the current subset
  threshold_subset = subset(data_for_estimation, abs(real_income-threshold) < bandwidth)
  # get the threshold density
  if (nrow(threshold_subset) == 0) return(0)
  return(sum(apply(threshold_subset,1,function(d) epanechnikov_kernel(bandwidth,threshold,d['real_income'],d['ASECWT']))))
}

make_json_and_save = function(formatted_data,directory_string){
  # Convert subsetted dataframe to JSON
  json_obj = toJSON(formatted_data,digits=21,auto_unbox=T)
  # If directories don't exist, create them 
  if (!dir.exists(directory_string)) dir.create(directory_string,recursive = T) 
  # Make directory string and save
  file_str = paste0(directory_string,'/data.json')
  write(json_obj, file_str) 
}

process_data_and_save = function(input_data,worker_type,min_age,max_age,redo_x_axis_estimation){
  # Get the highest income value to compute densities for
  x_axis_max_filename = paste0('x_axis_maxes/',worker_type,'_',min_age,'-',max_age,'.txt')
  if (redo_x_axis_estimation) write_x_axis_max(input_data,worker_type,min_age,max_age,x_axis_max_filename)
  x_axis_max = as.integer(readLines(x_axis_max_filename))
  max_year = max(input_data$YEAR)
  for (generation_i in c('all_generations',gen_list)){
    # Path for the directory where the file lives
    dir_path = paste("../processed_data",worker_type,generation_i,sep='/')
    if (!overwrite_jsons & !file.exists(paste0(dir_path,'/data.json'))){
      print(paste("--------- Skipping",worker_type,generation_i,"---------"))
      next
    }
    print(paste("--------- Processing",worker_type,generation_i,"---------"))
    input_data %>%
      subset_generation(generation_i) %>%
      cache_densities_and_incomes(min_age,max_age,x_axis_max,max_year) %>%
      make_json_and_save(dir_path)
  }
}

cache_densities_and_incomes = function(input_data,min_age,max_age,max_x_axis,max_year){
  # Percentiles to be tracked in the front end
  percentile_vec = seq(0.02,0.98,0.02)
  data_obj = list('incomes' = list(),'densities' = list(),'x_maxes' = list(),'y_maxes' = list())
  # Get the highest percentile (x axis max) and denisty (y axis max) across all ages for the current subset
  percentile_max = 0
  densities_max = 0
  # We pass both the incomes matrix and the transposed matrix to the front end for faster processing
  incomes_matrix = matrix(NA,nrow=0,ncol = length(percentile_vec)+1)
  cached_ages = vector()
  counter = 1
  for (age_i in min_age:max_age){
    age_data = subset(input_data,AGE==age_i)[,c('real_income','ASECWT')]
    if (nrow(age_data) >= 100){
      income_percentiles = unname(wtd.quantile(age_data$real_income,weights=age_data$ASECWT,probs=percentile_vec))
      income_densities = estimate_densities(age_data,max_x_axis)
      income_mean = wtd.mean(age_data$real_income,weights=age_data$ASECWT)
      curr_percentile_max = max(income_percentiles)
      percentile_max = max(percentile_max,curr_percentile_max)
      curr_densities_max = max(income_densities)
      densities_max = max(densities_max,curr_densities_max)
      # Store in data obj
      data_obj$incomes[[counter]] = c(income_percentiles,income_mean)
      data_obj$densities[[counter]] = income_densities
      data_obj$x_maxes[[age_i]] = curr_percentile_max
      data_obj$y_maxes[[age_i]] = curr_densities_max
      # Add incomes to income matrix
      incomes_matrix = rbind(incomes_matrix,c(income_percentiles,income_mean))
      # For tracking min and max age
      cached_ages = c(cached_ages,age_i)
      print(paste('Age',age_i, 'done'))
      counter = counter + 1
    } else{
      print(paste("!!!! Insufficient data flag:",age_i))
    }
  }
  # Add global properties to data_obj
  data_obj$global_x_max = percentile_max
  data_obj$global_y_max = densities_max
  data_obj$transposed_incomes = t(incomes_matrix)
  data_obj$min_age = min(cached_ages) - 1
  data_obj$max_age = max(cached_ages) - 1
  data_obj$max_year = max_year - 1
  return (data_obj)
}


# Loops thorugh the demographic combos, finds the highest 98th percentile
# Returns the smallest thold at least 20000 over this (tholds go in increments of 2,000)
# Saves this to a text file in the x_axis_maxes directory
write_x_axis_max = function(input_data,worker_type,min_age,max_age,x_axis_max_filename){
  print(paste(' ------------- Finding x maxes for',worker_type,'-------------'))
  # Loop through all generations, find the 98th percentile for each, save the highest one
  max_income_percentile = 0
  for (gen_i in c('all_generations',gen_list)){
    print(paste('Getting maxes for',gen_i))
    max_income_percentile = input_data %>% 
      {if (gen_i != 'all_generations') subset(.,generation == gen_i) else .} %>%
      # Have to specify these are from dplyr as it conflicts with plyr
      dplyr::group_by(AGE) %>% 
      dplyr::summarize(
        max_age_percentile = wtd.quantile(real_income,weights=ASECWT,probs=0.98)
      ) %>%
      select(max_age_percentile) %>%
      max(max_income_percentile)
  }
  # Get the smallest multiple of 2000 at least 20000 over outer_max_percentile
  x_axis_max = round_any(max_income_percentile,2000,f=ceiling) + 20000
  # save max thold to file
  write(as.character(x_axis_max), x_axis_max_filename)
}

# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Initialize variables and load data
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 

# Don't mess too much here
gen_list = c('greatest','silent','boomers','gen_x','millennials')

gen_cutoffs = list(
  'greatest' = c(1901,1927),
  'silent' = c(1928, 1945),
  'boomers' = c(1946,1964),
  'gen_x' = c(1965,1980),
  'millennials' = c(1981,1996))

data_filepath = "../../income-distributions/data_prep/ipums_data/cps_00009.xml"
raw_data = data_filepath %>%
  read_ipums_ddi() %>%
  read_ipums_micro() %>%
  # Remove negative income people
  subset(INCTOT>=0) %>%
  # Remove income not in universe
  subset(INCTOT!=999999999) %>%
  # remove income Missing
  subset(INCTOT!=999999998) %>%
  mutate(
    CPI_2020 = CPI99 / CPI_multiplier,
    real_income = INCTOT * CPI_2020,
    birth_year = YEAR - AGE,
    generation = sapply(birth_year,get_generation)
  ) %>%
  subset(generation!='other') %>%
  # Workers age (min_age-1) - (max_age-1) 
  # Subtract one year because workers reported income for the previous year
  subset(AGE>=min_age & AGE<=max_age)

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# Process data for workers that worked full time, year round
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 

raw_data %>%
  # Worked 50-52 weeks last year
  subset(WKSWORK2==6) %>%
  # Worked full time last year
  subset(FULLPART==1) %>%
  process_data_and_save('full_time',min_age,max_age,recompute_x_axis_maxes)

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# Process data for workers that were in the labor force for at least 6 months
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 

# Note: WKSUNEM2==9 should be NIU, should only have people that pretty much worked all year, but I have additional observations where people
# worked a few weeks (e.g., 10 weeks) because of the error. These people should be in universe with WKSUNEMP==0.
# I don't want to remove NIU people because all of these people worked (have already subsetted based on this)
# If I make everyone unemployed for 0 weeks, this will fix the problem (for people who worked all year, it will include them,
# And for people who only worke da few weeks, it will keep them if they worked over 26 weeks
# these as zero (either worked all year, or worked less than all year and should be 0 (this is an error))

raw_data %>%
  # Remove missing employment data
  subset(WKSWORK2 != 9) %>%
  # Remove people who didn't work at all last year (won't have unemployment data on these people as they're NIU)
  subset(WKSWORK2 != 0) %>%
  # Remove missing unemployment data
  subset(WKSUNEM2 != 8) %>%
  # Only keep people who were in the labor force at least 26 weeks last year
  mutate(
    average_weeks_worked = sapply(WKSWORK2,get_average_weeks_worked),
    average_weeks_unemployed = sapply(WKSUNEM2,get_average_weeks_unemployed),
    total_weeks_in_labor_force = average_weeks_worked + average_weeks_unemployed
  ) %>%
  subset(total_weeks_in_labor_force >= 26) %>%
  process_data_and_save('in_labor_force',min_age,max_age,recompute_x_axis_maxes)

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# Process data for workers following the FRED method
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 

# Note that age subsetting is slightly different from FRED, 
# which includes 14-15 year olds in some older years of data
raw_data %>%
  # Keep people with positive income (negative income removed in load_and_clean_data() )
  subset(INCTOT!=0) %>%
  process_data_and_save('fred',min_age,max_age,recompute_x_axis_maxes)