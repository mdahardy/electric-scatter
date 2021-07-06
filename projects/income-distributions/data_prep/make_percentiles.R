library(Hmisc)
library(jsonlite)
library(dplyr)

if (!require("ipumsr")) stop("Reading IPUMS data into R requires the ipumsr package. It can be installed using the following command: install.packages('ipumsr')")

setwd("/Users/mhardy/Documents/personal_projects/income_distributions/R")
sex_vars = c('all','males','females')
sex_dict = list('males'=1,'females'=2)
age_vars = c('all','under_30','from_30_to_49','50_plus')
race_vars = c('all','white_non_hispanic','black_non_hispanic','hispanic') # Race only available 1970-2018
hispanic_list=c(100,102,103,104,108,109,200,300,400,500,401,410,411,412) # If HISPAN in this list, worker is classified as hispanic 

load_and_clean_data = function(){
  # Load data 
  ddi <- read_ipums_ddi("full_data/cps_00008.xml")
  data <- read_ipums_micro(ddi) # only about 9 million rows!
  
  # Clean data
  data = subset(data,data$INCTOT>=0) # Remove negative income people for simplicity
  data = subset(data,data$INCTOT!=999999999) # Income NIU (not in universe)
  data = subset(data,data$INCTOT!=999999998) # Income Missing
  data$CPI_19 = data$CPI99 * (1/min(data$CPI99)) # Make CPI weight for converting income to 2019 dollars
  data$real_income = data$INCTOT * data$CPI_19
  data = subset(data,AGE>=17) # Means worker is at least 16 in the previous year
  return(data)
}


# Function that converts subsetted data to readable json 
make_percentiles_years_list = function(input_data,first_year){
  percentile_vec = c(seq(0.0025,0.9975,0.0005))#,seq(0.901,0.99,0.001))
  all_list = list()
  counter = 1
  min_income = 10000
  min_year = 1000
  sample_size_vec = vector();
  for (year_i in first_year:2020){
    curr_data = subset(input_data,YEAR==year_i)
    curr_percentiles = wtd.quantile(curr_data$real_income,weights=curr_data$ASECWT,probs=percentile_vec)
    curr_min = min(curr_percentiles)
    if (curr_min<min_income){
      min_income=curr_min
      min_year = year_i
    }
    names(curr_percentiles) = NULL
    sample_size_vec = c(sample_size_vec,nrow(curr_data))
    all_list[[counter]] = list('incomes'=curr_percentiles,'sample_size'=sum(curr_data$ASECWT),'mean'=wtd.mean(curr_data$real_income,weights=curr_data$ASECWT))
    #print(wtd.mean(curr_data$INCTOT,weights=curr_data$ASECWT))
    counter = counter+1
  }
  names(all_list) = as.character(first_year:2020)
  return (all_list)
}


make_jsons = function(input_d,d_type){
  directory_str = "/Users/mhardy/Documents/personal_projects/income_distributions/development_repo/unprocessed_data/" # save in repo for easy js access
  for (sex_i in sex_vars){
    for (age_i in age_vars){
      for (race_i in race_vars){
          max_list=c(1962)
          print(paste(d_type,sex_i,age_i,race_i))
          # Subset sex
          if (sex_i!='all'){
            curr_dataset = subset(input_d,SEX==sex_dict[sex_i])
          } else{
            curr_dataset = input_d
          }
          # Subset age
          if (age_i=='under_30'){
            curr_dataset = subset(curr_dataset,AGE<31)
          } else if (age_i=='from_30_to_49'){
            curr_dataset = subset(curr_dataset,AGE>=31 & AGE <= 50)
          } else if (age_i=='50_plus'){
            curr_dataset = subset(curr_dataset,AGE>=51)
          }
          if (race_i=='white_non_hispanic'){
            curr_dataset = subset(curr_dataset,RACE==100)
            curr_dataset = subset(curr_dataset,HISPAN==0)
            max_list = c(max_list,1971)
          } else if (race_i=='black_non_hispanic'){
            curr_dataset = subset(curr_dataset,RACE==200)
            curr_dataset = subset(curr_dataset,HISPAN==0)
            max_list = c(max_list,1971)
          } else if (race_i=='hispanic'){
            curr_dataset = subset(curr_dataset,HISPAN %in% hispanic_list)
            max_list = c(max_list,1971)
          }
          
          # Make the percentile list to be converted to JSON
          curr_list = make_percentiles_years_list(curr_dataset,1971)
          
          # Convert subsetted dataframe to JSON
          jsonOBJ  = toJSON(curr_list) # Convert to json
          total_dir_string = paste0(directory_str,d_type,"/",sex_i,"/",age_i,"/",race_i,'/') # Path for the directory where the file lives
          if (dir.exists(total_dir_string)==F){ # If directories don't exist, create them
            dir.create(total_dir_string,recursive = T)
          }
          file_str = paste0(total_dir_string,'/data.json') # Add data.json (filename) to directory string
          write(jsonOBJ, file_str) # Write to directory
      }
    }
  }
}

# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Load data
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
data = load_and_clean_data()

# -- -- -- -- -- -- -- -- -- -- -- 
# Find workers that spent at least 6 months in labor force
# -- -- -- -- -- -- -- -- -- -- -- 
current_subset = subset(data, WKSWORK2 != 9) # Removes missing employment data
current_subset = subset(current_subset, WKSWORK2 != 0) # Removes people who didn't work at all last year (won't have unemployment data on these people as they're NIU)

current_subset$average_weeks_worked = ifelse(current_subset$WKSWORK2 == 1, 7, # 1 - 13 weeks
                                             ifelse(current_subset$WKSWORK2 == 2, 20, # 14-26 weeks
                                                    27)) # 27+ weeks


current_subset = subset(current_subset,WKSUNEM2 != 8) # Remove missing unemployment current_subset

# Note that there's a discontinuity at 1975/1976
current_subset$average_weeks_unemployed = ifelse(current_subset$WKSUNEM2 == 0, 0,
                                                 ifelse(current_subset$WKSUNEM2 == 1, 2.5, # 1-4
                                                        ifelse(current_subset$WKSUNEM2 == 2, 7.5, # 5 - 10 weeks
                                                               ifelse(current_subset$WKSUNEM2 == 3, 12.5, # 11- 14 weeks
                                                                      ifelse(current_subset$WKSUNEM2 == 4, 20.5, # 15 - 26 weeks
                                                                             ifelse(current_subset$WKSUNEM2 == 9, 0, # NIU, should only have people that pretty much worked all year, but I have additional observations where people
                                                                                    # worked a few weeks (e.g., 10 weeks) because of the error. These people should be in universe with WKSUNEMP==0.
                                                                                    # I don't want to remove NIU people because all of these people worked (have already subsetted based on this)
                                                                                    # If I make everyone unemployed for 0 weeks, this will fix the problem (for people who worked all year, it will include them,
                                                                                    # And for people who only worke da few weeks, it will keep them if they worked over 26 weeks
                                                                                    # these as zero (either worked all year, or worked less than all year and should be 0 (this is an error))
                                                                                    27))))))



# Only keep people who were in the labor force at least 26 weeks last year
current_subset$total_weeks_in_labor_force = current_subset$average_weeks_worked + current_subset$average_weeks_unemployed
current_subset = subset(current_subset,total_weeks_in_labor_force>=26)
# Export
make_jsons(current_subset,'mine')


# -- -- -- -- -- -- -- -- -- -- -- 
# Find workers who worked full-time, year round
# -- -- -- -- -- -- -- -- -- -- -- 
# Worked 50-52 weeks last year. Redefine current subset to minimize memory usage
current_subset = subset(data,WKSWORK2==6)
# Worked full time last year
current_subset = subset(current_subset,FULLPART==1)
# Export
make_jsons(current_subset,'full_time')

# -- -- -- -- -- -- -- -- -- -- -- 
# Find workers according to FRED method
# -- -- -- -- -- -- -- -- -- -- -- 
# Note that age subsetting is slightly different from FRED, which includes 14-15 year olds in some older years of data
# Income positive (negative income removed in load_and_clean_data() )
current_subset = subset(data,INCTOT!=0)
#Export
make_jsons(current_subset,'fred')
