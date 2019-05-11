import {toLangText, ConvertLangText} from "./_module/_language.js";

function LoadingMenu(hnode){
	const menu = [
		'Skills Information|,|技能資料|,|スキルインフォ',
		'Game Mechanics|,|資料查詢|,|ゲーム関連資料',
		'Website Version|,|版本資訊|,|サイト更新履歴',
		'Web Tool|,|小工具|,|WEBツール'
	];
	const listener = function(event){
		const loc = Array.from(this.parentNode.getElementsByTagName('li')).indexOf(this);
		const cur = document.querySelector('*[data-main-scope="1"]');
		cur.setAttribute('data-main-scope', 0);
		cur.classList.add('hidden');
		let scope = document.querySelectorAll('*[data-main-scope]')[loc];
		scope.setAttribute('data-main-scope', 1);
		scope.classList.remove('hidden');
	};
	const frg = document.createDocumentFragment();
	menu.forEach((item) => {
		const li = document.createElement('li');
		li.innerHTML = toLangText(item);
		li.addEventListener('click', listener);
		frg.appendChild(li);
	});
	const ul = document.createElement('ul');
	ul.appendChild(frg);
	hnode.appendChild(ul);
}

export default function(setting){
	const {top_menu} = setting;
	LoadingMenu(top_menu);

	ConvertLangText(document);
}