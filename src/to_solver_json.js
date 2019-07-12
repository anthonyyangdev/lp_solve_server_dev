const INT = 'ints'
const BIN = 'binaries'
const UNRESTRICTED = 'unrestricted'
const REGEX = {
  /* jshint ignore:start */
  is_blank: s => (/^\W{0,}$/).test(s),
  is_int: s => (/^int\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i).test(s),
  is_bin: s => (/^bin\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i).test(s),
  is_unrestricted: s => (/^free\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i).test(s),
  is_objective: s => (/^(max|min)(imize)?\:\s*((\+|\-)?\s*\d*\.?\d*\s*[a-zA-Z](\_|\w)*)\s*((\+|\-){1}\s*\d*\.?\d*\s*[a-zA-Z](\_|\w)*)*$/i).test(s),
  is_constraint: s =>
    (/^([a-zA-Z]+\w*\:)?(\s*(\-|\+)?\s*\d*\.?\d*\s*[a-zA-Z](\_|\w)*)(\s*(\-|\+){1}\s*\d*\.?\d*\s*[a-zA-Z](\_|\w)*)*\s*(\<|\>)?\=?\s*\d+\.?\d*$/i).test(s),
  // (/(\>|\<){0,}\=/i).test(s),
  // Fixed to prevent (+ or -) from being attached to variable names.
  parse_lhs: s => {
    let arr = s.match(/(.*\:|(\-|\+)?\s*\d*\.?\d*\s*[a-zA-Z]+\w*)/gi)
    // Trim the empty space inside the terms
    arr = arr.map(d => d.replace(/\s+/, ''))
    return arr
  },
  parse_rhs: s => {
    const value = s.match(/(\-|\+)?\d+\.?\d*$/i)[0]
    return parseFloat(value)
  },
  parse_dir: s => {
    return s.match(/(<=|>=|\<|\>|=)/gi)[0]
  },
  parse_num: s => s.match(/[^\s|^\,]+/gi),
  get_num: d => {
    let num = d.match(/(\-|\+)?\d+\.?\d*/g)
    // If it isn't a number, it might
    // be a standalone variable
    if (num === null) {
      num = d[0] === '-' ? -1 : 1
    } else {
      num = num[0];
    }
    return parseFloat(num)
  }, // Why accepting character \W before the first digit?
  get_word: d => d.match(/[A-Za-z].*/)[0]
}

function parseObjective(input, model) {
  // Set up in model the opType
  model.opType = input.match(/(max|min)/gi)[0];
  // Pull apart lhs
  const ary = REGEX.parse_lhs(input).slice(1);

  // *** STEP 1 *** ///
  // Get the variables out
  ary.forEach(function (d) {
    // Get the number if it's there. This is fine.
    coeff = REGEX.get_num(d)

    // Get the variable name
    var_name = REGEX.get_word(d);

    // Make sure the variable is in the model
    model.variables[var_name] = model.variables[var_name] || {};
    model.variables[var_name]._obj = coeff;
  });
  return model
}

function parseTypeStatement(line, model, type) {
  const ary = REGEX.parse_num(line).slice(1);
  model[type] = model[type] || {};
  ary.forEach(function (d) {
    let my_type = type === INT ? 'int' : type === UNRESTRICTED ? 'free' : 'bin'
    if (model[INT] && model[INT][d]) {
      throw new Error(`Type constraint for ${d} was redeclared as ${my_type}. ${d} already is declared as type int.`)
    }
    if (model[UNRESTRICTED] && model[UNRESTRICTED][d]) {
      throw new Error(`Type constraint for ${d} was redeclared as ${my_type}. ${d} already is declared as type free.`)
    }
    if (model[BIN] && model[BIN][d]) {
      throw new Error(`Type constraint for ${d} was redeclared as ${my_type}. ${d} already is declared as type bin.`)
    }

    model[type][d] = 1
  })
  return model
}

function parseConstraint(line, model, constraint) {
  constraints = {
    '>=': "min",
    '<=': "max",
    '=': "equal",
    '<': 'max',
    '>': 'min'
  }
  var separatorIndex = line.indexOf(":");
  var constraintExpression
  if (separatorIndex === -1) {
    constraintExpression = line
  } else {
    constraint = line.slice(0, separatorIndex)
    constraintExpression = line.slice(separatorIndex + 1)
  }

  // Pull apart lhs
  const lhf = REGEX.parse_lhs(constraintExpression)

  // *** STEP 1 *** ///
  // Get the variables out
  lhf.forEach(function (d) {
    // Get the number if its there
    const coeff = REGEX.get_num(d);
    // Get the variable name
    const var_name = REGEX.get_word(d);

    // Make sure the variable is in the model
    model.variables[var_name] = model.variables[var_name] || {};
    model.variables[var_name][constraint] = coeff;
  });

  // *** STEP 2 *** ///
  // Get the RHS out
  rhs = REGEX.parse_rhs(line);
  // *** STEP 3 *** ///
  // Get the Constrainer out

  line = constraints[REGEX.parse_dir(line)];
  model.constraints[constraint] = model.constraints[constraint] || {};
  model.constraints[constraint][line] = rhs;

  return model
}

function parseArray(input) {
  const {
    is_bin,
    is_constraint,
    is_int,
    is_objective,
    is_unrestricted } = REGEX
  let model = {
    opType: '',
    optimize: '_obj',
    constraints: {},
    variables: {}
  }
  let constraint = 1
  let noObjective = true
  for (var i = 0; i < input.length; i++) {
    // Get the string we're working with
    // Check why currentLine is mutable.
    let currentLine = input[i];
    // Test to see if we're the objective
    if (is_objective(currentLine)) {
      if (noObjective)
        model = parseObjective(currentLine, model)
      else
        throw new Error('Error: multiple objectives found.')
      noObjective = false
    } else if (is_int(currentLine)) {
      model = parseTypeStatement(currentLine, model, INT)
    } else if (is_bin(currentLine)) {
      model = parseTypeStatement(currentLine, model, BIN)
    } else if (is_unrestricted(currentLine)) {
      model = parseTypeStatement(currentLine, model, UNRESTRICTED)
    } else if (is_constraint(currentLine)) {
      model = parseConstraint(currentLine, model, 'R' + constraint)
      constraint++
    } else {
      throw new Error(`Cannot parse at statement ${i + 1}:\nContent: ${currentLine}`)
    }
  }
  return model
}

module.exports = function to_JSON(input) {
  // Handle input if its coming
  // to us as a hard string
  // instead of as an array of
  // strings
  if (typeof input === "string") {
    input = input.split(';');
    console.log('Input', input)
    if (!(/\s*/).test(input[input.length - 1]))
      throw new Error(`Cannot parse at statement ${input.length}. Statements must end with ';'`)
    input.pop()
    input = input.map(x => x.trim())
  }

  // Start iterating over the rows
  // to see what all we have
  return parseArray(input);
}

