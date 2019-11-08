import {loadingSucceeded, AllLoadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";
import Icons from "../module/SvgIcons.js";
import GetLang from "../module/LanguageSystem.js";

async function start(){
    readyFirst();

    window.addEventListener('beforeinstallprompt', function(e){
        e.preventDefault()
        const installEvent = e;
        if ( installEvent.prompt ) {
            const btn = document.createElement('span');
            btn.className = 'Cyteria scope-icon';
            btn.innerHTML = Icons('cube-outline') + GetLang('Home/download pwa');
            btn.addEventListener('click', function(e){
                installEvent.prompt();
                installEvent = null;
                this.parentNode.removeChild(this);
            });

            const t = document.querySelector('footer > .author-information');
            t.insertBefore(btn, t.querySelector('.auth-name'));
        }
    });

    ready({
        top_menu: document.getElementById('top-menu')
    });

    if ( loadingSucceeded() )
        AllLoadingFinished();
}
try {
    start();
}
catch(e) {
    console.log(e);
}

// Skills Information|,|技能資料|,|スキルインフォ
    // Game Mechanics|,|資料查詢|,|ゲーム関連資料
    // Website Version|,|版本資訊|,|サイト更新履,
    // Web Tool|,|小工具|,|WEBツール