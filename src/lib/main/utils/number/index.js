/**
 * @param {number} number
 * @param {number} digits
 * @returns {number}
 */
function numberToFixed(number, digits) {
  const base = Math.pow(10, digits);
  return Math.floor(number * base) / base;
}

export { numberToFixed };
