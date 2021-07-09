
# electric scatter income distributions app

This repo contains the source code for the [income distribution app](https://electricscatter.com/projects/density-plots) on electric scatter. Note that because this app uses d3, you'll have to launch a local web server in the [root electric scatter directory](https://github.com/mdahardy/electric-scatter) if you want to run the app locally.

## notes on data

Data for the density plots was obtained from the [IPUMS CPS](https://cps.ipums.org/cps/) database. You can view the raw dataset and data extract in [data_prep/ipums_data](https://github.com/mdahardy/electric-scatter/tree/main/projects/income-distributions/data_prep/ipums_data). The [data_prep/generate_data.R](https://github.com/mdahardy/electric-scatter/tree/main/projects/income-distributions/data_prep/generate_data.R) script generates income percentiles from the raw IPUMS data, and [data_prep/process_data/process_data.js](https://github.com/mdahardy/electric-scatter/tree/main/projects/generation-distributions/data_prep/process_data/process_data.js) generates cached density estimates from these percentiles that are used in the app. 

* For simplicity, workers with negative incomes are excluded from analysis. Note that this only applies to about 0.2% of respondents. 
* A worker's age is defined as one less than their reported age in the survey. This is done as the CPS Annual Social and Economic Supplement (ASEC) is conducted in March or April, and asks respondents about their income during the previous calendar year.
* "All ages" is defined as workers who were at least 17 years old at the time of the survey.
* Note that wihle the FRED uses the same dataset to estimate income statistics, the estimated income percentiles following the "FRED method" are slightly different from their estimates (e.g., see the FRED [median income estimates](https://fred.stlouisfed.org/series/MEPAINUSA672N)). These differences are primarily due to different rules for selecting eligible workers (e.g., the FRED includes workers 14 years old and younger are included before 1980), and because the FRED doesn't adjust respondents' ages to match the reported year. 

* The following birth years are used to select races:
    * White: White (race) and non-hispanic (ethnicity)
    * Black: Black (race) and non-hispanic (ethnicity)
    * Hispanic: Any race, Hispanic ethnicity. This includes workers who reported Mexican, Mexican American, Mexicano/Mexicana, Chicano/Chicana, Mexican (Mexicano), Puerto Rican, Cuban, Colombian, Salvadorian, Central/Suuth American, Central American (including Salvadorian), South American, or other Hispanic origin.

* The following definitions are used are used for worker selections:
    * Worked full-time, year round: Workers who reported working 50 or more weeks during the previous calendar year.
    * In labor force at least six months: The expected sum of weeks unemployed and weeks worked for the previous calendar year is at least 26. Because the ASEC asks respondents to report weeks in bins, the midpoint of each bin is used to approximate the number of weeks a worker spent in that state. For example, if a worker reported being unemployed for between 1 and 13 weeks, I estimated that they spent 7 weeks unemployed.
    * Reported income: All workers who reported postive income. Note that this differs slightly from 

## notes on density plots

Density plots are constructed using epanechnikov kernels with a bandwidth $10,000. To prevent bias from the bounded domain (visualized incomes are not allowed to be below 0), kernels are weighted so that the area of the kernel over non-negative values equals 1. For example, a kernel centered at $0 has a weight of 2, as half of its area is over non-negative incomes, and kernels that only have positive support have weights of 1. For simplicity, the densities are estimated using a dataset of income percentiles in 0.05% increments. The density plot are constructed by evaluating the estimated density of these percentiles at $2,000 intervals, and then using [d3.curveBasis](https://github.com/d3/d3-shape#curves) to smooth these points and generate the density curve.