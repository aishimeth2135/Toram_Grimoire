import Grimoire from "./Grimoire.js";
import SkillSystem from "../SkillSystem/SkillSystem.js";
import CharacterSystem from "../CharacterSystem/CharacterSystem.js";
import {readyFirst, ready} from "./ready.js";

function loadingMsg(s){
	const div = document.createElement('div');
	div.innerHTML = s;
	document.querySelector('div#LoadingPage > div.msg').appendChild(div);
}
function startLoadingMsg(s){
	return new Promise((resolve, reject) => {
		const div = document.createElement('div');
		div.innerHTML = s;
		document.querySelector('div#LoadingPage > div.msg').appendChild(div);
		resolve();
	});
}

async function start(){
	readyFirst();

	Grimoire.SkillSystem = new SkillSystem();
	Grimoire.CharacterSystem = new CharacterSystem();
	await startLoadingMsg('載入角色能力清單...');
	await Grimoire.CharacterSystem.init_statList().catch(() => loadingMsg('...載入失敗。'));
	await startLoadingMsg('載入技能清單...');
	await Grimoire.SkillSystem.init().catch(() => loadingMsg('...載入失敗。'));;
	
	await startLoadingMsg('初始化技能資料...');
	Grimoire.SkillSystem.init_SkillQuery(document.querySelector('#SkillQuery > .main'));

	ready({
		top_menu: document.getElementById('top_menu')
	});	
}
if ( document.getElementById('SkillQuery').getAttribute('data-ready') === '0' ){
	try {
		start();
		document.getElementById('SkillQuery').setAttribute('data-ready', '1');
	}
	catch(e) {
		loadingMsg(e);
		console.log(e);
	}
}
