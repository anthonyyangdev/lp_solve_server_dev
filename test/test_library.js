const solve = require('../src/parser')
const assert = require('assert')

const getConstant = solve.testable.getConstant
const parseRange = solve.testable.parseRangeConstraint
const addConstraint = solve.testable.addConstraintToModel
const parseConstraint = solve.testable.parseConstraint

const parseObjective = solve.testable.parseObjective
const parseType = solve.testable.parseTypeStatement
const parseFor = solve.testable.parseForStatement

const Model = solve.testable.Model

let expr = 'for i = 1 to 3: x_i + y_i <= 23'
let result = parseFor(expr, new Model(), false, '1')
console.log(result.model)

expr = '2x + 42 - 231 + + + + + - - 12x'
result = getConstant(expr)
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

expr = 'this: 3 - 4 - 32 < 2x + -y <= 23'
result = parseConstraint(expr, new Model(), 'R2', solve.testable.CONSTRAINT_FORM.RANGE)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { this_1: { min: -33 }, this_2: { max: 23 } },
  variables: { x: { this_1: 2, this_2: 2 }, y: { this_1: -1, this_2: -1 } }
})

// Relational constraints 

expr = 'compare: 2x + 6y <= 12'
result = parseConstraint(expr, new Model(), 'R3', solve.testable.CONSTRAINT_FORM.RELATION)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { compare: { max: 12 } },
  variables: { x: { compare: 2 }, y: { compare: 6 } }
})

expr = 'compare: 2x + 6y <= 12x'
result = parseConstraint(expr, new Model(), 'R3', solve.testable.CONSTRAINT_FORM.RELATION)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { compare: { max: 0 } },
  variables: { x: { compare: -10 }, y: { compare: 6 } }
})

expr = 'compare: 2x + 6y + 12 - 32 + 2 = 12x - 12 + 4 - 2y'
result = parseConstraint(expr, new Model(), 'R3', solve.testable.CONSTRAINT_FORM.RELATION)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { compare: { equal: 10 } },
  variables: { x: { compare: -10 }, y: { compare: 8 } }
})

expr = 'compare: 2x + 6y + 12 ----- -   \n   - 32 + 2 = -12x - 12 + 4 - 2y'
result = parseConstraint(expr, new Model(), 'R3', solve.testable.CONSTRAINT_FORM.RELATION)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: { compare: { equal: 10 } },
  variables: { x: { compare: 14 }, y: { compare: 8 } }
})

// Parse objectives

expr = 'max: 2x + 6y'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'max',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 2 }, y: { _obj: 6 } },
  constant: 0
})


expr = 'max: --2x + 6y'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'max',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 2 }, y: { _obj: 6 } },
  constant: 0
})

expr = 'max: --2x + 4x + 6y'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'max',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 6 }, y: { _obj: 6 } },
  constant: 0
})

expr = 'max: --2x - 2x + 6y'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'max',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 0 }, y: { _obj: 6 } },
  constant: 0
})

expr = 'min: --2x - 2x + 6y'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'min',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 0 }, y: { _obj: 6 } },
  constant: 0
})

expr = 'minimize      : --2x - 2x + 6y'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'min',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 0 }, y: { _obj: 6 } },
  constant: 0
})

expr = 'maximize:--2x - 2\n\nx + 6y'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'max',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 0 }, y: { _obj: 6 } },
  constant: 0
})

expr = 'maximize:--2x - 2\n\nx + 6y + 23 -- 23  - \n - 23'
result = parseObjective(expr, new Model())
assert.deepStrictEqual(result, {
  opType: 'max',
  optimize: '_obj',
  constraints: {},
  variables: { x: { _obj: 0 }, y: { _obj: 6 } },
  constant: 69
})

expr = 'int x, y'
result = parseType(expr, new Model(), solve.testable.TYPES.INT)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: {},
  variables: {},
  ints: { x: 1, y: 1 }
})

expr = 'free x, y'
result = parseType(expr, new Model(), solve.testable.TYPES.UNRESTRICTED)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: {},
  variables: {},
  unrestricted: { x: 1, y: 1 }
})

expr = 'bin x, y'
result = parseType(expr, new Model(), solve.testable.TYPES.BIN)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: {},
  variables: {},
  binaries: { x: 1, y: 1 }
})

expr = 'int \nx, y'
result = parseType(expr, new Model(), solve.testable.TYPES.INT)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: {},
  variables: {},
  ints: { x: 1, y: 1 }
})

expr = 'free \nx\n, y'
result = parseType(expr, new Model(), solve.testable.TYPES.UNRESTRICTED)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: {},
  variables: {},
  unrestricted: { x: 1, y: 1 }
})

expr = 'bin \nx\n,\n \ny'
result = parseType(expr, new Model(), solve.testable.TYPES.BIN)
assert.deepStrictEqual(result, {
  opType: '',
  optimize: '_obj',
  constraints: {},
  variables: {},
  binaries: { x: 1, y: 1 }
})

console.log('Passed')