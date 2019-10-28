import element from "./element.js";

function create(width=0, height=0, attr={}){
    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    attr = Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        version: '1.1',
        width, height,
        viewBox: `0 0 ${width} ${height}`
    }, attr);
    element.setAttributes(svg, attr);
    return svg;
}
function drawText(x, y, content, attr={}){
    const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    attr = Object.assign({
        x, y
    }, attr);
    element.setAttributes(text, attr);
    text.innerHTML = content;
    return text;
}
function drawCircle(cx, cy, r, attr={}){
    const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    attr = Object.assign({
        cx, cy, r
    }, attr);
    element.setAttributes(circle, attr);
    return circle;
}
function drawLine(x1, y1, x2, y2, attr={}){
    const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    attr = Object.assign({
        x1, y1, x2, y2
    }, attr);
    element.setAttributes(line, attr);
    return line;
}
function drawPath(d, attr={}){
    const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    attr = Object.assign({d}, attr);
    element.setAttributes(path, attr);
    return path;
}
function drawSector(cx, cy, startR, endR, startAngle, endAngle, clockwise, attr={}){
    const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    attr = Object.assign({
        d: getSectorD(cx, cy, startR, endR, startAngle, endAngle, clockwise),
        fill: 'none'
    }, attr);
    element.setAttributes(path, attr);
    return path;
}
function getSectorD(cx, cy, startR, endR, startAngle , endAngle, clockwise){
    const deg = Math.PI/180;
    const ssx = startR*Math.cos(endAngle*deg) + cx,
        ssy = -startR*Math.sin(endAngle*deg) + cy,
        sex = startR*Math.cos(startAngle*deg) + cx,
        sey = -startR*Math.sin(startAngle*deg) + cy,
        esx = endR*Math.cos(startAngle*deg) + cx,
        esy = -endR*Math.sin(startAngle*deg) + cy,
        eex = endR*Math.cos(endAngle*deg) + cx,
        eey = -endR*Math.sin(endAngle*deg) + cy;
    return `M${ssx} ${ssy}A${startR} ${startR} 0 0 ${clockwise == 1 ? 0 : 1} ${sex} ${sey}L${esx} ${esy}A${endR} ${endR} 0 0 ${clockwise} ${eex} ${eey}Z`;
}
function createAnimate(attributeName, attr={}){
    attr = Object.assign({
        attributeName,
        repeatCount: 'indefinite'
    }, attr);
    const ani = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    element.setAttributes(ani, attr);
    return ani;
}
function drawImage(path, x, y, width, height, attr={}){
    const img = document.createElementNS("http://www.w3.org/2000/svg", 'image');
    attr = Object.assign({
        x, y, width, height
    }, attr);
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', path);
    element.setAttributes(img, attr);
    return img;
}
function createEmpty(name, attr={}){
    const ele = document.createElementNS("http://www.w3.org/2000/svg", name);
    element.setAttributes(ele, attr);
    return ele;
}
function createSimpleImagePattern(id, path, width, height, attr={}, imgattr={}){
    const pat = document.createElementNS("http://www.w3.org/2000/svg", 'pattern');
    attr = Object.assign({
        width, height, id
    }, attr);
    element.setAttributes(pat, attr);
    pat.appendChild(drawImage(0, 0, path, width, height, imgattr));
    return pat;
}
function createLinearGradient(id, x1, y1, x2, y2, stops, attr={}){
    const lg = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
    attr = Object.assign({
        id, x1, y1, x2, y2
    }, attr);
    element.setAttributes(lg, attr);
    stops.forEach(a => lg.appendChild(createEmpty('stop', a)));
    return lg;
}
function createRadialGradient(id, cx, cy, r, stops, attr={}){
    const rg = document.createElementNS("http://www.w3.org/2000/svg", 'radialGradient');
    attr = Object.assign({
        id, cx, cy, r
    }, attr);
    element.setAttributes(rg, attr);
    stops.forEach(a => rg.appendChild(createEmpty('stop', a)));
    return rg;
}

export default {
    create,
    drawText, drawPath, drawCircle, drawLine, drawSector, drawImage, getSectorD,
    createEmpty, createAnimate, createSimpleImagePattern, createLinearGradient, createRadialGradient
};