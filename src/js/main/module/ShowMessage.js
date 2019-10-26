const config = {
    node: null
};

function setShowMessageConfig(c){
    Object.assign(config, c);
}

function ShowMessage(s){
    if ( !config.node ){
        const t = document.createElement('div');
        t.id = 'show-message';
        t.classList.add('Cyteria', 'entrance', 'fade-in-down');
        document.body.appendChild(t);
        config.node = t;
    }
    const r = config.node;

    const div = document.createElement('div');
    div.innerHTML = s;
    r.insertBefore(div, r.firstChild);

    const it = setTimeout(() => {
        div.parentNode.removeChild(div);
    }, 5500);
}

export default ShowMessage;

export {ShowMessage, setShowMessageConfig};