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
    return rem*parseFloat(getComputedStyle(document.documentElement).fontSize);
}
function createByCode(html){
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
}
function isTextNode(node){
    return node.nodeType == Node.TEXT_NODE;
}

export default {remove, removeAllChild, setAttributes, simpleCreateHTML, convertRemToPixels, createByCode, isTextNode};