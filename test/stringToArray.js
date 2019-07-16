const stringToArray = require('../src/to_solver_json').testable.stringToArray

const text = ' maximize: 12y - x_1;    row1: x_1 <= 3.4; y <= 3; int x_1; bin x2;'
const res = stringToArray(text)
console.log(res)