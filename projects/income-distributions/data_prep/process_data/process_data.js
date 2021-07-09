// Before running this script, make sure you run makes_percentiles.R using the IPUMS raw data
import * as d3 from 'd3';
import * as Fs from 'fs';

// Params to change
const bw = 10000; // Check what it is in R
const thold_every = 2000; // thresholds start at 0, then thresholds at thold_every, thold_every*2, ...

// Don't mess
let has_started_function=false;
let total_processed = 0;
let max_x, num_tholds;

// Returns a function that computes the ep weight for a certain bandwidth at given point
function epanechnikov(bandwidth) {
    return function(point,dpoint,w_v){
        const weighted_difference =  Math.abs((point - dpoint) / bandwidth)
        if (weighted_difference < 1) return w_v * 0.75 * (1 - weighted_difference * weighted_difference) / bandwidth;
        return 0
    }
}

// Get the increase weight for bandwidths overlapping 0 to correct for 0-axis bias
function lessThanZeroWeights(datapoint,bandwidth){
    if (datapoint<0){
        // There shouldn't be any less than zero income data if the R script worked correctly
        console.log('---ERROR: LESS THAN ZERO DATA POINT---')
        throw "Negative Income Error"
    } else if (datapoint - bandwidth >= 0 ){
        // Kernel is entirely positive;
        return 1
    }
    // Kernel overlaps with negative values;
    // Return weight that's proportional to the proportion of the kernel that's below zero
    // That way, the area of the kernel that's non-negative will be 1 (this is done to mitigate the bias caused by having a discountinuous x axis)
    const x = datapoint+bandwidth
    const term_one =  x
    const term_two = x**3 / (3*bandwidth**2)
    const term_three = (x**2 * datapoint) / bandwidth**2
    const term_four = (datapoint**2 * x) / (bandwidth **2)
    const total_sum = term_one - term_two + term_three - term_four
    return 1 / (total_sum * (0.75/bandwidth))
}

function weightedKDE(kernel, thresholds, data,bw){
    let weight_vec = data.map(d=>lessThanZeroWeights(d,bw))
    return thresholds.map(t => [t, d3.mean( data, (d,ind) => kernel(t,d,weight_vec[ind]))]);
}

function make_sequence(min_num,max_num,step_size){
    let arr = [];
    const max_iter = (max_num-min_num)/step_size //inclusive
    for (let i=0;i<=max_iter;i++) arr.push( (i*step_size) + min_num );
    return arr
}

function filter_percentiles(index_array,income_array){
    let arr = []
    index_array.forEach(element => {
        arr.push(income_array[element])
    });
    return arr;
}

function writeToFile(data,path){
    const json = JSON.stringify(data)
    
    Fs.writeFileSync(path,json, (err)=>{
        if (err){
            console.log('---ERROR---')
            console.log(err)
            throw err
        }
    })
}

function makeDirectory(path){
    Fs.mkdirSync(path, { recursive: true }, (err) => {
        if (err) throw err;
    });
}


// Params for each density plot data, Should correspond with params in make_percentiles.R
const type_list = ['mine','fred','full_time']; // which workers to include
const sex_list = ['all','males','females']
const age_list = ['all','under_30','from_30_to_49','50_plus']
const race_list = ['all','white_non_hispanic','black_non_hispanic','hispanic']
const num_combinations = type_list.length*sex_list.length*age_list.length*race_list.length


// Generates saved income plot data for each year given input params
// Plots up to max_x_axis, which should be the same for every plot (as plots can be compared - you don't want one plot to be cut off before the other one)
// Saves plot data to processed_data directory
function generated_cached_data(curr_type,curr_sex,curr_age,curr_race,max_x_axis){
    const curr_string = `../unprocessed_data/${curr_type}/${curr_sex}/${curr_age}/${curr_race}/data.json`

    curr_sex=='all' ? curr_sex = 'all_sexes' : curr_sex = curr_sex;
    curr_age=='all' ? curr_age = 'all_ages' : curr_age = curr_age;;
    curr_race=='all' ? curr_race = 'all_races' : curr_race = curr_race;
    curr_age=='50_plus' ? curr_age = 'over_50' : curr_age = curr_age;
    const curr_saving_string = `../../processed_data/${curr_type}/${curr_sex}/${curr_age}/${curr_race}/data.json`
    const data = JSON.parse(Fs.readFileSync(curr_string))
    const x = d3.scaleLinear().domain([0, max_x_axis])
    const tholds = x.ticks(num_tholds)
    
    let density_obj = [];
    let simplified_percentiles = [];
    let means = {}
    let sample_sizes = {}
    let total_max = 0;
    let curr_x_axis_max = 0;
    const index_list = make_sequence(35,1955,40) // All the indexes for the 2-98th percentile, step size 2 (i.e., one percentile every 2nd percentile)

    // Loop through years, generated cached plot data for each and add to dictionary
    for (let year_i=1971;year_i<2021;year_i++){
        let year_data = data[year_i-1971]['incomes']
        const year_max = year_data[1955]
        if (year_max > curr_x_axis_max){
            curr_x_axis_max = year_max
        }
        // Get the density
        let curr_density = weightedKDE(epanechnikov(bw),tholds,year_data,bw)
        density_obj.push(curr_density.map(d=>d[1])) // don't need the tholds, will store this later
        let curr_max = d3.max(curr_density,d=>d[1]) // Need to only get the second element here ... 
        if (curr_max > total_max){
            total_max = curr_max
        }

        //  Get the mean
        const mean = data[year_i-1971]['mean']
        means[year_i] = mean

        // Get the filtered data for the year
        const filtered_income_data = filter_percentiles(index_list,year_data)
        filtered_income_data.push(mean[0])
        simplified_percentiles.push(filtered_income_data)
        
        // Get the sample size
        const curr_n = data[year_i-1971]['sample_size']
        sample_sizes[year_i] = curr_n
    }

    const transposed_incomes = simplified_percentiles[0].map((col, i) => simplified_percentiles.map(row => row[i]));
    let years_dict = [];
    for (let i=0;i<transposed_incomes.length;i++){
        let curr_dict = {
            name: i,
            vals: transposed_incomes[i]
        }
        years_dict.push(curr_dict)
    }

    // Generate the cached data
    const saving_obj = {
        densities: density_obj,
        y_max: total_max,
        x_max: curr_x_axis_max,
        incomes: simplified_percentiles,
        incomes_dict: years_dict,
        means: means,
    }

    // Save the cached data 
    const curr_saving_directory = `../../processed_data/${curr_type}/${curr_sex}/${curr_age}/${curr_race}`
    makeDirectory(curr_saving_directory)
    writeToFile(saving_obj, curr_saving_string);
    console.log(`Finished 2 ${curr_type}-${curr_sex}-${curr_age}-${curr_race}`)
    total_processed++;
    if (total_processed===num_combinations){
        console.log('-- -- -- -- -- -- -- -- -- ')
        console.log('-- -- -- FINISHED -- -- -- ')
        console.log('-- -- -- -- -- -- -- -- -- ')
    }
}


// Might want to do this with y as well ...
function findGlobalMaxXAndProcess(curr_type,curr_sex,curr_age,curr_race){
    const curr_string = `../unprocessed_data/${curr_type}/${curr_sex}/${curr_age}/${curr_race}/data.json`;
    const data = JSON.parse(Fs.readFileSync(curr_string));
    let total_max = 0;
    for (let year_i=1971;year_i<2021;year_i++){
        let curr_val = data[year_i-1971]['incomes'][1955]
        if (curr_val > total_max){
            total_max=curr_val;
        }
    }
    max_array.push(total_max)
    console.log(`Finished 1 ${curr_type}-${curr_sex}-${curr_age}-${curr_race}`);
    if (max_array.length==num_combinations & has_started_function===false){
        has_started_function=true;
        max_x = d3.max(max_array) + 15 * thold_every; // Make is slightly beyond to solve clip path issues - adds $30,000
        num_tholds = Math.floor(max_x/thold_every) // Makes it so tholds are done every thold_every value
        process_data();
    }
}

// This gets called after all the maxes for every ciombination have been found, and a global max can be computed
function process_data(){
    for (let type_i of type_list){
        for (let sex_i of sex_list){
            for (let age_i of age_list){
                for (let race_i of race_list){
                    console.log(`Processesing 2 ${type_i}-${sex_i}-${age_i}-${race_i}`)
                    generated_cached_data(type_i,sex_i,age_i,race_i,max_x)
                }
            }
        }
    }
}


// Run the script
// After the global x max is found (i.e., the highest 98th percentile of income for every year and param combination), then it gets the density plot data for each subset up to this global x max
// That is, the global x max needs to be found before the cached plot data can be generate
let max_array = [];

for (let type_i of type_list){
    for (let sex_i of sex_list){
        for (let age_i of age_list){
            for (let race_i of race_list){
                findGlobalMaxXAndProcess(type_i,sex_i,age_i,race_i);
            }
        }
    }
}
