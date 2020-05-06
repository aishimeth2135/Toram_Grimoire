import {SkillRoot} from "./module/SkillElements.js";
import {LoadSkillData, LoadSkillMainData} from "./module/LoadSkillData.js";
import {loadLangDatas} from "../main/module/DataPath.js";

import SkillQueryController from "./module/SkillQueryController.js";
// import SkillSimulatorController from "./module/SkillSimulator/SkillSimulatorController.js";

class SkillSystem {
	constructor(){
		this.skillRoot = new SkillRoot(this);
	}
	async* init(){
		const promise_ary = [];

		const SkillData_ary = loadLangDatas('Skill', promise_ary),
			SkillMainData_ary = loadLangDatas('Skill Main', promise_ary);

		await Promise.all(promise_ary);
		yield;

		LoadSkillData(this.skillRoot, ...SkillData_ary);
		LoadSkillMainData(this.skillRoot, ...SkillMainData_ary);
	}
	init_SkillQuery(sr_node){
		this.SkillQueryController = new SkillQueryController(this.skillRoot);
		return new Promise((resolve, reject) => {
			this.SkillQueryController.init(sr_node);
			resolve();
		});
	}
	init_SkillSimulator(main_node){
		// this.SkillSimulatorController = new SkillSimulatorController(this.skillRoot);
		// return new Promise((resolve, reject) => {
		// 	this.SkillSimulatorController.init(main_node);
		// 	resolve();
		// });
	}
}

export default SkillSystem;