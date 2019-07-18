const regex = require('../REGEX/regex')
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

/**
 * Holds functions that use regular expressions to parse inputs.
 */
const regex_func = {
  /**
   * @param {string} s
   */
  is_blank: s => (regex.BLANK).test(s),
  /**
   * Postcondition: The returned string is non-empty, so the string is truthy.
   * @param {string} s A type declaration.
   */
  is_type_declaration: s => {
    if ((regex.BINARY).test(s))
      return TYPES.BIN
    if ((regex.INTEGER).test(s))
      return TYPES.INT
    if ((regex.FREE).test(s))
      return TYPES.UNRESTRICTED
    return false
  },
  /**
   * @param {string} s An objective function.
   */
  is_objective: s => (regex.OBJECTIVE).test(s),

  /**
   * Postcondition: The returned string is non-empty, so the string is truthy.
   * Returns false if [s] is not a relation or a range constraint.
   * @param {string} s An equation
   */
  is_constraint: s => {
    if (regex.RELATION_CONSTRAINT.test(s)) {
      return CONSTRAINT_FORM.RELATION
    } else if (regex.RANGE_CONSTRAINT.test(s)) {
      return CONSTRAINT_FORM.RANGE
    } else {
      return false
    }
  },
  /**
   * Tests if the expression s is a for/where declaration.
   * @param {string} s
   */
  is_for_where: s => regex.FOR_WHERE.test(s),
  /**
   * @param {string} s An expression.
   * @returns {string[]} An array of terms
   * @deprecated Please use parse_constants() and parse_variables() to parse expressions instead.
   */
  parse_lhs: s => {
    let arr = s.match(regex.LHS)
    // Trim the empty space inside the terms
    arr = arr.map(d => d.replace(/\s+/, ''))
    return arr
  },

  /**
   * @param {string} s An expression.
   * @returns {number} The constant represented in equation on the right-hand side.
   * @deprecated Please use parse_constants() and parse_variables() to parse expressions instead.
   */
  parse_rhs: s => {
    const value = s.match(regex.RHS)[0]
    return parseFloat(value)
  },
  /**
   * 
   * Relations include:
   * - [<=]
   * - [>=]
   * - [>]
   * - [<]
   * - [=]
   * 
   * @param {string} s An equation.
   * @returns {string[]} An array of all the 'relation' strings in s in-order.
   */
  parse_relations: s => {
    return s.match(/(<=|>=|[>=<])/g)
  },
  /**
   * Returns an array of all the terms in [s] with no variables and are constants.
   * @param {string} s An expression.
   */
  parse_constants: s => {
    return s.match(regex.TERMS).map(x => x.trim()).filter(x => regex.CONSTANT.test(x))
  },
  /**
   * Returns an array of all the terms in [s] with variables and are coefficients.
   * @param {string} s An expression.
   */
  parse_variables: s => {
    let terms = s.match(regex.TERMS)
    return terms.map(x => x.trim()).filter(x => regex.VARIABLE.test(x))
  },

  /**
   * Parses and returns a list of variables declared under some type.
   * @param {string} s A type declaration statement.
   */
  parse_num: s => s.match(regex.PARSE_NUM).slice(1).map(x => x.trim()),
  /**
   * Parses and extracts the numerical part of a term.
   * @param {string} s An expression term.
   */
  get_num: d => {
    let num = d.match(regex.GET_NUM)
    if (num[0] === undefined)
      throw new Error('Server error. Source: get_num')
    else {
      num = num[0].replace(/\s*/g, '')
    }

    // If it isn't a number, it might
    // be a standalone variable
    let value = 1
    try {
      value = mathjs.evaluate(num) || value
    } catch (e) {
      value = mathjs.evaluate(`${num}1`)
    }
    return value
  },
  /**
   * Parses and returns the variable part of an expression term.
   * @param {string} d An expression term.
   */
  get_word: d => d.match(regex.WORD)[0]
}

function Model() {
  return {
    opType: '',
    optimize: '_obj',
    constraints: {},
    variables: {}
  }
}

/**
 * 
 * Parses the input which represents an objective function and adds the data
 * into the linear optimization model.
 * 
 * Format of an objective function:
 * - [ min | max | minimize | maximize ]: [expression];
 * 
 * @param {string} input 
 * @param {Model} model 
 */
function parseObjective(input, model) {
  // Set up in model the opType
  model.opType = input.match(/(max|min)/gi)[0];
  // Pull apart lhs
  const start = input.indexOf(':')
  const line = input.slice(start + 1).trim()

  const constant = getConstant(line)
  model.constant = constant || 0

  const variables = regex_func.parse_variables(line)

  variables.forEach(function (d) {
    // Get the number if it's there. This is fine.
    let coeff = regex_func.get_num(d);
    coeff = mathjs.evaluate(coeff)
    // Get the variable name
    const var_name = regex_func.get_word(d);

    // Make sure the variable is in the model
    model.variables[var_name] = model.variables[var_name] || {};
    let current_value = model.variables[var_name]._obj
    model.variables[var_name]._obj = current_value ? current_value + coeff : coeff;
  });
  return model
}

/**
 * 
 * Parses a type declaration of variables and adds the variables and their
 * associated types to the model. 
 * Accepted types include:
 * - int (integer)
 * - bin (binary)
 * - free
 * 
 * @param {string} line 
 * @param {Model} model 
 * @param {string} type 
 */
function parseTypeStatement(line, model, type) {
  const ary = regex_func.parse_num(line);
  model[type] = model[type] || {};
  ary.forEach(function (d) {
    if (model[type][d])
      throw new Error(`Type constraint for ${d} was redeclared as ${my_type}. ${d} already is declared as type int.`)
    model[type][d] = 1
  })
  return model
}

const getRelation = {
  '>=': "min",
  '<=': "max",
  '=': "equal",
  '<': 'max',
  '>': 'min'
}

const getInverseRelation = {
  '>=': 'max',
  '>': 'max',
  '<=': 'min',
  '<': 'min',
  '=': 'equal',
}


/**
 * 
 * Checks that the relations do not violate range specifications.
 * Ranges must show continual increase/decrease, i.e. x > y > z | x < y < z.
 * 
 * Examples of invalid relations:
 * - x < y > z
 * - x > y < z
 * - x = y = z
 * - x = y < z
 * - x > y = z
 * 
 * @param {string} first_relation 
 * @param {string} second_relation 
 * @returns {void}
 */
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

/**
 * 
 * Parses a line representing an expression and returns the sum of the constant
 * values in that expression. 
 * 
 * @param {string} line 
 * @returns {number}
 */
function getConstant(line) {
  const constants = regex_func.parse_constants(line)
  if (constants.length === 0)
    return 0
  let c = ''
  for (let i = 0; i < constants.length; i++) {
    c += i === constants.length - 1 ? constants[i] : `${constants[i]} +`
  }
  const number = mathjs.evaluate(c)
  return number
}


/**
 * 
 * Adds the constraint with the relation between the linear variable terms 
 * and the constant value to the passed model. 
 * This constraint is labeled in the model under the name argument.
 * 
 * @param {Model} model 
 * @param {number} constant 
 * @param {string[]} terms 
 * @param {string} relation 
 * @param {string} name 
 * @returns {Model}
 */
function addConstraintToModel(model, constant, terms, relation, name) {
  // *** STEP 1 *** ///
  // Get the variables out
  terms.forEach(function (d) {
    // Get the number if its there
    let coeff = regex_func.get_num(d);
    coeff = mathjs.evaluate(coeff)
    // Get the variable name
    const var_name = regex_func.get_word(d);
    // Make sure the variable is in the model
    model.variables[var_name] = model.variables[var_name] || {};
    let current_value = model.variables[var_name][name]
    model.variables[var_name][name] = current_value ? current_value + coeff : coeff;
  });
  model.constraints[name] = model.constraints[name] || {};
  model.constraints[name][relation] = constant;

  return model
}

/**
 * 
 * Parses a constraint that identifies the range of a variable.
 * 
 * @param {string} line 
 * @param {Model} model 
 * @param {string} name 
 */
function parseRangeConstraint(line, model, name) {
  const relations = regex_func.parse_relations(line)
  assert.strictEqual(2, relations.length)
  verifyRange(relations[0], relations[1])

  const r1_loc = line.indexOf(relations[0])
  const r1_len = relations[0].length
  const r2_loc = line.lastIndexOf(relations[1])
  const r2_len = relations[1].length

  const center = line.slice(r1_loc + r1_len, r2_loc).trim()
  const C = getConstant(center)
  const variables = regex_func.parse_variables(center)

  let left = line.slice(0, r1_loc).trim()
  left = mathjs.evaluate(left) - C

  let right = line.slice(r2_loc + r2_len).trim()
  right = mathjs.evaluate(right) - C

  model = addConstraintToModel(model, left, variables, getInverseRelation[relations[0]], `${name}_1`)
  model = addConstraintToModel(model, right, variables, getRelation[relations[1]], `${name}_2`)

  return model
}

/**
 * 
 * Parses a constraint that shows a relation between linear variables
 * and a constant value.
 * 
 * @param {string} line 
 * @param {Model} model 
 * @param {string} name 
 */
function parseRelationConstraint(line, model, name) {
  const relations = regex_func.parse_relations(line)
  assert.strictEqual(1, relations.length)

  const relation = relations[0]
  const r_loc = line.indexOf(relation)
  const r_len = relation.length

  const left = line.slice(0, r_loc).trim()
  const right = line.slice(r_loc + r_len).trim()

  const left_constant = getConstant(left)
  const right_constant = getConstant(right)

  const left_variables = regex_func.parse_variables(left)
  const right_variables = regex_func.parse_variables(right).map(x => `-${x}`)

  const variables = left_variables.concat(right_variables)
  const b_value = right_constant - left_constant

  model = addConstraintToModel(model, b_value, variables, getRelation[relation], name)

  return model
}


/**
 * 
 * Adds the constraint given by the expression in the line to the model.
 * 
 * @param {string} line The expression.
 * @param {Model} model The model representing the linear optimization model.
 * @param {string} constraint The name of the constraint.
 * @param {string} form The type of constraint: relation | range.
 */
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
  } else if (form === CONSTRAINT_FORM.RELATION) {
    return parseRelationConstraint(constraintExpression, model, constraint)
  } else {
    throw new Error('Not implemented')
  }
}

/**
 * 
 * Parses the input as a string array that is representing a linear 
 * optimization model. The returned Model object represents the linear optimization.
 * 
 * @param {string[]} input 
 * @returns {Model}
 */
function parseArray(input) {
  const {
    is_constraint,
    is_type_declaration,
    is_objective } = regex_func
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
      throw new Error(`Cannot parse statement ${i + 1}:\nContent: ${currentLine}`)
    }
  }
  return model
}


/**
 * Converts a string representing a linear optimization model into a
 * string array representing the same model.
 * 
 * The array is formed by using ';' as the delimiter.
 * 
 * @param {string} input 
 * @returns {string[]}
 */
function stringToArray(input) {
  const DELIMITER = ';'

  input = input.replace(/\/\*(.|\s)*\*\/|\/\/.*/g, '')

  let split_arr = input.split(DELIMITER);
  if (!(/^\s*$/).test(split_arr[split_arr.length - 1]))
    throw new Error(`Cannot parse at statement ${split_arr.length}. Statements must end with ';'`)
  split_arr.pop()
  split_arr = split_arr.map(x => x.trim())
  if (split_arr.includes('')) {
    throw new Error(`Detected the use of multiple ';' in a row. Statements must end with only one ';'`)
  }
  return split_arr
}

/**
 * 
 * Parses the input of a linear optimization model. Returns an object
 * representing that model.
 * 
 * @param {string | string[]} input 
 */
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
    REGEX: regex_func,
    CONSTRAINT_FORM,
    TYPES
  }
}