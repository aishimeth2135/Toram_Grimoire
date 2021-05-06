import element from "./element.js";
import object from "./object.js";
import svg from "./svg.js";
import number from "./number.js";
import math from "./math.js";
import csv from "./csv.js";
import file from "./file.js";

function copyToClipboard(s) {
  const input = document.createElement('textarea');
  input.value = s;
  document.body.appendChild(input);
  input.select();
  const t = document.execCommand('copy');
  document.body.removeChild(input);
  return t;
}

/**
 * @param {"localStorage"|"sessionStorage"} type
 * @returns {boolean}
 */
function storageAvailable(type) {
  //copy from: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  const storage = window[type];
  try {
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

export { element, object, svg, number, math, csv, file, copyToClipboard, storageAvailable };
export default { element, object, svg, number, math, csv, file, copyToClipboard, storageAvailable };