import {GetLang, InitLanguageData, PageInitLanguage} from "../module/LanguageSystem.js";
import {PageInitFirst} from "../module/PageInit.js";
import {Icons, PageInitIcons} from "../module/SvgIcons.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";

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
	root.querySelector('.switch-font > .buttons > .switch').addEventListener('click', function(e){
		const k = 'main-font-family';
		const cur = localStorage[k];
		if ( cur && cur === '1' ){
			localStorage.removeItem(k);
			document.querySelector('body').classList.add('font1', 'zh');
		}
		else {
			localStorage[k] = '1';
			document.querySelector('body').classList.remove('font1', 'zh');
		}
	});
}

function readyFirst(){
	InitLanguageData({zh_tw, en, ja});
	PageInitFirst();
}

function ready(setting){
	const {top_menu} = setting;
	LoadingMenu(top_menu);

	PageInitLanguage();

	PageInitIcons();

	InitSettings();

	document.title = GetLang('Page Title');
}

export {readyFirst, ready};