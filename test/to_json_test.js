const solve = require('../src/to_solver_json')
const s = require('javascript-lp-solver')

const text = ' maximize: 12y - x_1;  row1: x_1 <= 3.4; y <= 3; int x_1; bin x_1;'

console.log((solve(text)))