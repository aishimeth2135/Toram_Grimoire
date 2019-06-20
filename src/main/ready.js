import {toLangText, ConvertLangText} from "./module/LangText.js";
import GetLang from "./module/LanguageSystem.js"

function LoadingMenu(hnode){
	const menu = GetLang('Top Menu');
	// Skills Information|,|技能資料|,|スキルインフォ
	// Game Mechanics|,|資料查詢|,|ゲーム関連資料
	// Website Version|,|版本資訊|,|サイト更新履,
	// Web Tool|,|小工具|,|WEBツール
	const target = [
		'SkillQuery'
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
	setting.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>';
	ul.appendChild(setting);

	hnode.appendChild(ul);
}

function InitLanguage(){
	document.querySelectorAll("*[data-langid]").forEach(a => {
		a.innerHTML = GetLang(a.getAttribute('data-langid'));
		a.removeAttribute('data-langid');
	});
}

function InitSettings(){
	const root = document.querySelector('#Settings');
	root.querySelector('.SwitchFont > .buttons > .switch').addEventListener('click', function(e){
		const k = 'main font family';
		const cur = localStorage[k];
		if ( cur && cur === '1' ){
			localStorage.removeItem(k);
			document.querySelector('body').classList.add('font1');
		}
		else {
			localStorage[k] = '1';
			document.querySelector('body').classList.remove('font1');
		}
	});
}

function readyFirst(){
	if ( localStorage['main font family'] !== '1' )
		document.querySelector('body').classList.add('font1');
}

function ready(setting){
	const {top_menu} = setting;
	LoadingMenu(top_menu);

	ConvertLangText(document);

	InitLanguage();

	InitSettings();

	document.title = GetLang('Page Title');
}

export {readyFirst, ready};