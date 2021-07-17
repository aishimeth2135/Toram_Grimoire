import { markRaw } from "vue";
import { StatBase } from './Stat';

export default class {
  constructor() {
    this.statList = markRaw([]);
    this.characterStatCategoryList = markRaw([]);
  }
  appendStatBase(...args) {
    const t = markRaw(new StatBase(...args));
    this.statList.push(t);
    return t;
  }
  findStatBase(bn) {
    return this.statList.find(a => a.baseName === bn);
  }
  findStatBaseFromText(t) {
    return this.statList.find(a => a.text === t);
  }
}
