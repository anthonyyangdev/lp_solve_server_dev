const rxo = require('../REGEX/REGEX')

const TYPES = {
  INT: 'ints',
  BIN: 'binaries',
  UNRESTRICTED: 'unrestricted'
}
const REGEX = {
  is_blank: s => (rxo.BLANK).test(s),
  is_type_declaration: s => {
    if ((rxo.BINARY).test(s))
      return TYPES.BIN
    if ((rxo.INTEGER).test(s))
      return TYPES.INT
    if ((rxo.FREE).test(s))
      return TYPES.UNRESTRICTED
    return false
  },
  is_int: s => (rxo.INTEGER).test(s),
  is_bin: s => (rxo.BINARY).test(s),
  is_unrestricted: s => (rxo.FREE).test(s),
  is_objective: s => (rxo.OBJECTIVE).test(s),
  is_constraint: s => (rxo.CONSTRAINT).test(s),
  parse_lhs: s => {
    let arr = s.match(rxo.LHS)
    // Trim the empty space inside the terms
    arr = arr.map(d => d.replace(/\s+/, ''))
    return arr
  },
  parse_rhs: s => {
    const value = s.match(rxo.RHS)[0]
    return parseFloat(value)
  },
  parse_dir: s => {
    return s.match(/(<=|>=|\<|\>|=)/gi)[0]
  },
  parse_num: s => s.match(rxo.PARSE_NUM).slice(1).map(x => x.trim()),
  get_num: d => {
    let num = d.match(rxo.GET_NUM)
    // If it isn't a number, it might
    // be a standalone variable
    if (isNaN(parseFloat(num[0]))) {
      num = d[0] === '-' ? -1 : 1
    } else {
      num = num[0];
      num.replace(/\s*/, '')
    }
    return parseFloat(num)
  }, // Why accepting character \W before the first digit?
  get_word: d => d.match(rxo.WORD)[0]
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
  const ary = REGEX.parse_num(line);
  model[type] = model[type] || {};
  ary.forEach(function (d) {
    if (model[type][d])
      throw new Error(`Type constraint for ${d} was redeclared as ${my_type}. ${d} already is declared as type int.`)
    model[type][d] = 1
  })
  return model
}

function parseConstraint(line, model, constraint) {
  const constraints = {
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
    constraint = line.slice(0, separatorIndex).trim()
    if ((/(max|min)(imize)?/g).test(constraint)) {
      throw new Error(`The name of a constraint cannot be the type of an optimization.\nName Given: ${constraint}`)
    }
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
    is_constraint,
    is_type_declaration,
    is_objective } = REGEX
  let model = {
    opType: '',
    optimize: '_obj',
    constraints: {},
    variables: {}
  }
  let constraint = 1
  let noObjective = true
  for (let i = 0; i < input.length; i++) {
    // Get the string we're working with
    const currentLine = input[i];
    // Test to see if we're the objective
    if (is_objective(currentLine)) {
      if (noObjective)
        model = parseObjective(currentLine, model)
      else
        throw new Error('Error: multiple objectives found.')
      noObjective = false
    } else if (is_type_declaration(currentLine)) {
      const type = is_type_declaration(currentLine)
      model = parseTypeStatement(currentLine, model, type)
    } else if (is_constraint(currentLine)) {
      model = parseConstraint(currentLine, model, 'R' + constraint)
      constraint++
    } else {
      throw new Error(`Cannot parse at statement ${i + 1}:\nContent: ${currentLine}`)
    }
  }
  return model
}

function stringToArray(input) {
  const split_arr = input.split(';');
  if (!(/^\s*$/).test(split_arr[split_arr.length - 1]))
    throw new Error(`Cannot parse at statement ${split_arr.length}. Statements must end with ';'`)
  split_arr.pop()
  return split_arr.map(x => x.trim())
}

function to_JSON(input) {
  // Handle input if its coming
  // to us as a hard string
  // instead of as an array of
  // strings
  if (typeof input === 'string') {
    input = stringToArray(input)
  }
  // Start iterating over the rows
  // to see what all we have
  return parseArray(input);
}

module.exports = {
  to_JSON,
  testable: {
    stringToArray
  }
}