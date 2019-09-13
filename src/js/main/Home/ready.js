import {GetLang, InitLanguageData, currentLanguage, PageInitLanguage} from "../module/LanguageSystem.js";
import {PageInitFirst} from "../module/PageInit.js";
import {Icons, PageInitIcons} from "../module/SvgIcons.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";

import CY from "../module/cyteria.js";


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
}

function readyFirst(){
	InitLanguageData({zh_tw, en, ja, zh_cn});
	PageInitFirst();
}

function ready(setting){
	PageInitLanguage();

	const {top_menu} = setting;
	LoadingMenu(top_menu);

	PageInitIcons();

	InitSettings();

	document.title = GetLang('Page Title');
}

export {readyFirst, ready};