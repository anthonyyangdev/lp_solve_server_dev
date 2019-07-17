require('dotenv/config');
const parse = require('./parser').to_JSON
const lpsolve = require('./lpsolve')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = require('express')()

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * The different relevant sections produced by lp_solve given the 
 * parameters [-S, -S8].
 */
// const sections = [
//   'Model name',
//   'Actual values of the constraints',
//   'Objective function limits',
// ]

function listAllSolutions(result, solution) {
  let response = `Objective function value: ${result}\n\n`
  let max_length = 0;
  for (var variable in solution) {
    max_length = Math.max(variable.length, max_length)
  }
  for (var variable in solution) {
    let spaces = max_length - variable.length
    response += variable
    for (var i = 0; i < spaces; i++) {
      response += ' '
    }
    response += `: ${solution[variable]}\n`
  }
  return response
}

function processSolution(solution) {
  let response = "";
  ({ bounded, feasible, result, ...solution } = solution)
  response += feasible ? 'The solution is feasible.\n' : 'The solution is not feasible.\n'
  response += bounded ? 'The solution is bounded.\n' : 'The solution is not bounded.\n'
  response += result === null ? 'There are no solutions.' : listAllSolutions(result, solution)
  return response
}

function processObjective(objective) {
  return objective
}

function processSolver(solver) {
  //  console.log(solver.lastSolvedModel.tableau.model.constraints)
  return {}
}

/**
 * Processes the data produced by [lp_solve] and returns a collection that maps
 * the {@var sections} names with the contents in {@var data}.
 * @param {string} solution The solution data produced by [lp_solve].
 * @param {string} objective The information about objectives.
 * Model/Solution
 * 
 * Constraints information
 * 
 * Objective Function Limits
 */
function generateReport(solution, objective, solver) {
  return {
    solution: processSolution(solution),
    objective: processObjective(objective),
    analysis: processSolver(solver)
  }
}

app.get('/'), (req, res) => {
  res.send('Hello World!')
}

/**
 * Main API call.
 * Given the contents from the caller, we create a new file in the server system 
 * files whose name must not be common with the rest of the files in the system.
 * 
 * Write the {@var content} into the new file and perform lp_solve with 
 * parameters [-S, -S8] using the {@function execFile} function of
 * {@package child_process}.
 * 
 * After processing the file, delete the file from the server system.
 * Return any errors and data produced by the child_process execution.
 * 
 * Requires: The lp_solve library.
 */
app.post('/', (req, res) => {
  const content = req.body.content
  try {
    var formatted_model = parse(content)
  } catch (e) {
    res.send({
      error: {
        msg: e.message
      }
    })
  }
  const { solution, objective } = lpsolve(formatted_model)
  res.send({
    result: generateReport(solution, objective, ''),
  })
})

app.listen(process.env.PORT || 5000, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);