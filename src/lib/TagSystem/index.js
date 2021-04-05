import Tag from "./module/Tag.js";

export default class TagSystem {
  constructor() {
    this.tagList = [];
  }
  appendTag(n) {
    const t = new Tag(n);
    this.tagList.push(t);
    return t;
  }
}