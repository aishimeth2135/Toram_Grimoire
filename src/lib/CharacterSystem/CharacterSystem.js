import LoadStatData from "./module/LoadStatData.js";
import LoadCharacterStatData from "./CharacterStat/LoadCharacterStatData.js";
import StatBase from './module/StatBase.js';
import { loadLangDatas } from "../main/module/DataPath.js";

import { InitLanguageData } from "@global-modules/LanguageSystem.js"
import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";

class CharacterSystem {
  constructor() {
    this.statList = [];
    this.characterStatCategoryList = [];
  }
  init() {
    //
  }
  async *init_statList() {
    InitLanguageData({ zh_tw, en, ja });

    const promise_ary = [];
    const datas = loadLangDatas('Stats', promise_ary);

    await Promise.all(promise_ary);

    yield;

    LoadStatData(this, ...datas);
  }
  async *init_characterStatList() {
    const promise_ary = [];
    const datas = loadLangDatas('Character Stats', promise_ary);

    await Promise.all(promise_ary);

    yield;

    LoadCharacterStatData(this, ...datas);
  }
  appendStatBase(base_name, text, has_multiplier, order) {
    const t = new StatBase(base_name, text, has_multiplier, order);
    this.statList.push(t);
    return t;
  }
  StatList() {
    return this.statList;
  }
  findStatBase(bn) {
    const t = this.StatList().find(a => a.baseName == bn);
    return t;
  }
  findStatBaseFromText(t) {
    return this.StatList().find(a => a.text == t);
  }
}

export default CharacterSystem;