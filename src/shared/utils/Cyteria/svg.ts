import element from './element'

type AttrValue = number | string
type Attrs = Record<string, AttrValue>

function create(width = 0, height = 0, attr: Attrs = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  attr = Object.assign({
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1',
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
  }, attr)
  element.setAttributes(svg, attr)
  return svg
}

function getSectorD(cx: number, cy: number, startR: number, endR: number, startAngle: number, endAngle: number, clockwise: number) {
  const deg = Math.PI / 180
  const
    ssx = startR * Math.cos(endAngle * deg) + cx,
    ssy = -1 * startR * Math.sin(endAngle * deg) + cy,
    sex = startR * Math.cos(startAngle * deg) + cx,
    sey = -1 * startR * Math.sin(startAngle * deg) + cy,
    esx = endR * Math.cos(startAngle * deg) + cx,
    esy = -1 * endR * Math.sin(startAngle * deg) + cy,
    eex = endR * Math.cos(endAngle * deg) + cx,
    eey = -1 * endR * Math.sin(endAngle * deg) + cy
  return `M${ssx} ${ssy}A${startR} ${startR} 0 0 ${clockwise == 1 ? 0 : 1} ${sex} ${sey}L${esx} ${esy}A${endR} ${endR} 0 0 ${clockwise} ${eex} ${eey}Z`
}


function drawImage(path: string, x: number, y: number, width: number, height: number, attr: Attrs = {}) {
  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  attr = Object.assign({
    x,
    y,
    width,
    height,
  }, attr)
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', path)
  element.setAttributes(img, attr)
  return img
}

function createEmpty(name: string, attr: Attrs = {}) {
  const ele = document.createElementNS('http://www.w3.org/2000/svg', name)
  element.setAttributes(ele, attr)
  return ele
}

function createLinearGradient(id: string, x1: AttrValue, y1: AttrValue, x2: AttrValue, y2: AttrValue, stops: Attrs[], attr: Attrs = {}) {
  const lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
  attr = Object.assign({
    id,
    x1,
    y1,
    x2,
    y2,
  }, attr)
  element.setAttributes(lg, attr)
  stops.forEach(stop => lg.appendChild(createEmpty('stop', stop)))
  return lg
}

export default {
  create,
  drawImage,
  getSectorD,
  createEmpty,
  createLinearGradient,
}
