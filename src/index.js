// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import uuidv4 from 'uuid/v4';
// import shelljs from 'shelljs';
// import bodyParser from 'body-parser';

const fs = require('fs');
const LP_SOLVE = 'lp_solve/5.5.2.0/bin/lp_solve'
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const shelljs = require('shelljs')
const bodyParser = require('body-parser')
const exec = require('child_process').execFile
const app = require('express')();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sections = [
  'Model name',
  'Actual values of the constraints',
  'Objective function limits',
]

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

app.post('/', async (req, res) => {
  var content = req.body.content
  var TEMP = `${uuidv4()}.lp`
  fs.appendFile(TEMP, content, function (err) {
    if (err) throw err;
  });

  await exec(LP_SOLVE, [TEMP, '-S', '-S8'], function (err, data) {
    fs.unlink(TEMP, function (e) {
      if (e) throw e;
    })

    if (err === null) {
      err = ''
    }

    res.send({
      error: err,
      result: data,
      report: generateReport(data)
    })
  })
})

app.listen(process.env.PORT || 5000, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);