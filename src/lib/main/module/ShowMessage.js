import Icons from "./SvgIcons.js";

const config = {
    node: null
};

function setShowMessageConfig(c){
    Object.assign(config, c);
}
function createConfigNode(){
    const t = document.createElement('div');
    t.id = 'global--Show-Message';
    t.innerHTML = `<div class="loading-message-scope hidden"><div class="container"><div class="icon">${Icons('potum')}</div><div class="text"></div></div></div>`;
    document.body.appendChild(t);
    config.node = t;
}
function showConfigNode(){
    if ( !config.node ){
        createConfigNode();
    }
    const c = config.node.classList;
    c.contains('hidden') && c.remove('hidden');
}
function hideConfigNode(){
    const r = config.node;
    if ( !r.querySelector('.message-scope') && getLoadingMessageScope().classList.contains('hidden') )
        r.classList.add('hidden');
}
function getLoadingMessageScope(){
    if ( !config.node ){
        createConfigNode();
    }
    return config.node.querySelector('.loading-message-scope');
}

function ShowMessage(s, icon_id, msg_id, options={}){
    // Options {
    //     messageClick: Callback
    // }
    Object.assign({
        removeMessageAfterClick: false
    }, options);

    showConfigNode();

    const r = config.node;
    icon_id = icon_id || 'notifications-outline';

    const find = msg_id ? r.querySelector(`.message-scope[data-msgid="${msg_id}"]`) : null;
    if ( !find ){
        const div = document.createElement('div');
        div.classList = 'Cyteria entrance fade-in-down scope-icon line message-scope';
        div.innerHTML = Icons(icon_id) + `<span class="text">${s}</span><span class="notification-count hidden">0</span>`;
        div.setAttribute('data-msgid', msg_id);
        div.setAttribute('data-timer', 5);

        let messageClick = null, alreadyRemoveMessage = false;
        function removeMessage(){
            if ( alreadyRemoveMessage ) return;
            alreadyRemoveMessage = true;
            div.parentNode.removeChild(div);
            if ( messageClick != null )
                div.removeEventListener('click', options.messageClick);

            hideConfigNode();
        }
        if ( typeof options.messageClick == 'function' ){
            messageClick = function(e){
                options.messageClick(e);
                if ( options.removeMessageAfterClick )
                    removeMessage();
            };
            div.addEventListener('click', messageClick);
        }

        r.insertBefore(div, r.firstChild);

        const it = setInterval(() => {
            const sec = parseInt(div.getAttribute('data-timer'), 10);
            if ( sec > 0 ){
                div.setAttribute('data-timer', sec - 1);
            }
            else {
                div.classList.add('out');
                setTimeout(() => {
                    removeMessage();
                }, 500)
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


function ShowLoadingMessage(message){
    const r = getLoadingMessageScope();
    r.classList.remove('hidden');
    r.querySelector('.container > .text').innerHTML = message;
    showConfigNode();
}

function loadingFinished(){
    getLoadingMessageScope().classList.add('hidden');
    hideConfigNode();
}

export default ShowMessage;

export {ShowMessage, setShowMessageConfig, ShowLoadingMessage, loadingFinished};