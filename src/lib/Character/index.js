import { StatBase } from './Stat';


export default class {
  constructor() {
    this.statList = [];
    this.characterStatCategoryList = [];
  }
  appendStatBase(...args) {
    const t = new StatBase(...args);
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