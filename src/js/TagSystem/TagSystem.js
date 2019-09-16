import Tag from "./module/Tag.js";
import TagController from "./module/TagController.js";
import DataPath from "../main/module/DataPath.js";
import LoadTagData from "./module/LoadTagData.js";

import {currentLanguage, secondLanguage} from "../main/module/LanguageSystem.js";


export default class TagSystem {
    constructor(){
        this.tagList = [];
    }
    async init(options){
        this.controller = new TagController(this, options.mainNode).init();
        
        let TagData, lang_TagData = null, slang_TagData = null;
        await new Promise((resolve, reject) => {
            Papa.parse(DataPath().TagData, {
                download: true,
                complete(res){
                    TagData = res.data;
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
                const data = DataPath().lang_TagData[currentLanguage()];
                if ( data ){
                    Papa.parse(data, {
                        download: true,
                        complete(res){
                            lang_TagData = res.data;
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
                    const data = DataPath().lang_TagData[secondLanguage()];
                    if ( data ){
                        Papa.parse(data, {
                            download: true,
                            complete(res){
                                slang_TagData = res.data;
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
        };
        LoadTagData(this, TagData, lang_TagData, slang_TagData);
    }
    appendTag(n){
        const t = new Tag(n);
        this.tagList.push(t);
        return t;
    }
}