require('dotenv/config');
const fs = require('fs');
const LP_SOLVE = 'lp_solve'
const cors = require('cors')
const uuidv4 = require('uuid/v4')
const bodyParser = require('body-parser')
const exec = require('child_process').execFile
const app = require('express')()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * The different relevant sections produced by lp_solve given the 
 * parameters [-S, -S8].
 */
const sections = [
  'Model name',
  'Actual values of the constraints',
  'Objective function limits',
]

/**
 * Processes the data produced by [lp_solve] and returns a collection that maps
 * the {@var sections} names with the contents in {@var data}.
 * @param {string} data The data produced by [lp_solve].
 */
function generateReport(data) {
  var report = {}
  for (var i = 0; i < sections.length; i++) {
    var start = data.indexOf(sections[i])
    var end = (i === sections.length - 1) ? data.length : data.indexOf(sections[i + 1])
    var section_content = data.substring(start, end)
    report[sections[i]] = section_content
  }
  return report
}

app.use((req, res, next) => {
  next();
});

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
app.post('/', async (req, res) => {
  var content = req.body.content
  var TEMP = `${uuidv4()}.lp`
  fs.appendFile(TEMP, content, function (err) {
    if (err) throw err;
  });

  await exec(LP_SOLVE, [TEMP, '-S', '-S8'], function (err, data, stderr) {
    fs.unlink(TEMP, function (e) {
      if (e) throw e;
    })
    if (err === null) {
      err = ''
    }

    res.send({
      error: err,
      result: data,
      lp_solve_error: stderr,
      report: generateReport(data)
    })
  })
})

app.listen(process.env.PORT || 5000, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);