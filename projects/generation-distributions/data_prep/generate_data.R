library(Hmisc)
library(jsonlite)
library(dplyr)

if (!require("ipumsr")) stop("Reading IPUMS data into R requires the ipumsr package. It can be installed using the following command: install.packages('ipumsr')")
gens = list(
  'greatest' = c(1901,1927),
  'silent' = c(1928, 1945),
  'boomers' = c(1946,1964),
  'gen_x' = c(1965,1980),
  'millennials' = c(1981,1996),
  'gen_z' = c(1997,2012)
)

generations_list = c('all','greatest','silent','boomers','gen_x','millennials','gen_z')

get_generation = function(input){
  if (input >= gens$greatest[1] & input <= gens$greatest[2]) return('greatest')
  if (input >= gens$silent[1] & input <= gens$silent[2]) return('silent')
  if (input >= gens$boomers[1] & input <= gens$boomers[2]) return('boomers')
  if (input >= gens$gen_x[1] & input <= gens$gen_x[2]) return('gen_x')
  if (input >= gens$millennials[1] & input <= gens$millennials[2]) return('millennials')
  if (input >= gens$gen_z[1] & input <= gens$gen_z[2]) return('gen_z')
  return('other')
}

load_and_clean_data = function(){
  # Load data 
  ddi <- read_ipums_ddi("../../income-distributions/data_prep/ipums_data/cps_00008.xml")
  data <- read_ipums_micro(ddi) # only about 9 million rows!
  # Clean data
  data = subset(data,data$INCTOT>=0) # Remove negative income people
  data = subset(data,data$INCTOT!=999999999) # Income NIU
  data = subset(data,data$INCTOT!=999999998) # Income Missing
  data$CPI_19 = data$CPI99 * (1/min(data$CPI99)) # Need to check that this is working correctly 
  data$real_income = data$INCTOT * data$CPI_19
  data$birth_year = data$YEAR - (data$AGE)
  data$generation = sapply(data$birth_year, get_generation)
  data = subset(data,generation!='other')
  data = subset(data,AGE>=19 & AGE <=66) # Workers age 18 - 65 (subtract one year because workers reported income in previous year)
  return(data)
}

make_jsons = function(data,worker_type){
  for (generation_i in generations_list){
    print(paste("-- -- -- -- Processing",worker_type,generation_i,"-- -- -- --"))
    curr_generation_data = if (generation_i !='all') subset(data,generation==generation_i) else data
    curr_list = make_percentiles_years_list(curr_generation_data,generation_i,worker_type)
    jsonOBJ  = toJSON(curr_list) # Convert to json
    total_dir_string = paste0("unprocessed_data/",worker_type,"/",generation_i) # Path for the directory where the file lives
    if (dir.exists(total_dir_string)==F)  dir.create(total_dir_string,recursive = T) # If directories don't exist, create them
    print(paste('-- -- -- -- Writing',worker_type,generation_i,"-- -- -- --"))
    file_str = paste0(total_dir_string,'/data.json') # Add data.json (filename) to directory string
    write(jsonOBJ, file_str) # Write to directory
  }
}

make_percentiles_years_list = function(input_data,generation_type,worker_type){
  percentile_vec = c(seq(0.0025,0.9975,0.0005))
  all_list = list()
  counter = 1
  sample_size_vec = vector();
  name_list = vector()
  for (age_i in 19:66){
    curr_data = subset(input_data,AGE==age_i)
    num_in_sample = nrow(curr_data)
    if (num_in_sample > 125){
      curr_percentiles = wtd.quantile(curr_data$real_income,weights=curr_data$ASECWT,probs=percentile_vec)
      names(curr_percentiles) = NULL
      sample_size_vec = c(sample_size_vec,nrow(curr_data))
      all_list[[counter]] = list('incomes'=curr_percentiles,'sample_size'=sum(curr_data$ASECWT),'mean'=wtd.mean(curr_data$real_income,weights=curr_data$ASECWT))
      counter = counter+1
      name_list = c(name_list,age_i-1)
    } else{
      # Note: Age of worker in the previous year (where their income is being reported) will be their current age minus 1
      print(paste("!!!! Insufficient data flag:",generation_type,as.character(age_i-1),worker_type))
    }
  }
  names(all_list) = name_list
  return (all_list)
}

# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Load data
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 

data = load_and_clean_data()

# -- -- -- -- -- -- -- -- -- -- -- 
# Find workers who worked full-time, year round
# -- -- -- -- -- -- -- -- -- -- -- 
# Worked 50-52 weeks last year
current_subset = subset(data,WKSWORK2==6)
# Worked full time last year
current_subset = subset(current_subset,FULLPART==1)
make_jsons(current_subset,'full_time')

# -- -- -- -- -- -- -- -- -- -- -- 
# Find workers that spent at least 6 months in labor force
# -- -- -- -- -- -- -- -- -- -- -- 

get_average_weeks_worked = function(input){
  if (input == 1) return(7)  # 1 - 13 weeks
  if (input == 2) return(20) # 14-26 weeks
  return(27) # 27+ weeks, don't need to take midpoint as they'll be included automatically
}

get_average_weeks_unemployed = function(input){
  if (input==0) return(0)
  if (input==1) return (2.5) # 1-4
  if (input==2) return (7.5)  # 5 - 10 weeks
  if (input==3) return(12.5) # 11- 14 weeks
  if (input==4) return(20.5) # 15 - 26 weeks
  if (input==9) return(0)
  return(27) # 27+ weeks, don't need to take midpoint as they'll be included automatically
}
# Note: WKSUNEM2==9 should be NIU, should only have people that pretty much worked all year, but I have additional observations where people
# worked a few weeks (e.g., 10 weeks) because of the error. These people should be in universe with WKSUNEMP==0.
# I don't want to remove NIU people because all of these people worked (have already subsetted based on this)
# If I make everyone unemployed for 0 weeks, this will fix the problem (for people who worked all year, it will include them,
# And for people who only worke da few weeks, it will keep them if they worked over 26 weeks
# these as zero (either worked all year, or worked less than all year and should be 0 (this is an error))

current_subset = subset(data, WKSWORK2 != 9) # Removes missing employment data
current_subset = subset(current_subset, WKSWORK2 != 0) # Removes people who didn't work at all last year (won't have unemployment data on these people as they're NIU)

current_subset$average_weeks_worked = sapply(current_subset$WKSWORK2,get_average_weeks_worked)
current_subset = subset(current_subset,WKSUNEM2 != 8) # Remove missing unemployment data

# Note that there's a discontinuity at 1975/1976
current_subset$average_weeks_worked = sapply(current_subset$WKSWORK2,get_average_weeks_worked)

# Only keep people who were in the labor force at least 26 weeks last year
current_subset$total_weeks_in_labor_force = current_subset$average_weeks_worked + current_subset$average_weeks_unemployed
current_subset = subset(current_subset,total_weeks_in_labor_force>=26)
# Export
make_jsons(current_subset,'mine')


# -- -- -- -- -- -- -- -- -- -- -- 
# Find workers according to FRED method
# -- -- -- -- -- -- -- -- -- -- -- 
# Note that age subsetting is slightly different from FRED, which includes 14-15 year olds in some older years of data
# Income not 0
current_subset = subset(data,INCTOT!=0)
# Export
make_jsons(current_subset,'fred')