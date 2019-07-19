const assert = require('assert')

function flatten(array) {
  console.log(array)
  let result = []
  for (let a of array) {
    if (Array.isArray(a)) {
      let flattened = flatten(a)
      result = result.concat(flattened)
    } else {
      result.push(a)
    }
  }
  return result
}


const test_cases = [
  'where i = 1: 12_xi + 5_yi <= 123',
  'where t = 5: 3x_t + 2t >= 78',
  'where i = 1: where t = 4: x_it - y_it <= 0',
  'where i = 1 to 6:\n12x_i + 5y_i <= 123',
  'where\nt\n=\n1\nto\n5:\n3x_t + 2t >= 78',
  'where i=1 to 5  \n:\nwhere t = \n2 to 4: x_it\n - \ny_it <= 0'
]

const small_test = test_cases[2]
// for (let s of test_cases) {
//   assert.strictEqual(regex.test(s), true)
// }

function parseWhereStatement(line, name) {
  let constraints = []
  const index = line.indexOf(':')
  const where_statement = line.slice(0, index)
  // Get the assignment variable, and get the range of that variable.
  // Based on the previous regex test, there are at most and at least 2 numbers.

  // Match numbers
  const [value] = where_statement.match(/\d+/g)
  // The only word besides for is the assignment variable and 'to':
  // Slice 1 to ignore the first term.
  const variable = where_statement.match(/[a-zA-Z]+/g)[1]
  let env = {
    name: variable,
    value: parseInt(value)
  }

  const subscript_regex = /_\w+/g
  while (env.current <= env.end) {
    let expr = line.slice(index + 1).trim()
    const subscripts = expr.match(subscript_regex)
    const subscripts_transformed = subscripts.map(x => {
      return x.replace(env.name, env.current)
    })
    for (let i = 0; i < subscripts.length; i++) {
      expr = expr.replace(subscripts[i], subscripts_transformed[i])
    }
    env.current++
    constraints.push(eval(expr))
  }
  //  console.log(constraints)
  return flatten(constraints)
}

function eval(line, name) {
  let constraints = []
  const regex = /^where\s+[a-zA-Z]+\s*=\s*\d+\s*:/
  if (regex.test(line)) {
    constraints = parseWhereStatement(line, name)
  } else {
    return line
  }
  return constraints
}

const result = eval(small_test, '24')
console.log(result)