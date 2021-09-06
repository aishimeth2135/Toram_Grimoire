
/**
 * Mark the text by html code.
 * @param {string} str
 * @returns {string}
 */
function markText(str) {
  return str
    .replace(/\(\(!((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="text-light-4">${p1}</span>`)
    .replace(/\(\(_((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="cy--text-underline text-light-4">${p1}</span>`);
}

export { markText };
