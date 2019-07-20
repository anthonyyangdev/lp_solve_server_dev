function removeComments(input) {
  input = input.replace(/\/\/.*/g, '')
  const DELIMIT = '/*'
  const ENDING = '*/'
  let index = input.indexOf(DELIMIT)
  const LEN = ENDING.length
  while (index >= 0) {
    let secondIndex = input.indexOf(ENDING)
    input = `${input.slice(0, index)}${input.slice(secondIndex + LEN)}`
    index = input.indexOf(DELIMIT)
  }
  return input
}

module.exports = removeComments