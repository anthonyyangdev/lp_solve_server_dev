const relation_constraint = /^\s*([a-zA-Z]\w*\ *\:)?\s*[+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+))(\s*[+-][+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+)))*\s*(<=|>=|[>=<])\s*[+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+))(\s*[+-][+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+)))*\s*$/
const range_constraint = /^\s*([a-zA-Z]\w*\ *\:)?\s*[+-\s]*(\d+\.?|\d*\.\d+)(\s*[+-][+-\s]*(\d+\.?|\d*\.\d+))*\s*(<=|>=|[>=<])\s*([+-\s])*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+))(\s*[+-][+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+)))*\s*(<=|>=|[>=<])\s*[+-\s]*(\d+\.?|\d*\.\d+)(\s*[+-][+-\s]*(\d+\.?|\d*\.\d+))*\s*$/
const general_constraint = /^\s*([a-zA-Z]\w*\ *\:)?\s*([+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+))(\s*[+-][+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+)))*\s*(<=|>=|[>=<])\s*[+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+))(\s*[+-][+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+)))*|[+-\s]*(\d+\.?|\d*\.\d+)(\s*[+-][+-\s]*(\d+\.?|\d*\.\d+))*\s*(<=|>=|[>=<])\s*([+-\s])*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+))(\s*[+-][+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+)))*\s*(<=|>=|[>=<])\s*[+-\s]*(\d+\.?|\d*\.\d+)(\s*[+-][+-\s]*(\d+\.?|\d*\.\d+))*)\s*$/

module.exports = {
  BLANK: /^\W{0,}$/,
  INTEGER: /^int\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i,
  BINARY: /^bin\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i,
  FREE: /^free\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i,
  OBJECTIVE: /^(max|min)(imize)?\ *\:\s*[+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+))(\s*[+-][+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d+\.?|\d*\.\d+)))*\s*$/,
  LHS: /(.*\:|(\-|\+)?\s*\d*\.?\d*\s*[a-zA-Z]+\w*)/gi,
  RHS: /(\-|\+)?\d+\.?\d*$/i,
  RELATION: /(<=|>=|\<|\>|=)/gi,
  PARSE_NUM: /(\+|\-)?\s*(\d+\.?\d*|\.\d+|)?\s*[a-zA-Z](\_|\w)*/gi,
  GET_NUM: /[-+\s]*(\d+\.?\d*|\.\d+|)?/,
  WORD: /[A-Za-z](\_|\w)*/,
  RELATION_CONSTRAINT: relation_constraint,
  RANGE_CONSTRAINT: range_constraint,
  GENERAL_CONSTRAINT: general_constraint,
  TERMS: /[+-\s]*((\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*|(\d*\.\d+|\d+\.?))/g,
  CONSTANT: /^[+-\s]*(\d+\.?|\d*\.\d+)$/,
  VARIABLE: /^[+-\s]*(\d+\.?|\d*\.\d+)?\s*[a-zA-Z]\w*$/,
  FOR: /^for\s+[a-zA-Z]+\s*=\s*\d+\s+to\s+\d+\s*(\s*\,\s*[a-zA-Z]+\s*=\s*\d+\s+to\s+\d+)*\s*:/,
  SUMMATION: /^sum\s*\[\s*[a-zA-Z]+\s*=\s*\d+\s+to\s+\d+\s*\]\s*\(\s*.*\s*\)/i,
  SET: /set\s+/
} 