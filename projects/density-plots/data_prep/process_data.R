library(Hmisc)
library(jsonlite)
library(dplyr)
options(scipen=999) # Prevent scientfic notation
if (!require("ipumsr")) stop("Reading IPUMS data into R requires the ipumsr package. It can be installed using the following command: install.packages('ipumsr')")

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- - VARIABLES - -- --
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 

# In general don't want to update this year as new data might conflict with the voiceover
# Note that 2020 data is for 2019
max_year = 2020

# This is the multiplier for putting everything into 2019 dollars
CPI_multiplier = 0.652	

# Bandwidth for density plots
density_bandwidth = 10000

gen_list = c('boomers','millennials')

# Birth year for both generations
gen_cutoffs = list(
  'boomers' = c(1946,1964),
  'millennials' = c(1981,1996))

# Max income to be plotted
x_axis_max = 140000

# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- - HELPER FUNCTIONS - -- --
# -- -- -- -- -- -- -- -- -- -- --
# -- -- -- -- -- -- -- -- -- -- -- 

# Loads data and restricts to 25 year-olds who worked full-time, year-round
density_app_load_clean_data = function(){
  raw_data_filepath = "../../../../public_github/projects/income-distributions/data_prep/ipums_data/cps_00009.xml"
  return(
    raw_data_filepath %>%
      read_ipums_ddi() %>%
      read_ipums_micro() %>%
      # Remove negative income people
      subset(INCTOT>=0) %>%
      # Income not in universe
      subset(INCTOT!=999999999) %>%
      # Income missing
      subset(INCTOT!=999999998) %>%
      mutate(
        CPI_2020 = CPI99 / CPI_multiplier,
        real_income = INCTOT * CPI_2020,
        birth_year = YEAR - AGE,
        generation = sapply(birth_year,get_generation)
      ) %>%
      subset(generation != 'other') %>%
      # Workers age 25 (subtract one year because workers reported income in previous year)
      subset(AGE == 26) %>%
      # Worked 50-52 weeks last year
      subset(WKSWORK2==6) %>%
      # Worked full time last year
      subset(FULLPART==1) %>%
      subset(YEAR <= max_year)
  )
}

get_generation = function(birth_year){
  for (gen_i in gen_list){
    if (between(birth_year,gen_cutoffs[gen_i][[1]][1],gen_cutoffs[gen_i][[1]][2])) return(gen_i)
  }
  return('other')
}

save_json = function(input_list,filename){
  # Convert subsetted dataframe to JSON
  json_obj = toJSON(input_list,digits=21,auto_unbox=T)
  # Make directory string and save
  file_str = paste0('../processed_data/',filename)
  write(json_obj, file_str) 
}

# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- - HELPER FUNCTIONS FOR HISTOGRAM
# -- -- -- -- -- -- -- -- -- -- --

round_to = function(x, to){
  return(round(x/to)*to)
}

make_histogram_data = function(input_data,x_max){
  hist_json = list()
  for (bin_width in c(100,1000,5000,10000)){
    string_bin = as.character(bin_width)
    hist_json[[string_bin]] = list()
    index = 1
    for (generation_i in gen_list) {
      generation_subset = subset(input_data,generation==generation_i)
      for (bin_i in seq(bin_width,x_max,bin_width)){
        bin_subset = subset(generation_subset,real_income<bin_i & real_income>=bin_i-bin_width)
        # Need a bit more precision for smaller bins for displaying tooltip numbers
        roundup_num = if (bin_width %in% c(10000,5000)) 1000 else 100 
        n = round_to(sum(bin_subset$ASECWT),roundup_num)
        p = n /sum(generation_subset$ASECWT)
        hist_json[[string_bin]][[index]] =  list(
          generation = generation_i,
          min_income = bin_i - bin_width,
          n = n,
          p = p
        )
        index = index + 1
      }
    }
  }
  return (hist_json)
}

# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- - HELPER FUNCTIONS FOR DENSITY PLOTS
# -- -- -- -- -- -- -- -- -- -- --

mirror_data = function(input_data,bandwidth){
  data_to_mirror = subset(input_data,real_income < bandwidth)
  data_to_mirror$real_income = data_to_mirror$real_income * -1
  return(rbind(input_data,data_to_mirror))
}

epanechnikov_kernel = function(threshold,bandwidth,kernel_center,asecwt) {
  weighted_difference = abs((threshold - kernel_center) / bandwidth)
  if (weighted_difference >= 1) return(0)
  return(asecwt * (0.75 * (1 - (weighted_difference^2)) / bandwidth))
}

get_threshold_density = function(threshold,bw,data_for_estimation){
  # get the data that will influence the estimated density at the current subset
  threshold_subset = subset(data_for_estimation, abs(real_income-threshold) < bw)
  # get the threshold density
  if (nrow(threshold_subset) == 0) return(0)
  return(sum(apply(threshold_subset,1,function(d) epanechnikov_kernel(threshold,bw,d['real_income'],d['ASECWT']))))
}

estimate_densities = function(input_data,x_max,bandwidth){
  thresholds = seq(0,x_max,by=2000)
  # Initialize zero vector of thresholds
  densities = rep(0.0,length(thresholds))
  normalization_factor = sum(input_data$ASECWT)
  plotting_data = input_data %>% 
    mirror_data(bandwidth) %>% 
    subset(real_income < x_max + bandwidth) %>%
    select(real_income,ASECWT)
  # cut off the threhsolds above the max of the data
  thresholds_to_loop = thresholds[thresholds < max(plotting_data$real_income) + bandwidth]
  # Loop over the threhoslds, get the density for each, an then normalize
  densities = sapply(thresholds_to_loop,get_threshold_density,bw=bandwidth,data_for_estimation = plotting_data) 
  densities = densities / normalization_factor
  # Append zeros for thresholds above the max in the data
  densities = c(densities,rep(0,length(thresholds) - length(thresholds_to_loop)))
  return(densities)
}

make_density_data = function(input_data,x_max,bandwidth){
  income_percentiles = seq(0.02,0.98,0.02)
  density_json = list()
  for (generation_i in gen_list) {
    gen_subset = subset(input_data,generation==generation_i)
    density_json[[generation_i]] = list(
      densities = estimate_densities(gen_subset,x_max,bandwidth),
      incomes = unname(wtd.quantile(gen_subset$real_income,weights=gen_subset$ASECWT,probs=income_percentiles)),
      mean_income = wtd.mean(gen_subset$real_income,weights=gen_subset$ASECWT)
    )
  }
  return(density_json)
}


# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 
# Load and process data
# -- -- -- -- -- -- -- -- -- -- -- 
# -- -- -- -- -- -- -- -- -- -- -- 

print('-- -- Loading raw data -- --')
millennial_boomer_data = density_app_load_clean_data()

# -- -- -- -- -- -- -- -- -- -- -- 
# Generate cached data for histograms
# -- -- -- -- -- -- -- -- -- -- -- 

print('-- -- Caching histogram data -- --')
millennial_boomer_data %>%
  make_histogram_data(x_axis_max) %>%
  save_json('histogram_data.json')

# -- -- -- -- -- -- -- -- -- -- -- 
# Generate cached data for density plots
# -- -- -- -- -- -- -- -- -- -- -- 
print('-- -- Caching density data -- --')
millennial_boomer_data %>%
  make_density_data(x_axis_max,density_bandwidth) %>%
  save_json('density_data.json')

