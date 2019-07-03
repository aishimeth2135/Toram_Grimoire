import {SkillRoot} from "./module/SkillElements.js";
import LoadSkillData from "./module/LoadSkillData.js";
import DataPath from "../main/module/DataPath.js";


class SkillSystem {
	constructor(){
		this.skillRoot = new SkillRoot(this);
	}
	init(){
		const _this = this;
		return new Promise((resolve, reject) => {
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
	}
	init_SkillQuery(sr_node){
		this.skillRoot.controller.initSkillQueryHTML(sr_node);
	}
}

export default SkillSystem;