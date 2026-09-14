import element from './element'
import file from './file'
import svg from './svg'

function copyToClipboard(str: string) {
  const input = document.createElement('textarea')
  input.value = str
  document.body.appendChild(input)
  input.select()
  const res = document.execCommand('copy')
  document.body.removeChild(input)
  return res
}

export { element, svg, file, copyToClipboard }
export default { element, svg, file, copyToClipboard }
