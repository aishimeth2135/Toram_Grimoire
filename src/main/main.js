import Grimoire from "./Grimoire.js";
import SkillSystem from "../SkillSystem/SkillSystem.js";
import CharacterSystem from "../CharacterSystem/CharacterSystem.js";
import ready from "./ready.js";

"use strict";

Grimoire.SkillSystem = new SkillSystem();
Grimoire.CharacterSystem = new CharacterSystem();

async function start(){
	await Grimoire.CharacterSystem.init_statList();
	await Grimoire.SkillSystem.init();
	
	Grimoire.SkillSystem.init_SkillQuery(document.querySelector('#SkillQuery > .main'));
	
	Grimoire.characterStatList = () => Grimoire.CharacterSystem.statList;

	ready({
		top_menu: document.getElementById('top_menu')
	});
}

try {
	start();
}
catch(e) {
	console.log(e);
}




//document.getElementById('Loading_Page').style.display = 'none';
