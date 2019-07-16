const solve = require('../src/to_solver_json')
const assert = require('assert')

const getConstant = solve.testable.getConstant
const parseRange = solve.testable.parseRangeConstraint
const addConstraint = solve.testable.addConstraintToModel
const parseConstraint = solve.testable.parseConstraint
const Model = solve.testable.Model

let expr = '2x + 42 - 231 + + + + + - - 12x'
let result = getConstant(expr)
assert.strictEqual(result, -189)

expr = ['2x', '3y', '+  23x', ' -- - 3y']
result = addConstraint(new Model(), 0, expr, 'min', 'any')
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { any: { min: 0 } },
  variables: { x: { any: 25 }, y: { any: 0 } }
})

expr = '3 - 4 - 32 < 2x + y <= 23'
result = parseRange(expr, new Model(), 'R2')
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { R2_1: { min: -33 }, R2_2: { max: 23 } },
  variables: { x: { R2_1: 2, R2_2: 2 }, y: { R2_1: 1, R2_2: 1 } }
})

expr = 'this: 3 - 4 - 32 < 2x + y <= 23'
result = parseConstraint(expr, new Model(), 'R2', solve.testable.CONSTRAINT_FORM.RANGE)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { this_1: { min: -33 }, this_2: { max: 23 } },
  variables: { x: { this_1: 2, this_2: 2 }, y: { this_1: 1, this_2: 1 } }
})


console.log('Passed')