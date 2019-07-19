const REGEX = require('../REGEX/REGEX')
const Tester = require('./test_maker.js')

test_cases = [
  '2x -    2y = 50',
  'x + y <= 12',
  '3x -\n 12y >= 334',
  '-x   + y  >  12',
  '-\nx   + \n y    = \n 12',
  'row1: 2x + y = 12',
  'row1:3x+t=123',
  'row_12: 3r_1 + 23y = 12',
  'ro12_423: 3r_4_1 - 12x + 123y  <= 34',
  '3r_4_1 - 12x + 123y  <= 34',
  'ew_23: 2x + 4t < 23',
  'ew_23   : 2x + 4t < 23'
]

const tester = new Tester(test_cases, REGEX.GENERAL_CONSTRAINT)
tester.runTest()
tester.mustFail('max1:2x-52.12w-..w_23 > 3')
tester.mustFail('max1:2x-52.12w-.w_23 > 3')
