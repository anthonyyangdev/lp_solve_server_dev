const mathjs = require('mathjs')

const statement = 'set a = -12 * --15'


function parseSet(line) {
  const DELIMIT = 'set'
  const start = line.indexOf(DELIMIT)
  const len = DELIMIT.length

  const expr = line.slice(start + len)

  const EQUAL = '='

  const left = expr.slice(0, expr.indexOf(EQUAL)).trim()
  const right = expr.slice(expr.indexOf(EQUAL) + 1).trim()
  const validVariable = /^[a-zA-Z]\w*$/

  if (!validVariable.test(left))
    throw new Error('The variable name is not valid.')
  const value = mathjs.evaluate(right)
  return {
    name: left,
    value
  }
}


function eval(line) {
  const regex = /set\s+/
  const isSet = regex.test(line)
  return parseSet(line)
}

console.log(eval(statement))