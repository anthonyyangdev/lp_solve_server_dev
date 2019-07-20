const removeComments = require('./removeComments')

function test(input, actual) {
  return removeComments(input) === actual
}

const test_case = [{
  input: '/*  */',
  actual: ''
}, {
  input: 'hello world/****\n\n\n\n*/',
  actual: 'hello world'
}, {
  input: '//This is a comment\nThis is not a comment',
  actual: '\nThis is not a comment'
}]

const result = test_case.map(x => test(x.input, x.actual))
console.log(result)

