import Icons from "./SvgIcons.js";

const options = {
    node_id: 'loading-page'
};

/**
 * Loading Status
 * @type {Number} 0: loading, -1: error
 */
let status = 0;

function LoadingPageInit(data){
    Object.assign(options, data);
}

function startLoadingMsg(...msgs){
    return new Promise((resolve, reject) => {
        const t = msgs.map(msg => {
            const div = document.createElement('div');
            div.classList.add('msg-scope');
            div.innerHTML = `<span class="text">${msg}</span><span class="status-icon loading">${Icons('loading')}</span>`;
            document.querySelector(`div#${options.node_id} > div.msg`).appendChild(div);
            return div;
        });
        resolve(t.length == 1 ? t[0] : t);
    });
}

function loadingMsg(s, err=false, status){
    const div = document.createElement('div');
    div.innerHTML = s;
    document.querySelector(`div#${options.node_id} > div.msg`).appendChild(div);
    if ( err )
        status.no_error = false;
}
function loadingFinished(msg_el){
    const icon = msg_el.querySelector('.status-icon');
    if ( icon ){
        icon.innerHTML = Icons('finished');
        icon.classList.remove('loading');
        icon.classList.add('finished');
    }
}
function loadingError(msg_el, e){
    status = -1;
    const icon = msg_el.querySelector('.status-icon');
    if ( icon ){
        icon.innerHTML = Icons('error');
        icon.classList.remove('loading');
        icon.classList.add('error');
    }
    if ( e )
        console.log(e);
}

function loadingSucceeded(){
    return status != -1;
}

function AllLoadingFinished(){
    document.getElementById(options.node_id).classList.add('hidden');

    // free up memory
    LoadingPageInit = null;
    startLoadingMsg = null;
    loadingMsg = null;
    loadingSucceeded = null;
    loadingFinished = null;
    AllLoadingFinished = null;
}

export {LoadingPageInit, startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSucceeded, AllLoadingFinished};