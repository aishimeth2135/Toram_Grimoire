import LoadStatData from "./module/LoadStatData.js";
import StatBase from './module/StatBase.js';
import DataPath from "../main/module/DataPath.js";
import {InitLanguageData} from "../main/module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js"
import en from "./module/LanguageData/en.js"
import ja from "./module/LanguageData/ja.js"


class CharacterSystem {
	constructor(){
		this.statList = [];
	}
	init(){
		//
	}
	init_statList(){
		InitLanguageData({zh_tw, en, ja});
		const _this = this;
		return new Promise((resolve, reject) => {
			Papa.parse(DataPath().CharacterStatData, {
				download: true,
				complete(res){
					LoadStatData(_this, res.data);
					resolve();
				},
				error(err){
					console.warn("讀取角色能力資料時發生錯誤。");
					console.log(err);
					reject();
				}
			});
		});
	}
	appendStatBase(base_name, text, has_multiplier){
		const t = new StatBase(base_name, text, has_multiplier);
		this.statList.push(t);
		return t;
	}
	StatList(){
		return this.statList;
	}
	findStatBase(bn){
		return this.StatList().find(a => a.baseName == bn);
	}
	findStatBaseFromText(t){
		return this.StatList().find(a => a.text == t);
	}
}

export default CharacterSystem;