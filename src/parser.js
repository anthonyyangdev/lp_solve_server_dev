const regex = require('../REGEX/regex')
const assert = require('assert')
const mathjs = require('mathjs')
const removeComments = require('./helper/removeComments')

const TYPES = {
  INT: 'ints',
  BIN: 'binaries',
  UNRESTRICTED: 'unrestricted'
}
const CONSTRAINT_FORM = {
  RANGE: 'RANGE',
  RELATION: 'RELATION'
}

const TYPE_FUNC = {
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
  }
}

/**
 * Holds functions that use regular expressions to parse inputs.
 */
const regex_func = {
  is_valid_type: s => {
    for (let fun in TYPE_FUNC) {
      let result = fun(s)
      if (result) {
        return result
      }
    }
    return false
  },
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
  is_for_statement: s => regex.FOR.test(s),
  is_summation: s => regex.SUMMATION.test(s),
  is_set_declare: s => regex.SET.test(s),
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
  // is_for_where: s => regex.FOR_WHERE.test(s),

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
    variables: {},
    set: {}
  }
}

/**
 * 
 * @param {string} line 
 * @param {Model} model 
 * @param {boolean} noObjective 
 * @param {string} name 
 * @returns {{model: Model, noObjective: boolean, name: string}}
 */
function parseForStatement(line, model, noObjective, name) {
  const index = line.indexOf(':')
  const for_statement = line.slice(0, index)
  // Get the assignment variable, and get the range of that variable.
  // Based on the previous regex test, there are at most and at least 2 numbers.

  // Match numbers
  const numbers = for_statement.match(/\d+/g)
  // The only word besides for is the assignment variable and 'to':
  // Slice 1 to ignore the first term.
  const variables = for_statement.match(/[a-zA-Z]+/g).slice(1).filter(x => x !== 'to')
  let env = []
  for (let i = 0; i < variables.length; i++) {
    const first = numbers[i * 2]
    const second = numbers[i * 2 + 1]
    env.push({
      name: variables[i],
      start: parseInt(first),
      end: parseInt(second),
      current: parseInt(first)
    })
  }
  function loop(arr, func, init) {
    function helper(arr, func, init, arr2) {
      if (arr.length === 0)
        return func(init, arr2)
      while (arr[0].current <= arr[0].end) {
        init = helper(arr.slice(1), func, init, arr2)
        arr[0].current++
      }
      arr[0].current = arr[0].start
      return init
    }
    return helper(arr, func, init, arr)
  }

  const subscript_regex = /_\w+/g
  return loop(env, function (current, vars) {
    let expr = line.slice(index + 1).trim()
    const subscripts = expr.match(subscript_regex)
    const subscripts_transformed = subscripts.map(x => {
      for (let v of vars)
        x = x.replace(v.name, v.current)
      return x
    })
    for (let i = 0; i < subscripts.length; i++) {
      expr = expr.replace(subscripts[i], subscripts_transformed[i])
    }
    return eval(expr, current.model, current.noObjective, current.constraint)
  }, { model, noObjective, constraint: name })
}


function parseSummation(line, model) {
  const front = line.indexOf('(')
  const last = line.lastIndexOf(')')
  const sum_statement = line.slice(0, front).trim()
  // Get the assignment variable, and get the range of that variable.
  // Based on the previous regex test, there are at most and at least 2 numbers.

  // Match numbers
  const [start, end] = sum_statement.match(/\d+/g)
  // The only word besides for is the assignment variable and 'to':
  // Slice 1 to ignore the first term.
  const variable = sum_statement.match(/[a-zA-Z]+/g)[1]
  let env = {
    name: variable,
    current: parseInt(start),
    end: parseInt(end)
  }

  let expression = line.slice(front + 1, last).trim()
  function innerEval(line) {
    if (regex.SUMMATION.test(line)) {
      return parseSummation(line, model)
    } else {
      return line
    }
  }
  expression = innerEval(expression)

  let hasName = expression.indexOf(':')
  let name = ''
  if (hasName !== -1) {
    name = expression.slice(0, hasName + 1).trim()
    expression = expression.slice(hasName + 1).trim()
  }

  const remaining = line.slice(last + 1).trim()
  let full_expression = ''
  const subscript_regex = /_\w+/g
  while (env.current <= env.end) {
    const subscripts = expression.match(subscript_regex)
    const subscripts_transformed = subscripts.map(x => {
      return x.replace(env.name, env.current)
    })
    let expr = expression
    for (let i = 0; i < subscripts.length; i++) {
      expr = expr.replace(subscripts[i], subscripts_transformed[i])
    }
    full_expression += env.current === env.end ? `${expr} ${remaining}` : `${expr} + `
    env.current++
  }
  full_expression = name + full_expression

  for (let vars in model.set) {
    const regex = new RegExp(vars, 'g');
    const value = model.set[vars]
    full_expression = full_expression.replace(regex, value)
  }
  return full_expression
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
  let line = input.slice(start + 1).trim()

  // Change variables here for values here
  for (let vars in model.set) {
    const regex = new RegExp(vars, 'g');
    const value = model.set[vars]
    line = line.replace(regex, value)
  }

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


var dupConstraint = 0
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
  if (model.constraints[name] !== undefined) {
    name = `${name}${dupConstraint}`
    dupConstraint++
  }
  model.constraints[name] = {};
  model.constraints[name][relation] = constant;
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

  const separatorIndex = line.indexOf(":");
  let constraintExpression = ''
  if (separatorIndex === -1) {
    constraintExpression = line
  } else {
    constraint = line.slice(0, separatorIndex).trim()
    if ((/(max|min)(imize)?/).test(constraint)) {
      throw new Error(`The name of a constraint cannot be the type of an optimization.\nName Given: ${constraint}`)
    }
    constraintExpression = line.slice(separatorIndex + 1).trim()
  }

  for (let vars in model.set) {
    const regex = new RegExp(vars, 'g');
    const value = model.set[vars]
    constraintExpression = constraintExpression.replace(regex, value)
  }

  if (form === CONSTRAINT_FORM.RANGE) {
    return parseRangeConstraint(constraintExpression, model, constraint)
  } else if (form === CONSTRAINT_FORM.RELATION) {
    return parseRelationConstraint(constraintExpression, model, constraint)
  } else {
    throw new Error('Not implemented')
  }
}

function parseSetDeclare(line, model) {
  const DELIMIT = 'set'
  const start = line.indexOf(DELIMIT)
  const len = DELIMIT.length
  const expr = line.slice(start + len)
  const EQUAL = '='
  const name = expr.slice(0, expr.indexOf(EQUAL)).trim()
  const right = expr.slice(expr.indexOf(EQUAL) + 1).trim()
  const validVariable = /^[a-zA-Z]\w*$/

  if (!validVariable.test(name))
    throw new Error(`The variable name is not valid for value declaration ${line}`)
  const value = mathjs.evaluate(right)

  model.set[name] = value

  return model
}

function eval(line, model, noObjective, constraint) {
  const {
    is_constraint,
    is_type_declaration,
    is_objective,
    is_for_statement,
    is_summation, is_set_declare } = regex_func
  if (is_objective(line)) {
    if (noObjective)
      model = parseObjective(line, model)
    else
      throw new Error('Error: multiple objectives found.')
    noObjective = false
  } else if (is_set_declare(line)) {
    model = parseSetDeclare(line, model)
  } else if (is_for_statement(line)) {
    const newModel = parseForStatement(line, model, noObjective, constraint)
    model = newModel.model
    constraint = newModel.constraint
    noObjective = newModel.noObjective
  } else if (is_summation(line)) {
    const expression = parseSummation(line, model)
    const newModel = eval(expression, model, noObjective, constraint)
    model = newModel.model
    constraint = newModel.constraint
    noObjective = newModel.noObjective
  } else if (is_type_declaration(line)) {
    const type = is_type_declaration(line)
    model = parseTypeStatement(line, model, type)
  } else if (is_constraint(line)) {
    const constraint_form = is_constraint(line)
    model = parseConstraint(line, model, 'R' + constraint, constraint_form)
    constraint++
  } else {
    throw new Error(`Cannot parse statement ${i + 1}:\nContent: ${line}`)
  }
  return { model, noObjective, constraint }
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
  let model = new Model()
  let constraint = 1
  let noObjective = true
  for (let i = 0; i < input.length; i++) {
    // Get the string we're working with
    const currentLine = input[i];
    result = eval(currentLine, model, noObjective, constraint)
    model = result.model
    constraint = result.constraint
    noObjective = result.noObjective
    // Test to see if we're the objective
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

  input = removeComments(input)

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
    parseForStatement,
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