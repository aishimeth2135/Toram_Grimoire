
/**
 * @param {string} str
 * @returns {string}
 */
function markText(str) {
  return str
    .replace(/\(\(!((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="text-light-3">${p1}</span>`)
    .replace(/\(\(@((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="cy-separate-text text-light-3">${p1}</span>`);
}

export { markText };
