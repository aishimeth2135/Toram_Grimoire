import LoadStatData from "./_module/LoadStatData.js";
import StatBase from './_module/StatBase.js';

function CharacterSystem(){
	this.statList = [];
}

CharacterSystem.prototype = {
	init(){
		//
	},
	//https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=616452461&single=true&output=csv
	init_statList(){
		return new Promise((resolve, reject) => {
			$.get('./src/CharacterSystem/_module/other/BaseStatData.csv', res => {
				LoadStatData(this, res);
				resolve();
			});
		});
	},
	appendStatBase(base_name, caption, has_multiplier, other){
		const t = new StatBase(base_name, caption, has_multiplier);
		this.statList.push(t);
		return t;
	},
	StatList(){
		return this.statList;
	},
	findStatBase(bn){
		return this.StatList().find(a => a.baseName == bn);
	}
}

export default CharacterSystem;