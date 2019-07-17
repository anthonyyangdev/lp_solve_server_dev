const LP_SOLVER = require('javascript-lp-solver')

module.exports = function lpsolve(model) {
  const solution = LP_SOLVER.Solve(model)
  solution.result += model.constant
  const objective = LP_SOLVER.MultiObjective(model)
  return { solution, objective }
}