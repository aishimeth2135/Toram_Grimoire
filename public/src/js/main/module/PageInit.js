import {currentLanguage, InitLanguageSystem, InitLanguageData, PageInitLanguage, GetLang} from "./LanguageSystem.js";
import CY from "./cyteria.js";
import {Icons, PageInitIcons} from "./SvgIcons.js";

function PageInitFirst(config){
    config = Object.assign({
        languageData: null,
        isHomePage: false
    }, config);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js', {'updateViaCache': 'imports'});
        });
    }

    // Language
    InitLanguageSystem();
    if ( config.languageData )
        InitLanguageData(config.languageData);
    PageInitLanguage();
    document.title = GetLang('Page Title');

    PageInitIcons();

    if ( CY.storageAvailable('localStorage') ){
        if ( localStorage['main-font-family'] !== '1' )
            document.querySelector('body').classList.add('font1', 'lang-' + currentLanguage());
        if ( localStorage['Theme--Night-Mode'] === '1' )
            document.body.classList.add('theme--night-mode');
    }

    const simpleCreateHTML = CY.element.simpleCreateHTML;

    if ( !config.isHomePage ){
        const nav = document.querySelector('nav');
        nav.innerHTML = `<ul><li><a href="../">${GetLang('Top List/item 1')}</a></li><li><span>${GetLang('Top List/item 2')}</span></li></ul>` + nav.innerHTML;
    }

    const loadingPage = document.createElement('div');
    loadingPage.id = 'global--Loading-Page';
    loadingPage.appendChild(simpleCreateHTML('div', 'main', 'loading...'));
    loadingPage.appendChild(simpleCreateHTML('div', 'content', GetLang('Loading Page/content')));
    loadingPage.appendChild(simpleCreateHTML('div', 'msg'));
    document.body.appendChild(loadingPage);

    const create_scope = (icon_id, text) => `${Icons(icon_id)}<span class="text">${text}</span>`;
    const auth = simpleCreateHTML('div', 'author-information');
    const night_mode = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'no-border', 'no-padding'], create_scope('weather-night', GetLang('footer/night mode')));
    night_mode.addEventListener('click', function(){
        if ( CY.storageAvailable('localStorage') ){
            if ( localStorage['Theme--Night-Mode'] !== '1' )
                localStorage['Theme--Night-Mode'] = '1';
            else
                localStorage['Theme--Night-Mode'] = '0';
        }
        document.body.classList.toggle('theme--night-mode');
    });
    auth.appendChild(night_mode);
    auth.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'auth-name'], create_scope('ghost', 'Cyteria')));
    auth.appendChild(
        simpleCreateHTML('a', ['Cyteria', 'scope-icon'], create_scope('book', GetLang('footer/baha home')), {
            'href': 'https://home.gamer.com.tw/homeindex.php?owner=mushroom2135',
            'target': '_blank'
        })
    );
    auth.appendChild(
        simpleCreateHTML('a', ['Cyteria', 'scope-icon'], create_scope('twitter', 'Cyteria_w'), {
            'href': 'https://twitter.com/Cyteria_w',
            'target': '_blank'
        })
    );
    document.querySelector('footer').appendChild(auth);
}

function PageInitReady(){

}

export {PageInitFirst, PageInitReady};