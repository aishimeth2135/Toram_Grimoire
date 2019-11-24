import {currentLanguage, InitLanguageSystem, PageInitLanguage, GetLang} from "./LanguageSystem.js";
import CY from "./cyteria.js";
import Icons from "./SvgIcons.js";

function PageInitFirst(){
    InitLanguageSystem();

    document.querySelector('#loading-page > .content').innerHTML = GetLang('Loading Page/content');

    if ( CY.storageAvailable('localStorage') ){
        if ( localStorage['main-font-family'] !== '1' )
            document.querySelector('body').classList.add('font1', 'lang-' + currentLanguage());
        if ( localStorage['Theme--Night-Mode'] === '1' )
            document.body.classList.add('theme--night-mode');
    }

    const simpleCreateHTML = CY.element.simpleCreateHTML;
    const create_scope = (icon_id, text) => `${Icons(icon_id)}<span class="text">${text}</span>`;
    const auth = document.querySelector('footer > .author-information');
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
}

function PageInit(){

}

export {PageInitFirst, PageInit};