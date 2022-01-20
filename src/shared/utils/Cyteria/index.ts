import csv from './csv.js'
import element from './element'
import file from './file'
import object from './object'
import svg from './svg'

function copyToClipboard(str: string) {
  const input = document.createElement('textarea')
  input.value = str
  document.body.appendChild(input)
  input.select()
  const t = document.execCommand('copy')
  document.body.removeChild(input)
  return t
}

function storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  //copy from: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  const storage = window[type]
  try {
    const testKey = '__storage_test__'
    storage.setItem(testKey, testKey)
    storage.removeItem(testKey)
    return true
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
      (storage && storage.length !== 0)
  }
}

export { element, object, svg, csv, file, copyToClipboard, storageAvailable }
export default { element, object, svg, csv, file, copyToClipboard, storageAvailable }
