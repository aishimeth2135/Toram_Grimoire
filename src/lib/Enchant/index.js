import { EnchantCategory } from "./Enchant";
import EnchantSimulatorController from "./render/EnchantSimulatorController.js";

export default class {
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