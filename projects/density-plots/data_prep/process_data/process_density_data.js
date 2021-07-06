import * as Fs from 'fs';

function getNewData(type){
    const og_data = JSON.parse(Fs.readFileSync(`../../../generation-distributions/processed_data/full_time/${type}/data.json`));
    const input_index = og_data['available_ages'].findIndex(d=>d==25);
    og_data.incomes[input_index].pop(); // Remove average income
    const new_data = {
        densities: og_data.densities[input_index].filter((d,i)=>i<=70), // Only include densities for tholds of less than or equal to 140k (tholds are 2k each, starting at 0 inclusive)
        incomes: og_data.incomes[input_index],
        mean_income: og_data.means['25'][0]
    };
    return new_data;
}

function processData(){
    const cleaned_boomer_data = getNewData('boomers');
    const cleaned_millennial_data = getNewData('millennials');
    let output_data = {
        'boomers': cleaned_boomer_data,
        'millennials': cleaned_millennial_data
    };
    output_data = JSON.stringify(output_data)
    const output_string = `../../processed_data/density_data.json`;
    Fs.writeFileSync(output_string,output_data, (err)=>{
        if (err){
            console.log('---ERROR---');
            console.log(err);
            throw err;
        }
    });
    console.log("-- Data written -- ")
}

processData();