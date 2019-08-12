# lp_solve_server_dev

## About
This is web-hosted backend server app deployed on Heroku that receives requests to process and solve linear programming optimization problems. It is inspired by the limited accessibility to the lpsolve IDE for non-Windows operating systems, such as MacOS. A complementary frontend web-app also deployed on Heroku can be found in [this Github repository](https://github.com/ayang4114/lp_solve_online_dev).

## How it works
HTTP Requests are sent to the server either as a string or an array of strings. If sent as a string, then each statement must be ended with a single semi-colon (;). If sent as a string array, then each array entry is a separate statement and each of those statements does not end with semi-colon. The syntax is based on the [syntax used in the lpsolve IDE](http://lpsolve.sourceforge.net/5.5/), with additional implementations including for and summation statements. The interface used to access this server can be found on [this GitHub repository](https://github.com/ayang4114/lp_solve_online_dev).

## Syntax and Semantics
Please read the README of [this GitHub repository](https://github.com/ayang4114/lp_solve_online_dev), which is the frontend build that uses this server. The README contains documentation for the syntax and semantics used to write a linear algebraic model that this server can parse, interpret, and solve.

## Dependencies
- [jsLPSolver](https://github.com/JWally/jsLPSolver)
  - Linear programming algorithm and model.
- [mathjs](https://github.com/josdejong/mathjs)
  - Evaluate expressions as strings.
- [express](https://github.com/expressjs/express)
  - Host a server using NodeJS.
- [nodemon](https://github.com/remy/nodemon)
  - Initiate the app.
- [cors](https://github.com/expressjs/cors)
  - Provide Connect/Express middleware.
- [body-parser](https://github.com/expressjs/body-parser)
  - Parse incoming bodies in a middleware.

## License
ISC License

Copyright (c) 2019, Anthony Yang [ayang4114@gmail.com](ayang4114@gmail.com)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
