const to_JSON = require('../src/parser').to_JSON
const lpsolve = require('../src/lpsolve')
const assert = require('assert')

let text = 'maximize: 12y - x_1;  row1: 1x_1 <= 3.4; y <= 3; int x_1; bin y;'
let model = to_JSON(text)
let result = lpsolve(model).solution.result
assert.deepStrictEqual(result, 12)

text = 'maximize: 12y - x_1 + 23;  row1: 1x_1 <= 3.4; y <= 3; int x_1; bin y;'
model = to_JSON(text)
result = lpsolve(model).solution.result
assert.deepStrictEqual(result, 35)

text = 'min: 12y - x_1 + 23;  row1: 1x_1 <= 3.4; y <= 3; int x_1; bin y;'
model = to_JSON(text)
result = lpsolve(model).solution.result
assert.deepStrictEqual(result, 20)

text = 'min: 12y - x_1 - 23 + 5;  row1: 1x_1 <= 3.4; y <= 3; int x_1; bin y;'
model = to_JSON(text)
result = lpsolve(model).solution.result
assert.deepStrictEqual(result, -21)