import Icons from "./SvgIcons.js";

const config = {
    node: null
};

function setShowMessageConfig(c){
    Object.assign(config, c);
}

function ShowMessage(s, icon_id, msg_id){
    if ( !config.node ){
        const t = document.createElement('div');
        t.id = 'show-message';
        document.body.appendChild(t);
        config.node = t;
    }
    const r = config.node;
    icon_id = icon_id || 'notifications-outline';

    const find = msg_id ? r.querySelector(`.message-scope[data-msgid="${msg_id}"]`) : null;
    if ( !find ){
        const div = document.createElement('div');
        div.classList = 'Cyteria entrance fade-in-down scope-icon line message-scope';
        div.innerHTML = Icons(icon_id) + `<span class="text">${s}</span><span class="notification-count hidden">0</span>`;
        div.setAttribute('data-msgid', msg_id);
        div.setAttribute('data-timer', 5);
        r.insertBefore(div, r.firstChild);
        const it = setInterval(() => {
            const sec = parseInt(div.getAttribute('data-timer'), 10);
            if ( sec > 0 ){
                div.setAttribute('data-timer', sec - 1);
            }
            else {
                div.classList.add('out');
                setTimeout(() => div.parentNode.removeChild(div), 500)
                clearInterval(it);
            }
        }, 1000);
    }
    else {
        const repeat_count = find.querySelector('.notification-count');
        repeat_count.classList.remove('hidden');
        repeat_count.innerHTML = parseInt(repeat_count.innerHTML, 10) + 1;
        const sec = parseInt(find.getAttribute('data-timer'), 10);
        find.setAttribute('data-timer', Math.min(sec + 1, 10));
    }

}

export default ShowMessage;

export {ShowMessage, setShowMessageConfig};