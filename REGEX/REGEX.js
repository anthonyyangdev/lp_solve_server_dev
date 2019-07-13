module.exports = {
  BLANK: /^\W{0,}$/,
  INTEGER: /^int\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i,
  BINARY: /^bin\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i,
  FREE: /^free\s+[a-zA-Z](\_|\w)*\s*(\,\s*[a-zA-Z](\_|\w)*)*$/i,
  OBJECTIVE: /^(max|min)(imize)? *?\:\s*((\+|\-)?\s*(\d+\.?\d*|\.\d+)?\s*[a-zA-Z](\_|\w)*)(\s*(\+|\-)\s*(\d+\.?\d*|\.\d+)?\s*[a-zA-Z](\_|\w)*)*$/i,
  CONSTRAINT:
    /^([a-zA-Z]+\w* *?\:)?(\s*(\-|\+)?\s*(\d+\.?\d*|\.\d+|)?\s*[a-zA-Z](\_|\w)*)(\s*(\-|\+)\s*(\d+\.?\d*|\.\d+|)?\s*[a-zA-Z](\_|\w)*)*\s*(\<|\>)?\=?\s*\d+\.?\d*$/i,
  LHS: /(.*\:|(\-|\+)?\s*\d*\.?\d*\s*[a-zA-Z]+\w*)/gi,
  RHS: /(\-|\+)?\d+\.?\d*$/i,
  RELATION: /(<=|>=|\<|\>|=)/gi,
  PARSE_NUM: /(\+|\-)?\s*(\d+\.?\d*|\.\d+|)?\s*[a-zA-Z](\_|\w)*/gi,
  GET_NUM: /(\-|\+)?\s*(\d+\.?\d*|\.\d+|)?/,
  WORD: /[A-Za-z](\_|\w)*/
} 