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
  'sum [i = 1 to 6] (12_xi + 5_yi) <= 123',
  'sum [t = 1 to 5] (3x_t + 2t) >= 78',
  'sum [i = 1 to 6] (\n12x_i + 5y_i) <= 123',
  'sum\n[t\n=\n1\nto\n5] (\n3x_t + 2t) >= 78',
  'sum [i = 1 to 3] (sum [t = 1 to 3] (2x_it - 3y_it))'
]

const small_test = test_cases[4]
// for (let s of test_cases) {
//   assert.strictEqual(regex.test(s), true)
// }

function parseSummation(line, name) {
  const front = line.indexOf('(')
  const last = line.lastIndexOf(')')
  const sum_statement = line.slice(0, front).trim()
  // Get the assignment variable, and get the range of that variable.
  // Based on the previous regex test, there are at most and at least 2 numbers.

  // Match numbers
  const [start, end] = sum_statement.match(/\d+/g)
  // The only word besides for is the assignment variable and 'to':
  // Slice 1 to ignore the first term.
  const variable = sum_statement.match(/[a-zA-Z]+/g)[1]
  let env = {
    name: variable,
    current: parseInt(start),
    end: parseInt(end)
  }

  let expression = line.slice(front + 1, last).trim()
  expression = eval(expression)
  if (typeof expression !== 'string') {
    throw new Error('No you cannot.')
  }

  const remaining = line.slice(last + 1).trim()
  let full_expression = ''
  const subscript_regex = /_\w+/g
  while (env.current <= env.end) {
    const subscripts = expression.match(subscript_regex)
    const subscripts_transformed = subscripts.map(x => {
      return x.replace(env.name, env.current)
    })
    let expr = expression
    for (let i = 0; i < subscripts.length; i++) {
      expr = expr.replace(subscripts[i], subscripts_transformed[i])
    }
    full_expression += env.current === env.end ? `${expr} ${remaining}` : `${expr} + `
    env.current++
  }
  return full_expression
}

function eval(line, name) {
  const regex = /^sum\s*\[\s*[a-zA-Z]+\s*=\s*\d+\s+to\s+\d+\s*\]\s*\(\s*.*\s*\)/
  if (regex.test(line)) {
    return parseSummation(line, name)
  } else {
    return line
  }
}

const result = eval(small_test, '24')
console.log(result)