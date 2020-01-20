function remove(){
    Array.from(arguments).forEach(node => {
        if ( node )
            node.parentNode.removeChild(node);
    });
}
function removeAllChild(node){
    if ( !node ) return;
    while ( node.firstChild )
        node.removeChild(node.firstChild);
    return node;
}
function setAttributes(ele, dict){
    Object.keys(dict).forEach(k => {
        if ( dict[k] !== null )
            ele.setAttribute(k, dict[k])
    });
}
function simpleCreateHTML(type, classList, html, attr){
    const t = document.createElement(type);
    if ( classList !== void 0 && classList !== null ){
        Array.isArray(classList) ? t.classList.add(...classList): t.classList.add(classList);
    }
    if ( html !== void 0 && html !== null )
        t.innerHTML = html;
    if ( attr !== void 0 && attr !== null )
        setAttributes(t, attr);
    return t;
}
function convertRemToPixels(rem){    
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
function createByCode(html){
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}
function isTextNode(node){
    return node.nodeType == Node.TEXT_NODE;
}

function calcInputWidthPx(input, el){
    const t = el || simpleCreateHTML('span', ['Cyteria', 'to-calc-input-width']);

    if ( !el )
        document.body.appendChild(t);

    t.innerHTML = input.value;
    const res =  t.offsetWidth;

    if ( !el )
        document.body.removeChild(t);

    return res;
}

function selectElementFromChild(el_class, child_node){
    el_class = Array.isArray(el_class) ? el_class : [el_class];
    let node = child_node;
    while ( !el_class.every(p => node.classList.contains(p)) && node != document.body )
        node = node.parentNode;
    if ( node == document.body )
        console.error("element not found: [" + el_class.join('.') + ']');
    return node;
}

export default {
    remove, removeAllChild, setAttributes, simpleCreateHTML,
    convertRemToPixels, createByCode, isTextNode, calcInputWidthPx,
    selectElementFromChild
};