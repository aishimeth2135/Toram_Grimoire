import { markRaw } from "vue";
import { EnchantCategory } from "./Enchant";

export default class {
  constructor() {
    /** @type {EnchantCategory[]} */
    this.categorys = markRaw([]);
  }
  appendCategory() {
    const t = markRaw(new EnchantCategory(...arguments));
    this.categorys.push(t);
    return t;
  }
}
