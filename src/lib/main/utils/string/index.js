function isNumberString(str) {
  return /^-?\d+(?:\.\d+)?$/.test(str);
}

export { isNumberString };