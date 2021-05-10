import { EnchantCategory } from "./Enchant";

export default class {
  constructor() {
    /** @type {EnchantCategory[]} */
    this.categorys = [];
  }
  appendCategory() {
    const t = new EnchantCategory(...arguments);
    this.categorys.push(t);
    return t;
  }
}