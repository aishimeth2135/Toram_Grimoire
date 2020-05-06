import Tag from "./module/Tag.js";
import TagController from "./module/TagController.js";
import {loadLangDatas} from "../main/module/DataPath.js";
import LoadTagData from "./module/LoadTagData.js";

import {currentLanguage, secondLanguage} from "../main/module/LanguageSystem.js";


export default class TagSystem {
    constructor(){
        this.tagList = [];
    }
    async* init(){
        const promise_ary = [];
        const datas = loadLangDatas('Tag', promise_ary);

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