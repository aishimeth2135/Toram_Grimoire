import Grimoire from "./Grimoire.js";
import SkillSystem from "../SkillSystem/SkillSystem.js";
import CharacterSystem from "../CharacterSystem/CharacterSystem.js";
import ready from "./ready.js";

"use strict";

Grimoire.SkillSystem = new SkillSystem();
Grimoire.CharacterSystem = new CharacterSystem();

function loadingMsg(s){
	const div = document.createElement('div');
	div.innerHTML = s;
	//div.setAttribute('data-ready', '0');
	document.querySelector('div#LoadingPage > div.msg').appendChild(div);
}

async function start(){
	loadingMsg('載入角色能力清單...');
	await Grimoire.CharacterSystem.init_statList();
	loadingMsg('載入技能清單...');
	await Grimoire.SkillSystem.init();
	
	Grimoire.SkillSystem.init_SkillQuery(document.querySelector('#SkillQuery > .main'));

	ready({
		top_menu: document.getElementById('top_menu')
	});	
}

try {
	start();
}
catch(e) {
	loadingMsg(e);
	console.log(e);
}




//document.getElementById('Loading_Page').style.display = 'none';
