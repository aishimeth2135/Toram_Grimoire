import Controller from "./module/Controller.js";

import { InitLanguageData } from "@Services/Language";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";

export default class SaveLoadSystem {
    constructor(){
    }
    init(set){
        InitLanguageData({ zh_tw, en, ja, zh_cn });

        this.controller = new Controller().init(set);
        return this;
    }
}