const solve = require('../src/to_solver_json')
const s = require('javascript-lp-solver')
const assert = require('assert')

const text = ' maximize: 12y - x_1;  row1: 1x_1 <= 3.4; y <= 3; int x_1; bin y;'

const result = s.Solve(solve.to_JSON(text)).result
assert.equal(result, 12)