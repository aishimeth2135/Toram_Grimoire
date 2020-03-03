import LoadStatData from "./module/LoadStatData.js";
import StatBase from './module/StatBase.js';
import {DataPath, createLoadDataPromise, loadLangDatas} from "../main/module/DataPath.js";
import {InitLanguageData, currentLanguage, secondLanguage} from "../main/module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js"
import en from "./module/LanguageData/en.js"
import ja from "./module/LanguageData/ja.js"

import CharacterSimulatorController from "./module/CharacterSimulatorController/controller.js";


class CharacterSystem {
	constructor(){
		this.statList = [];
	}
	init(){
		//
	}
	async* init_statList(){
		InitLanguageData({zh_tw, en, ja});

		const promise_ary = [];

		const current = currentLanguage(), second = secondLanguage();
		const datas = loadLangDatas('Character Stats', promise_ary);

		// promise_ary.push(createLoadDataPromise(DataPath('Character Stats'), datas, 0));
		// if ( current != 1 ){
		// 	const path = DataPath('Character Stats/language');
		// 	promise_ary.push(createLoadDataPromise(path[current], datas, 1));
		// 	if ( current != second )
		// 		promise_ary.push(createLoadDataPromise(path[second], datas, 2));
		// }

		await Promise.all(promise_ary);

		yield;

		LoadStatData(this, ...datas);
	}
	async* init_characterSimulator(){
		this.CharacterSimulatorController = new CharacterSimulatorController();
		yield;
	}
	appendStatBase(base_name, text, has_multiplier, order){
		const t = new StatBase(base_name, text, has_multiplier, order);
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