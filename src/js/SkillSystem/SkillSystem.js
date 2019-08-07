import {SkillRoot} from "./module/SkillElements.js";
import {LoadSkillData, LoadSkillMainData} from "./module/LoadSkillData.js";
import DataPath from "../main/module/DataPath.js";
import SkillQueryController from "./module/SkillQueryController.js";


class SkillSystem {
	constructor(){
		this.skillRoot = new SkillRoot(this);
	}
	async init(){
		const _this = this;
		await new Promise((resolve, reject) => {
			Papa.parse(DataPath().SkillData, {
				download: true,
				complete(res){
					LoadSkillData(_this.skillRoot, res.data);
					resolve();
				},
				error(err){
					console.warn("讀取技能資料時發生錯誤。");
					console.log(err);
					reject();
				}
			});
		});
		await new Promise((resolve, reject) => {
			Papa.parse(DataPath().SkillMainData, {
				download: true,
				complete(res){
					LoadSkillMainData(_this.skillRoot, res.data);
					resolve();
				},
				error(err){
					console.warn("讀取技能資料時發生錯誤。");
					console.log(err);
					reject();
				}
			});
		});
	}
	init_SkillQuery(sr_node){
		this.skillQueryController = new SkillQueryController(this.skillRoot);
		this.skillQueryController.initSkillQueryHTML(sr_node);
	}
}

export default SkillSystem;