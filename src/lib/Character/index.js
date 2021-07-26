import { markRaw } from "vue";
import { StatBase } from './Stat';
import { CharacterStatCategory } from "./Character";

export default class {
  constructor() {
    /** @type {StatBase[]} */
    this.statList = markRaw([]);

    /** @type {CharacterStatCategory[]} */
    this.characterStatCategoryList = markRaw([]);
  }
  appendStatBase(...args) {
    const t = markRaw(new StatBase(...args));
    this.statList.push(t);
    return t;
  }
  appendCharacterStatCategory(...args) {
    const category = markRaw(new CharacterStatCategory(this, ...args));
    this.characterStatCategoryList.push(category);
    return category;
  }
  findStatBase(bn) {
    return this.statList.find(a => a.baseName === bn);
  }
  findStatBaseFromText(t) {
    return this.statList.find(a => a.text === t);
  }
}
