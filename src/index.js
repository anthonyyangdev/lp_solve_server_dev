// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import uuidv4 from 'uuid/v4';
// import shelljs from 'shelljs';
// import bodyParser from 'body-parser';

const fs = require('fs');
// const LP_SOLVE = './lp_solve/5.5.2.0/bin/lp_solve'
const LP_SOLVE = 'ls -la'

const cors = require('cors');
const uuidv4 = require('uuid/v4');
const shelljs = require('shelljs')
const bodyParser = require('body-parser')
const exec = require('child_process').execFile
const app = require('express')();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  next();
});

app.get('/'), (req, res) => {
  res.send('Hello World!')
}

app.post('/', async (req, res) => {
  var content = req.body.code
  var TEMP = `${uuidv4()}.lp`
  fs.appendFile(TEMP, content, function (err) {
    if (err) throw err;
  });

  //[TEMP, '-S', '-S8']
  await exec(LP_SOLVE, function (err, data) {
    fs.unlink(TEMP, function (e) {
      if (e) throw e;
    })

    if (err === null) {
      err = ''
    }

    console.log(data.toString())

    res.send({
      error: err,
      result: data
    })
  })
})

app.listen(process.env.PORT || 5000, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);