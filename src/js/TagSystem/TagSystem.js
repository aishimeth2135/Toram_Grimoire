import Tag from "./module/Tag.js";
import TagController from "./module/TagController.js";
import {DataPath, createLoadDataPromise} from "../main/module/DataPath.js";
import LoadTagData from "./module/LoadTagData.js";

import {currentLanguage, secondLanguage} from "../main/module/LanguageSystem.js";


export default class TagSystem {
    constructor(){
        this.tagList = [];
    }
    async* init(options){
        this.controller = new TagController(this, options.mainNode).init();

        const datas = [];

        const promise_ary = [];

        promise_ary.push(createLoadDataPromise(DataPath('Tag'), datas, 0));
        
        // 語言資料。語言為繁體中文則無需載入。
        if ( currentLanguage() != 1 ){
            const path = DataPath('Tag/language');
            promise_ary.push(createLoadDataPromise(path[currentLanguage()], datas, 1));
            if ( currentLanguage() != secondLanguage() )
                promise_ary.push(createLoadDataPromise(path[secondLanguage()], datas, 2));
        };
        
        await Promise.all(promise_ary);
        yield;

        LoadTagData(this, ...datas);
    }
    appendTag(n){
        const t = new Tag(n);
        this.tagList.push(t);
        return t;
    }
}