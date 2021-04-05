import StatBase from './module/StatBase.js';

import { CharacterStatCategory } from "./CharacterStat/class/main.js"

class CharacterSystem {
  constructor() {
    this.statList = [];
    this.characterStatCategoryList = [];
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

CharacterSystem.CharacterStatCategory = CharacterStatCategory;

export default CharacterSystem;