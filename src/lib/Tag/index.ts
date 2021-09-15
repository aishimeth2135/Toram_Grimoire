import Tag from './Tag';

export default class {
  tagList: Tag[];

  constructor() {
    this.tagList = [];
  }
  appendTag(name: string) {
    const tag = new Tag(name);
    this.tagList.push(tag);
    return tag;
  }
}
