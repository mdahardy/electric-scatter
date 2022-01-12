
# electric scatter income distributions app

This repo contains the source code for the [income distribution app](https://electricscatter.com/projects/income-distributions) on electric scatter. Note that because this app uses d3, if you want to run the app locally you have to launch a local web server in the [root electric scatter directory](https://github.com/mdahardy/electric-scatter).

## notes on data

Data for the density plots was obtained from the [IPUMS CPS](https://cps.ipums.org/cps/) database. The [data_prep/process_data.R](https://github.com/mdahardy/electric-scatter/tree/main/projects/income-distributions/data_prep/make_percentiles.R) script generates incomes percentiles and cached density estimates from the [raw IPUMS data](https://github.com/mdahardy/electric-scatter/tree/main/projects/income-distributions/data_prep/ipums_data) for plotting in the front end. This data is stored in the [processed_data](https://github.com/mdahardy/electric-scatter/tree/main/projects/income-distributions/processed_data) directory with a unique json file for every possible demographic combo.

* For simplicity, workers with negative incomes are excluded. Note that this only applies to about 0.2% of respondents. 
* A worker's age is defined as one less than their reported age in the survey. This is done as the CPS Annual Social and Economic Supplement (ASEC) is conducted in March or April, and asks respondents about their income during the previous calendar year.
* "All ages" is defined as workers who were at least 17 years old at the time of the survey.
* Note that while FRED uses the same dataset to estimate income statistics, the estimated income percentiles following the "FRED method" are slightly different from their estimates (e.g., see FRED [median income estimates](https://fred.stlouisfed.org/series/MEPAINUSA672N)). These differences are primarily due to different rules for selecting eligible workers (e.g., FRED includes workers 14 years old and younger are included before 1980), and because FRED doesn't adjust respondents' ages to match the reported year. 

* The following demographic are used to determine race:
    * White: White (race) and non-Hispanic (ethnicity)
    * Black: Black (race) and non-Hispanic (ethnicity)
    * Hispanic: Any race, Hispanic ethnicity. This includes respondents who reported Mexican, Mexican American, Mexicano/Mexicana, Chicano/Chicana, Mexican (Mexicano), Puerto Rican, Cuban, Colombian, Salvadorian, Central/South American, Central American (including Salvadorian), South American, or other Hispanic origin.

* The following definitions are used are used for worker selections:
    * Worked full-time, year round: Respondents who reported working full time and 50 or more weeks during the previous calendar year.
    * In labor force at least six months: The expected sum of weeks unemployed and weeks worked for the previous calendar year is at least 26. Because the ASEC asks respondents to report weeks in bins, the midpoint of each bin is used to approximate the number of weeks a worker spent in that state. For example, if a respondent reported being unemployed for between 1 and 13 weeks, I estimated that they spent 7 weeks unemployed.
    * Reported income: All respondents who reported postive income.

## notes on density plots

Density plots are constructed using Epanechnikov kernels with a bandwidth $10,000. To ensure that the area of each density plot over its positive support is constant and reduce bias in the curve from the bounded domain (visualized incomes are not allowed to be negative), the income data are mirrored. That is, data with incomes less than the bandwidth are copied and then appended to the dataset with their incomes multiplied by negative one. The density plots are then constructed by weighting these incomes by the IPUMS [ASECWT variable](https://cps.ipums.org/cps-action/variables/ASECWT#description_section) and estimating the income densities at $2,000 intervals. [d3.curveBasis](https://github.com/d3/d3-shape#curves) is then used to interpolate between these points and generate the final smoothed plot.