library(Hmisc)
library(jsonlite)
library(dplyr)
options(scipen=999) # Prevent scientfic notation

if (!require("ipumsr")) stop("Reading IPUMS data into R requires the ipumsr package. It can be installed using the following command: install.packages('ipumsr')")

gens = list(
  'boomers' = c(1946,1964),
  'millennials' = c(1981,1996)
)

roundup_to <- function(x, to = 10, up = T){
  if(up) round(.Machine$double.eps^0.5 + x/to)*to else round(x/to)*to
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
  data$generation = ifelse(data$birth_year >= gens$boomers[1] & data$birth_year <= gens$boomers[2], "boomers",
                           ifelse(data$birth_year >= gens$millennials[1] & data$birth_year <=gens$millennials[2], "millennials",
                                  "other"))
  data = subset(data,generation!='other')
  data = subset(data,AGE==26) # Workers age 26 (subtract one year because workers reported income in previous year)
  # Worked 50-52 weeks last year
  data = subset(data,WKSWORK2==6)
  # Worked full time last year
  data = subset(data,FULLPART==1)
  return(data)
}


make_histogram_data = function(input_data){
  all_list = list()
  counter = 1
  sample_size_vec = vector();
  name_list = vector()
  all_max = 140000 # Got this from the density plot
  all_df = data.frame(
    'generation' = character(),
    'min_income' = double(),
    'n' = double(),
    'p' = double(),
    type = double()
  )
  for (type_i in c(10000,5000,1000,100)){
    for (generation_i in c('millennials','boomers')) {
      curr_data = subset(input_data,generation==generation_i)
      # Get the observations in each bin
      # get the sum of ASECWT for that subset
      # Save this as the N
      for (i in seq(type_i,all_max,type_i)){
        curr_subset = subset(curr_data,real_income<i & real_income>=i-type_i)
        roundup_num = ifelse(type_i %in% c(10000,5000),1000,100) # Need a bit more precision for smaller bins for displaying tooltip numbers
        curr_n = roundup_to(sum(curr_subset$ASECWT),to=roundup_num)
        #curr_p = round(curr_n/sum(curr_data$ASECWT),digits=3)
        curr_p = curr_n/sum(curr_data$ASECWT)
        curr_df = data.frame(
          'generation' = generation_i,
          'min_income' = i-type_i,
          'n' = curr_n,
          'p' = curr_p,
          type = type_i
        )
        all_df = rbind(all_df,curr_df)
      }
    } 
  }
  return (all_df)
}

# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Load data
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
data = load_and_clean_data()
histogram_data = make_histogram_data(data)
write.csv(histogram_data,"unprocessed_data/raw_histogram_data.csv", row.names = FALSE)

