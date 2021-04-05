import { EnchantCategory } from "./module/EnchantElement.js";
import EnchantSimulatorController from "./module/EnchantSimulatorController.js";

import { EnchantItemBase } from "./module/EnchantElement.js";

export default class EnchantSystem {
  constructor() {
    this.categorys = [];
  }
  appendCategory() {
    const t = new EnchantCategory(...arguments);
    this.categorys.push(t);
    return t;
  }
  init_EnchantSimulator(main_node) {
    this.EnchantSimulatorController = new EnchantSimulatorController(this);
    this.EnchantSimulatorController.init(main_node);
  }
}

EnchantSystem.EnchantItemBase = EnchantItemBase;