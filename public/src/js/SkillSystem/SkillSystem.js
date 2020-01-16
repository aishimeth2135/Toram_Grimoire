import {SkillRoot} from "./module/SkillElements.js";
import {LoadSkillData, LoadSkillMainData} from "./module/LoadSkillData.js";
import {DataPath, createLoadDataPromise} from "../main/module/DataPath.js";
import {currentLanguage, secondLanguage} from "../main/module/LanguageSystem.js";

import SkillQueryController from "./module/SkillQueryController.js";
import SkillSimulatorController from "./module/SkillSimulator/SkillSimulatorController.js";

class SkillSystem {
	constructor(){
		this.skillRoot = new SkillRoot(this);
	}
	async* init(){
		const _this = this;

		const current = currentLanguage(), second = secondLanguage();

		const promise_ary = [];

		const SkillData_ary = Array(3), SkillMainData_ary = Array(3);

		promise_ary.push(createLoadDataPromise(DataPath('Skill'), SkillData_ary, 0));
		if ( current != 1 ){
			const path = DataPath('Skill/language');
			promise_ary.push(createLoadDataPromise(path[current], SkillData_ary, 1));
			if ( current != second )
				promise_ary.push(createLoadDataPromise(path[second], SkillData_ary, 2));
		}
		promise_ary.push(createLoadDataPromise(DataPath('Skill Main'), SkillMainData_ary, 0));
		if ( current != 1 ){
			const path = DataPath('Skill Main/language');
			promise_ary.push(createLoadDataPromise(path[current], SkillMainData_ary, 1));
			if ( current != second )
				promise_ary.push(createLoadDataPromise(path[second], SkillMainData_ary, 2));
		}

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
		this.SkillSimulatorController = new SkillSimulatorController(this.skillRoot);
		return new Promise((resolve, reject) => {
			this.SkillSimulatorController.init(main_node);
			resolve();
		});
	}
}

export default SkillSystem;