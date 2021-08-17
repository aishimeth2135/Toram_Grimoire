import Tag from './Tag';

export default class {
  constructor() {
    this.tagList = [];
  }
  appendTag(n) {
    const t = new Tag(n);
    this.tagList.push(t);
    return t;
  }
}
