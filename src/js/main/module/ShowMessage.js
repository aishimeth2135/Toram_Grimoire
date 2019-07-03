const config = {
    node: document.getElementById('show-message')
};

function setShowMessageConfig(c){
    Object.assign(config, c);
}

function ShowMessage(s){
    const r = config.node;

    const div = document.createElement('div');
    div.innerHTML = s;
    r.insertBefore(div, r.firstChild);

    const it = setInterval(() => {
        div.parentNode.removeChild(div);
    }, 5000);
}

export {ShowMessage, setShowMessageConfig};