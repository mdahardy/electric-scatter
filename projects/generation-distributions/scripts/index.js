import {
    scaleOrdinal,
    scaleThreshold,
    scaleLinear
} from 'd3-scale'

import {
    select,
    selectAll,
    mouse
} from 'd3-selection'

import {
    max,
    min
} from 'd3-array'

import {
    line,
    area,
    curveBasis
} from 'd3-shape'

import {
    interpolateArray,
    interpolateNumber
} from 'd3-interpolate'

import {
    transition
} from 'd3-transition'

import {
    easeLinear
} from 'd3-ease'

import {
    axisBottom,
    axisLeft
} from 'd3-axis'

import {
    json
} from 'd3-fetch'



export {
    scaleOrdinal,
    scaleThreshold,
    scaleLinear,
    select,
    selectAll,
    mouse,
    max,
    min,
    line,
    area,
    curveBasis,
    interpolateArray,
    interpolateNumber,
    transition,
    easeLinear,
    axisBottom,
    axisLeft,
    json
}

// {
//     "name": "income-distributions",
//     "version": "0.0.1",
//     "scripts": {
//       "prepublish": "rollup -c && uglifyjs d3.js -c -m -o d3.min.js"
//     },
//     "devDependencies": {
//       "d3-scale": "3.2.1",
//       "d3-selection": "1.4.1",
//       "d3-array": "2.4.0",
//       "d3-shape": "1.3.7",
//       "d3-interpolate": "1.4.0",
//       "d3-transition": "1.3.2",
//       "d3-ease": "1.0.6",
//       "d3-axis": "1.0.12",
//       "d3-fetch": "1.2.0",
//       "d3": "5.16.0",
//       "rollup": "0.36",
//       "rollup-plugin-node-resolve": "2",
//       "uglify-js": "2"
//     }
//   }
  