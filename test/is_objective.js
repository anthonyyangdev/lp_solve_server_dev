const REGEX = require('../REGEX/REGEX')
const Tester = require('./test_maker.js')

test_cases = [
  'max: 2x + y',
  'max:2x + y',
  'maximize: 4x - 23y',
  'minimize:- 2x + 50y',
  'max: 2x',
  'max:- y',
  'min:-      \n 12x    +   50 \ny',
  'max: 2x + 3y + 4z',
  'min:-2x-2y-4z',
  'max:\n2x-5t-\n12w',
  'max:\n2x-5t_12-\n12w_23',
  'max:2x-52.12w-12.w_23',
  'max:2x-52.12w-12.0w_23',
  'max: 2x + y'
]

const tester = new Tester(test_cases, REGEX.OBJECTIVE)
tester.runTest()
tester.mustFail('max:2x-52.12w-.w_23')
