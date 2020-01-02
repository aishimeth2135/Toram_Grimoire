import {PageInitFirst, PageInitReady} from "../module/PageInit.js";
import {loadingSuccess, AllLoadingFinished} from "../module/LoadingPage.js";
import Icons from "../module/SvgIcons.js";
import {GetLang, currentLanguage} from "../module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";

import CY from "../module/cyteria.js";

async function start(){
    PageInitFirst({
        isHomePage: true,
        languageData: {zh_tw, en, ja, zh_cn}
    });

    // window.addEventListener('beforeinstallprompt', function(e){
    //     e.preventDefault();
    //     const installEvent = e;
    //     if ( installEvent.prompt ) {
    //         const btn = document.createElement('span');
    //         btn.className = 'Cyteria Button simple no-border no-padding';
    //         btn.innerHTML = Icons('cube-outline') + `<span class="text">${GetLang('Home/download pwa')}</span>`;
    //         btn.addEventListener('click', function(e){
    //             installEvent.prompt();
    //             installEvent = null;
    //             this.parentNode.removeChild(this);
    //         });

    //         const t = document.querySelector('footer > .author-information');
    //         t.insertBefore(btn, t.querySelector('.auth-name'));
    //     }
    // });
    
    // if ( (new URL(document.location)).searchParams.get('source') === 'pwa' )
    //     document.querySelectorAll('#Home .redirect-button > a').forEach(a => a.href += '?source=pwa');

    PageInitReady();

    LoadingMenu(document.getElementById('top-menu'));
    InitSettings();

    if ( loadingSuccess() )
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

function LoadingMenu(hnode){
    const menu = GetLang('Top Menu');
    const target = [
        'Home',
        'About'
    ];
    const listener = function(event){
        const cur = document.querySelector('*[data-main-scope="1"]');
        cur.setAttribute('data-main-scope', 0);
        cur.classList.add('hidden');
        let scope = document.querySelector('#' + this.getAttribute('data-target'));
        scope.setAttribute('data-main-scope', 1);
        scope.classList.remove('hidden');
    };
    const frg = document.createDocumentFragment();
    menu.forEach((item, i) => {
        const li = document.createElement('li');
        li.innerHTML = item;
        li.addEventListener('click', listener);
        li.setAttribute('data-target', target[i]);
        frg.appendChild(li);
    });
    const ul = document.createElement('ul');
    ul.appendChild(frg);

    const setting = document.createElement('span');
    setting.classList.add('settings');
    setting.setAttribute('data-target', 'Settings');
    setting.addEventListener('click', listener);
    setting.innerHTML = Icons('setting');
    ul.appendChild(setting);

    hnode.appendChild(ul);
}

function InitSettings(){
    const root = document.querySelector('#Settings');
    if ( !CY.storageAvailable('localStorage') ){
        root.innerHTML = `<section><div class="caption">${GetLang('global/LocalStorage is inavailable')}</div></section>`;
        return;
    }
    root.querySelector('.switch-font > .buttons > .switch').addEventListener('click', function(e){
        const k = 'main-font-family';
        const cur = localStorage[k];
        if ( cur && cur === '1' ){
            localStorage.removeItem(k);
            document.querySelector('body').classList.add('font1', 'lang-' + currentLanguage());
        }
        else {
            localStorage[k] = '1';
            document.querySelector('body').classList.remove('font1', 'lang-' + currentLanguage());
        }
    });
    {
        function listener(e){
            if ( this.classList.contains('cur') )
                return;
            const set = this.getAttribute('data-set');
            localStorage['Language-Setting'] = set;

            this.parentNode.querySelector('.cur').classList.remove('cur');
            this.classList.add('cur');
        }
        const lang_button_scope = root.querySelector('.select-language > .buttons');
        const frg = document.createDocumentFragment();
        ['auto', '0', '1', '2', '3'].forEach(p => {
            const btn = CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'], GetLang('settings/select language/button text: list/lang ' + p));
            if ( p == localStorage['Language-Setting'] )
                btn.classList.add('cur');
            btn.addEventListener('click', listener);
            btn.setAttribute('data-set', p);
            frg.appendChild(btn);
        });
        lang_button_scope.appendChild(frg);
    }
    {
        function listener(e){
            if ( this.classList.contains('cur') )
                return;
            const set = this.getAttribute('data-set');
            localStorage['Second-Language-Setting'] = set;

            this.parentNode.querySelector('.cur').classList.remove('cur');
            this.classList.add('cur');
        }
        const lang_button_scope = root.querySelector('.select-second-language > .buttons');
        const frg = document.createDocumentFragment();
        ['0', '1', '2', '3'].forEach(p => {
            const btn = CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'], GetLang('settings/select language/button text: list/lang ' + p));
            if ( p == localStorage['Second-Language-Setting'] )
                btn.classList.add('cur');
            btn.addEventListener('click', listener);
            btn.setAttribute('data-set', p);
            frg.appendChild(btn);
        });
        lang_button_scope.appendChild(frg);
    }
}