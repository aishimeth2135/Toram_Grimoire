import LoadStatData from "./module/LoadStatData.js";
import StatBase from './module/StatBase.js';
import {DataPath, createLoadDataPromise} from "../main/module/DataPath.js";
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
	async* init_statList(){
		InitLanguageData({zh_tw, en, ja});

		const datas = [];

		await createLoadDataPromise(DataPath('Character Stats'), datas, 0);
		yield;

		LoadStatData(this, datas[0]);
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