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

# min and max years for plotting
# the data for a year is on the previous year
# e.g., 1971 data is for 1970
min_year = 1971 
max_year = 2021

# T/F for redoing x axis max calculation
# Only need to do this if you're changing the plots or updating the ipums data,
# Note that there are different x axis maxes for worker subset
recompute_x_axis_maxes = F

# T/F for redoing data caching that's already been done 
# i.e., should you overwrite json that already exist
overwrite_jsons = T

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- - HELPER FUNCTIONS - -- --
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
 
process_data_and_save = function(input_d,subset_type,min_year,max_year,redo_x_axis_estimation){
  # Generate all possible demographic combos to loop through
  demographic_combos = expand.grid(sex_vars,age_vars,race_vars,stringsAsFactors = F)
  # Get the highest income value to compute densities for
  x_axis_max_filename = paste0('x_axis_maxes/',subset_type,'_',min_year,'-',max_year,'.txt')
  if (redo_x_axis_estimation) write_x_axis_max(input_d,subset_type,min_year,max_year,x_axis_max_filename) 
  x_axis_max = as.integer(readLines(x_axis_max_filename))
  for (row_i in 1:nrow(demographic_combos)){
    demographic_i = as.character(demographic_combos[row_i,])
    dir_string =  paste0(c('../processed_data', subset_type, demographic_i),'/',collapse = '')
    # If the file exists and you aren't overwriting it, skip processing data
    if (!overwrite_jsons & file.exists(paste0(dir_string,'data.json'))){
      print(paste(c("--------- Skipping",subset_type,demographic_i, '---------'), collapse=' '))
      next
    }
    # Process data
    print(paste(c("--------- Processing",subset_type,demographic_i,'---------'),collapse=' '))
    # Path for the directory where processed data will be exported
    # Subset and pepare data save as json
    input_d %>%
      subset_data(demographic_i) %>%
      cache_densities_and_incomes(min_year,max_year,x_axis_max) %>%
      make_json_and_save(dir_string)
  }
}

subset_data = function(full_data,demographic_vars){
  return(
    full_data %>% 
      subset_sex(demographic_vars[1]) %>% 
      subset_age(demographic_vars[2]) %>% 
      subset_race(demographic_vars[3])
  )
}


subset_sex = function(input_data,sex_string){
  if (sex_string == 'all_sexes') return(input_data)
  return(subset(input_data,SEX==sex_dict[sex_string]))
}

subset_age = function(input_data,age_string){
  if (age_string=='under_30') return(subset(input_data,AGE<31))
  if (age_string=='from_30_to_49') return(subset(input_data,AGE>=31 & AGE <= 50))
  if (age_string=='over_50') return(subset(input_data,AGE>=51))
  return(input_data)
}

subset_race = function(input_data,race_string){
  if (race_string=='white_non_hispanic') return(subset(input_data,RACE==100 & HISPAN == 0))
  if (race_string=='black_non_hispanic') return(subset(input_data,RACE==200 & HISPAN == 0))
  if (race_string=='hispanic') return(subset(input_data,HISPAN %in% hispanic_list))
  return(input_data)
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
  # initialize zero vector of thresholds
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

# Function that converts subsetted data to readable json 
cache_densities_and_incomes = function(input_data,first_year,last_year,x_axis_max){
  # Percentiles to be tracked in the front end
  percentile_vec = seq(0.02,0.98,0.02)
  data_obj = list('incomes' = list(),'densities' = list())
  # Get the highest percentile (x axis max) and denisty (y axis max) across all years for the current subset
  percentile_max = 0
  densities_max = 0
  # We pass both the incomes matrix and the transposed matrix to the front end for faster processing
  incomes_matrix = matrix(NA,nrow=(last_year-first_year)+1,ncol = length(percentile_vec)+1)
  # Loop through years
  for (year_i in first_year:last_year){
    year_data = subset(input_data,YEAR==year_i)[,c('real_income','ASECWT')]
    # Get relevant info to save
    income_percentiles = unname(wtd.quantile(year_data$real_income,weights=year_data$ASECWT,probs=percentile_vec))
    income_densities = estimate_densities(year_data,x_axis_max)
    income_mean = wtd.mean(year_data$real_income, weights=year_data$ASECWT)
    percentile_max = max(percentile_max,max(income_percentiles))
    densities_max = max(densities_max,max(income_densities))
    # Store in data obj
    counter = (year_i - first_year) + 1
    data_obj$incomes[[counter]] = c(income_percentiles,income_mean)
    data_obj$densities[[counter]] = income_densities
    # Add incomes to income matrix
    incomes_matrix[counter,] = c(income_percentiles,income_mean)
    print(paste(year_i,'done'))
  }
  # Add global properties to data_obj
  data_obj$x_max = percentile_max
  data_obj$y_max = densities_max
  data_obj$transposed_incomes = t(incomes_matrix)
  data_obj$first_year = first_year - 1
  data_obj$last_year = last_year - 1
  return (data_obj)
}

make_json_and_save = function(formatted_data,directory_string){
  # Convert subsetted dataframe to JSON
  json_obj = toJSON(formatted_data,digits=21,auto_unbox=T)
  # If directories don't exist, create them 
  if (!dir.exists(directory_string)) dir.create(directory_string,recursive = T) 
  # Make directory string and save
  file_str = paste0(directory_string,'data.json')
  write(json_obj, file_str)
}

# Loops thorugh the demographic combos, finds the highest 98th percentile
# Gets the smallest thold at least 20000 over this (tholds go in increments of 2,000)
# Saves this to a text file in the x_axis_maxes directory
write_x_axis_max = function(input_data,subset_type,min_year,max_year,x_axis_filename){
  print(paste(' ------------- Finding x maxes for',subset_type,'-------------'))
  # Generate all possible demographic combos to loop through
  demographic_combos = expand.grid(sex_vars,age_vars,race_vars,stringsAsFactors = F)
  max_percentile = 0
  for (row_i in 1:nrow(demographic_combos)){
    demographic_i = as.character(demographic_combos[row_i,])
    print(paste(c("Getting maxes for",subset_type,demographic_i), collapse=' '))
    max_percentile = input_data %>% 
      subset_data(demographic_i) %>%
      # Have to specify these are from dplyr as it conflicts with plyr
      dplyr::group_by(YEAR) %>% 
      dplyr::summarize(
        max_year_percentile = wtd.quantile(real_income,weights=ASECWT,probs=0.98)
      ) %>%
      select(max_year_percentile) %>%
      max(max_percentile)
  }
  # Get the smallest multiple of 2000 at least 20000 over outer_max_percentile
  x_axis_max = round_any(max_percentile,2000,f=ceiling) + 20000
  # Save max thold to file
  write(as.character(x_axis_max), x_axis_filename)
}

get_average_weeks_worked = function(input){
  if (input == 1) return(7)  # 1 - 13 weeks
  if (input == 2) return(20) # 14-26 weeks
  return(27) # 27+ weeks, don't take midpoint as all will be included
}

get_average_weeks_unemployed = function(input){
  if (input==0) return(0)
  if (input==1) return (2.5) # 1-4
  if (input==2) return (7.5)  # 5 - 10 weeks
  if (input==3) return(12.5) # 11- 14 weeks
  if (input==4) return(20.5) # 15 - 26 weeks
  if (input==9) return(0)
  return(27) # 27+ weeks, don't take midpoint as all will be included
}


# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Initialize variables and load data
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Don't mess here
sex_vars = c('all_sexes','males','females')
sex_dict = list('males'=1,'females'=2)
age_vars = c('all_ages','under_30','from_30_to_49','over_50')
# Note that race is only available starting in 1971
race_vars = c('all_races','white_non_hispanic','black_non_hispanic','hispanic')
# If HISPAN in this list, worker is classified as hispanic 
hispanic_list = c(100,102,103,104,108,109,200,300,400,500,600,610,611,612)



# Load data
data_filepath = "../../../../public_github/projects/income-distributions/data_prep/ipums_data/cps_00009.xml"
raw_data = data_filepath %>% 
  read_ipums_ddi() %>%
  read_ipums_micro() %>% 
  # Only income people with non-negative income who were at least 16 in the previous year
  subset(INCTOT>=0 & AGE >= 17) %>%
  # Remove income NIU (not in universe)
  subset(INCTOT!=999999999) %>%
  # Remove income missing
  subset(INCTOT!=999999998) %>%
  # Only keep relevant years
  subset(YEAR >= min_year & YEAR <= max_year) %>%
  # Make CPI weight and convert income to 2019 dollars
  mutate(
    CPI_2020 = CPI99 / CPI_multiplier,
    real_income = INCTOT * CPI_2020
  )

# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Generate processed data for workers that spent at least 6 months in labor force
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
 
# Note: WKSUNEM2==9 should be NIU, should only have people that pretty much worked all year, but I have additional observations where people
# worked a few weeks (e.g., 10 weeks) because of the error. These people should be in universe with WKSUNEMP==0.
# I don't want to remove NIU people because all of these people worked (have already subsetted based on this)
# If I make everyone unemployed for 0 weeks, this will fix the problem (for people who worked all year, it will include them,
# And for people who only worke da few weeks, it will keep them if they worked over 26 weeks
# these as zero (either worked all year, or worked less than all year and should be 0 (this is an error))

# Get densities and estimate
raw_data %>%
  # Remove missing employment data
  subset(WKSWORK2 != 9)  %>% 
  # Remove people who didn't work at all last year (won't have unemployment data on these people as they're NIU)
  subset(WKSWORK2 != 0) %>% 
  # Remove missing unemployment data
  subset(WKSUNEM2 != 8) %>% 
  mutate(
    average_weeks_worked =  sapply(WKSWORK2,get_average_weeks_worked),
    average_weeks_unemployed = sapply(WKSUNEM2,get_average_weeks_unemployed),
    total_weeks_in_labor_force = average_weeks_worked + average_weeks_unemployed
  ) %>% 
  # Only keep people who were in the labor force at least 26 weeks last year
  subset(total_weeks_in_labor_force>=26) %>%
  process_data_and_save('in_labor_force',min_year,max_year,recompute_x_axis_maxes)

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# Generate processed data for workers who worked full-time, year round
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
raw_data %>%
  # Keep people who worked 50-52 weeks last year.
  subset(WKSWORK2==6) %>%
  # Keep people who worked full time last year
  subset(FULLPART==1) %>%
  process_data_and_save('full_time',min_year,max_year,recompute_x_axis_maxes)

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# Generate processed data following the FRED method
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 

# Note that age subsetting is slightly different from FRED, 
# which includes 14-15 year olds in some older years of data
raw_data %>%
  # Keep people with positive income (negative income removed in load_and_clean_data() )
  subset(INCTOT!=0) %>% 
  process_data_and_save('fred',min_year,max_year,recompute_x_axis_maxes)
