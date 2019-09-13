const options = {
    node_id: 'loading-page'
};

function LoadingPageInit(data){
    Object.assign(options, data);
}

function startLoadingMsg(s){
    return new Promise((resolve, reject) => {
        const div = document.createElement('div');
        div.innerHTML = s;
        document.querySelector(`div#${options.node_id} > div.msg`).appendChild(div);
        resolve();
    });
}

function loadingMsg(s, err=false, status){
    const div = document.createElement('div');
    div.innerHTML = s;
    document.querySelector(`div#${options.node_id} > div.msg`).appendChild(div);
    if ( err )
        status.no_error = false;
}

function loadingFinished(){
    document.getElementById(options.node_id).classList.add('hidden');
}

export {LoadingPageInit, startLoadingMsg, loadingMsg, loadingFinished};