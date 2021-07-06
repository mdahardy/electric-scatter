import * as Fs from 'fs';
import parse from 'csv-parse';

function processData(){
    Fs.readFile(`../unprocessed_data/raw_histogram_data.csv`, function (err, fileData) {
        parse(fileData, {columns: false, trim: true}, function(err, uncleaned_data) {
          // Your CSV data is in an array of arrys passed to this callback as rows.
          const cleaned_data = {};
          for (let type_i of [100,1000,5000,10000]){
              for (let generation_i of ['millennials','boomers']){
                const curr_rows = uncleaned_data.filter(d=>d[4]==type_i && d[0]==generation_i);
                const curr_array = [];
                for (let obs_i of curr_rows){
                    curr_array.push({
                        generation: generation_i,
                        min_income: +obs_i[1],
                        n: +obs_i[2],
                        p: +obs_i[3]
                    })
                }
                if (cleaned_data[type_i]){
                    cleaned_data[type_i] = cleaned_data[type_i].concat(curr_array);
                } else{
                    cleaned_data[type_i] = curr_array;
                }
              }
          }
            Fs.writeFileSync('../../processed_data/histogram_data.json',JSON.stringify(cleaned_data), (err)=>{
                    if (err){
                        console.log('---ERROR---');
                        console.log(err);
                        throw err;
                    }
            });
        });
    });
}

processData();