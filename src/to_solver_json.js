const rxo = require('../REGEX/REGEX')
const assert = require('assert')
const mathjs = require('mathjs')

const TYPES = {
  INT: 'ints',
  BIN: 'binaries',
  UNRESTRICTED: 'unrestricted'
}
const CONSTRAINT_FORM = {
  RANGE: 'RANGE',
  RELATION: 'RELATION'
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
  is_objective: s => (rxo.OBJECTIVE).test(s),
  is_constraint: s => {
    if (rxo.RELATION_CONSTRAINT.test(s)) {
      return CONSTRAINT_FORM.RELATION
    } else if (rxo.RANGE_CONSTRAINT.test(s)) {
      return CONSTRAINT_FORM.RANGE
    } else {
      return false
    }
  },
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
  parse_relations: s => {
    return s.match(/(<=|>=|[>=<])/g)
  },
  parse_constants: s => {
    return s.match(rxo.TERMS).map(x => x.trim()).filter(x => rxo.CONSTANT.test(x))
  },
  parse_variables: s => {
    let terms = s.match(rxo.TERMS)
    return terms.map(x => x.trim()).filter(x => rxo.VARIABLE.test(x))
  },
  parse_num: s => s.match(rxo.PARSE_NUM).slice(1).map(x => x.trim()),
  get_num: d => {
    let num = d.match(rxo.GET_NUM)
    if (num[0] === undefined)
      throw new Error('Server error. Source: get_num')
    else {
      num = num[0].replace(/\s*/g, '')
    }

    // If it isn't a number, it might
    // be a standalone variable
    let value = 1
    try {
      value = mathjs.evaluate(num)
    } catch (e) {
      value = mathjs.evaluate(`${num}1`)
    }
    return value
  }, // Why accepting character \W before the first digit?
  get_word: d => d.match(rxo.WORD)[0]
}

function Model() {
  return {
    opType: '',
    optimize: '_obj',
    constraints: {},
    variables: {}
  }
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

const relation = {
  '>=': "min",
  '<=': "max",
  '=': "equal",
  '<': 'max',
  '>': 'min'
}

const inverseRelation = {
  '>=': 'max',
  '>': 'max',
  '<=': 'min',
  '<': 'min',
  '=': 'equal',
}


function verifyRange(first_relation, second_relation) {

  const conflict_error = () => {
    throw new Error(`Cannot use ${first_relation} and ${second_relation} in the same range constraint.`)
  }

  const equal_error = () => {
    throw new Error(`Cannot use '=' in a range constraint. Use it separately instead.`)
  }
  switch (first_relation) {
    case '>=':
    case '>':
      switch (second_relation) {
        case '<':
        case '<=':
          conflict_error()
        case '=':
          equal_error()
        default:
          break
      }
      break
    case '=':
      equal_error()
    case '<':
    case '<=':
      switch (second_relation) {
        case '>':
        case '>=':
          conflict_error()
        case '=':
          equal_error()
        default:
          break
      }
      break
    default:
      throw new Error('Error in the server.')
  }
}

function getConstant(line) {
  const constants = REGEX.parse_constants(line)
  if (constants.length === 0)
    return 0
  let c = ''
  for (let i = 0; i < constants.length; i++) {
    c += i === constants.length - 1 ? constants[i] : `${constants[i]} +`
  }
  const number = mathjs.evaluate(c)
  return number
}

function addConstraintToModel(model, constant, terms, relation, name) {
  // *** STEP 1 *** ///
  // Get the variables out
  terms.forEach(function (d) {
    // Get the number if its there
    let coeff = REGEX.get_num(d);
    coeff = mathjs.evaluate(coeff)
    // Get the variable name
    const var_name = REGEX.get_word(d);
    // Make sure the variable is in the model
    model.variables[var_name] = model.variables[var_name] || {};
    let current_value = model.variables[var_name][name]
    model.variables[var_name][name] = current_value ? current_value + coeff : coeff;
  });
  model.constraints[name] = model.constraints[name] || {};
  model.constraints[name][relation] = constant;

  return model
}

function parseRangeConstraint(line, model, name) {
  let relations = REGEX.parse_relations(line)
  assert.strictEqual(2, relations.length)
  verifyRange(relations[0], relations[1])

  const r1_loc = line.indexOf(relations[0])
  const r1_len = relations[0].length
  const r2_loc = line.lastIndexOf(relations[1])
  const r2_len = relations[1].length

  const center = line.slice(r1_loc + r1_len, r2_loc).trim()
  const C = getConstant(center)
  const variables = REGEX.parse_variables(center)

  let left = line.slice(0, r1_loc).trim()
  left = mathjs.evaluate(left) - C

  let right = line.slice(r2_loc + r2_len).trim()
  right = mathjs.evaluate(right) - C

  model = addConstraintToModel(model, left, variables, inverseRelation[relations[0]], `${name}_1`)
  model = addConstraintToModel(model, right, variables, relation[relations[1]], `${name}_2`)

  return model
}

function parseConstraint(line, model, constraint, form) {

  var separatorIndex = line.indexOf(":");
  var constraintExpression
  if (separatorIndex === -1) {
    constraintExpression = line
  } else {
    constraint = line.slice(0, separatorIndex).trim()
    if ((/(max|min)(imize)?/).test(constraint)) {
      throw new Error(`The name of a constraint cannot be the type of an optimization.\nName Given: ${constraint}`)
    }
    constraintExpression = line.slice(separatorIndex + 1).trim()
  }

  if (form === CONSTRAINT_FORM.RANGE) {
    return parseRangeConstraint(constraintExpression, model, constraint)
  }

  throw new Error('Not implemented')

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

  line = relation[REGEX.parse_dir(line)];
  model.constraints[constraint] = model.constraints[constraint] || {};
  model.constraints[constraint][line] = rhs;

  return model
}

function parseArray(input) {
  const {
    is_constraint,
    is_type_declaration,
    is_objective } = REGEX
  let model = new Model()
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
      const constraint_form = is_constraint(currentLine)
      model = parseConstraint(currentLine, model, 'R' + constraint, constraint_form)
      constraint++
    } else {
      throw new Error(`Cannot parse at statement ${i + 1}:\nContent: ${currentLine}`)
    }
  }
  return model
}

function stringToArray(input) {
  let split_arr = input.split(';');
  if (!(/^\s*$/).test(split_arr[split_arr.length - 1]))
    throw new Error(`Cannot parse at statement ${split_arr.length}. Statements must end with ';'`)
  split_arr.pop()
  split_arr = split_arr.map(x => x.trim())
  if (split_arr.includes('')) {
    throw new Error(`Detected the use of multiple ';' in a row. Statements must end with only one ';'`)
  }
  return split_arr
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
    stringToArray,
    parseArray,
    parseConstraint,
    parseRangeConstraint,
    addConstraintToModel,
    getConstant,
    verifyRange,
    parseTypeStatement,
    parseObjective,
    Model,
    REGEX,
    CONSTRAINT_FORM,
    TYPES
  }
}