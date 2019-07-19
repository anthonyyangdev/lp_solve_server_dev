module.exports = function removeComments(input) {
  return input.replace(/\/\*(.|\s)*\*\/|\/\/.*/g, '')
}