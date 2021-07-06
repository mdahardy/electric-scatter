// Before running this script, make sure you run generate.R using the IPUMS raw data

const d3 = require('d3')
const Fs = require('fs')

// Params to change
const bw = 10000; // Check that it matches the bandwidth in the R script
const thold_every = 2000; // thresholds start at 0, then thresholds at thold_every, thold_every*2, ...

// Don't mess
let has_started_function=false;
let total_processed = 0;
let max_x


// Returns a function that computes the ep weight for a certain bandwidth at given point
function epanechnikov(bandwidth) {
    return function(point,dpoint,w_v){
        const weighted_difference =  Math.abs((point - dpoint) / bandwidth)
        if (weighted_difference < 1){
            return w_v * 0.75 * (1 - weighted_difference * weighted_difference) / bandwidth
        } else{
            return 0
        }
    }
}

// Get the increase weight for bandwidths overlapping with negative values to correct for 0-axis bias
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
    for (let i=0;i<=max_iter;i++){
        arr.push( (i*step_size) + min_num )
    }
    return arr
}

function filter_percentiles(index_array,income_array){
    let arr = []
    index_array.forEach(element => {
        arr.push(income_array[element])
    });
    return arr
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

// Generates saved income plot data for each year given input params
// Plots up to max_x_axis, which should be the same for every plot (as plots can be compared - you don't want one plot to be cut off before the other one)
// Saves plot data to processed_data directory
const type_list = ['full_time','mine','fred']
const generation_list = ['all','greatest','silent','boomers','gen_x','millennials','gen_z']
const num_combinations = type_list.length*generation_list.length

function generated_cached_data(curr_type,curr_generation,max_x_axis){
    const curr_string = `unprocessed_data/${curr_type}/${curr_generation}/data.json`

    if (curr_generation=='all') curr_generation = 'all_generations'
    const curr_saving_string = `../processed_data/${curr_type}/${curr_generation}/data.json`
    const data = JSON.parse(Fs.readFileSync(curr_string))
    const x = d3.scaleLinear().domain([0, max_x_axis])
    const tholds = x.ticks(num_tholds)
    
    let density_obj = [];
    let simplified_percentiles = [];
    let means = {}
    let sample_sizes = {}
    const index_list = make_sequence(35,1955,40) // All the indexes for the 2-98th percentile, step size 2
    let age_vec = [];
    let y_maxes = {};
    let x_maxes = {};
    let total_x_max = 0;
    let total_y_max = 0;


    for (let age_i=18;age_i<66;age_i++){
        if (age_i in data){
            age_vec.push(age_i)
            let age_data = data[age_i]['incomes']
            const age_max = age_data[1955]
            x_maxes[String(age_i)] = age_max;
            if (age_max>total_x_max) total_x_max = age_max;

            // Get the density
            let curr_density = weightedKDE(epanechnikov(bw),tholds,age_data,bw)
            density_obj.push(curr_density.map(d=>d[1])) // don't need the tholds, will store this later
            let curr_max = d3.max(curr_density,d=>d[1]) // Need to only get the second element here ... 
            y_maxes[String(age_i)] = curr_max;
            if (curr_max>total_y_max) total_y_max = curr_max;

            //  Get the mean
            const mean = data[age_i]['mean']
            means[age_i] = mean
            
            // Get the filtered data for the year
            const filtered_income_data = filter_percentiles(index_list,age_data)
            filtered_income_data.push(mean[0])
            simplified_percentiles.push(filtered_income_data)
            
            // Get the sample size
            const curr_n = data[age_i]['sample_size']
            sample_sizes[age_i] = curr_n
        }
    }
    const transposed_incomes = simplified_percentiles[0].map((col, i) => simplified_percentiles.map(row => row[i]));
    let ages_dict = [];
    for (let i=0;i<transposed_incomes.length;i++){
        let curr_dict = {
            name: i,
            vals: transposed_incomes[i]
        }
        ages_dict.push(curr_dict)
    }

    // Generate the cached density plot data
    const saving_obj = {
        densities: density_obj,
        y_maxes: y_maxes,
        x_maxes: x_maxes,
        global_y_max: total_y_max,
        global_x_max: total_x_max,
        incomes: simplified_percentiles,
        incomes_dict: ages_dict,
        means: means,
        available_ages: age_vec
    }

    // Save the cached density plot data
    const curr_saving_directory = `./processed_data/${curr_type}/${curr_generation}`
    makeDirectory(curr_saving_directory)
    writeToFile(saving_obj, curr_saving_string);
    console.log(`Finished 2 ${curr_type}-${curr_generation}`)
    total_processed++;
    if (total_processed===num_combinations){
        console.log('-- -- -- -- -- -- -- -- -- ')
        console.log('-- -- -- FINISHED -- -- -- ')
        console.log('-- -- -- -- -- -- -- -- -- ')
    }
}


// Might want to do this with y as well ...
function findGlobalMaxX(curr_type,curr_generation){
    const curr_string = `unprocessed_data/${curr_type}/${curr_generation}/data.json`
    const data = JSON.parse(Fs.readFileSync(curr_string))
    let total_max = 0;
    for (let age_i=18;age_i<66;age_i++){
        if (age_i in data){
            let curr_val = data[String(age_i)]['incomes'][1955]
            if (curr_val > total_max) total_max=curr_val;
        }
    }
    max_array.push(total_max)
    console.log(`Finished 1 ${curr_type}-${curr_generation}`)
    if (max_array.length==num_combinations & has_started_function===false){
        has_started_function=true;
        max_x = d3.max(max_array) + 15 * thold_every; // Make is slightly beyond to solve clip path issues
        console.log(max_x)
        num_tholds = Math.floor(max_x/thold_every) // Makes it so tholds are done every thold_every value
        process_data();
    }
}

// This gets called after all the maxes for every ciombination have been found, and a global max can be computed
function process_data(){
    for (type_i of type_list){
        for (generation_i of generation_list){
                console.log(`Processesing 2 ${type_i}-${generation_i}`)
                generated_cached_data(type_i,generation_i,max_x)
        }
    }
}


// Run the script
// After the global x max is found (i.e., the highest 98th percentile of income for every year and param combination), then it gets the density plot data for each subset up to this global x max
// That is, the global x max needs to be found before the cached plot data can be generate
let max_array = [];

for (type_i of type_list){
    for (generation_i of generation_list){
        findGlobalMaxX(type_i,generation_i)
    }
}
