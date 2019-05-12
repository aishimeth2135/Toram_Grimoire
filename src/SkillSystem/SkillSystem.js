import {SkillRoot} from "./module/SkillElements.js";
import LoadSkillData from "./module/LoadSkillData.js";
import InitSkillData from "./module/InitSkillData.js";

function SkillSystem(){
	this.skillRoot = new SkillRoot(this);
}
SkillSystem.prototype = {
	init(){
		return new Promise((resolve, reject) => {
			$.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv', res => {
				LoadSkillData(this.skillRoot, res);
				InitSkillData(this.skillRoot);
				resolve();
			});
		});
	},
	init_SkillQuery(sr_node){
		this.skillRoot.controller.initSkillQueryHTML(sr_node);
	}
};

export default SkillSystem;