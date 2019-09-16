import {SkillRoot} from "./module/SkillElements.js";
import {LoadSkillData, LoadSkillMainData} from "./module/LoadSkillData.js";
import DataPath from "../main/module/DataPath.js";
import SkillQueryController from "./module/SkillQueryController.js";
import {currentLanguage, secondLanguage} from "../main/module/LanguageSystem.js";


class SkillSystem {
	constructor(){
		this.skillRoot = new SkillRoot(this);
	}
	async init(){
		const _this = this;

		//
		let SkillData, lang_SkillData = null, slang_SkillData  = null;
		await new Promise((resolve, reject) => {
			Papa.parse(DataPath().SkillData, {
				download: true,
				complete(res){
					resolve();
					SkillData = res.data;
				},
				error(err){
					console.warn("讀取技能資料時發生錯誤。");
					console.log(err);
					reject();
				}
			});
		});
		// 語言資料。語言為繁體中文則無需載入。
		if ( currentLanguage() != 1 ){
			await new Promise((resolve, reject) => {
				const data = DataPath().lang_SkillData[currentLanguage()];
				if ( data ){
					Papa.parse(data, {
						download: true,
						complete(res){
							lang_SkillData = res.data;
							resolve();
						},
						error(err){
							console.warn("讀取技能資料時發生錯誤。");
							console.log(err);
							reject();
						}
					});
				}
			});
			if ( currentLanguage() != secondLanguage() ){
				await new Promise((resolve, reject) => {
					const data = DataPath().lang_SkillData[secondLanguage()];
					if ( data ){
						Papa.parse(data, {
							download: true,
							complete(res){
								slang_SkillData = res.data;
								resolve();
							},
							error(err){
								console.warn("讀取技能資料時發生錯誤。");
								console.log(err);
								reject();
							}
						});
					}
				});
			}
		}
		LoadSkillData(this.skillRoot, SkillData, lang_SkillData, slang_SkillData);

		//
		let SkillMainData, lang_SkillMainData = null, slang_SkillMainData = null;
		await new Promise((resolve, reject) => {
			Papa.parse(DataPath().SkillMainData, {
				download: true,
				complete(res){
					SkillMainData = res.data;
					resolve();
				},
				error(err){
					console.warn("讀取技能資料時發生錯誤。");
					console.log(err);
					reject();
				}
			});
		});
		// 語言資料。語言為繁體中文則無需載入。
		if ( currentLanguage() != 1 ){
			await new Promise((resolve, reject) => {
				const data = DataPath().lang_SkillMainData[currentLanguage()];
				if ( data ){
					Papa.parse(data, {
						download: true,
						complete(res){
							lang_SkillMainData = res.data;
							resolve();
						},
						error(err){
							console.warn("讀取技能資料時發生錯誤。");
							console.log(err);
							reject();
						}
					});
				}
			});
			if ( currentLanguage() != secondLanguage() ){
				await new Promise((resolve, reject) => {
					const data = DataPath().lang_SkillMainData[secondLanguage()];
					if ( data ){
						Papa.parse(data, {
							download: true,
							complete(res){
								slang_SkillMainData = res.data;
								resolve();
							},
							error(err){
								console.warn("讀取技能資料時發生錯誤。");
								console.log(err);
								reject();
							}
						});
					}
				});
			}
		}
		LoadSkillMainData(this.skillRoot, SkillMainData, lang_SkillMainData, slang_SkillMainData);
	}
	init_SkillQuery(sr_node){
		this.skillQueryController = new SkillQueryController(this.skillRoot);
		this.skillQueryController.initSkillQueryHTML(sr_node);
	}
}

export default SkillSystem;