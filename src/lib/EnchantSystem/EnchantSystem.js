import { DataPath, createLoadDataPromise } from "../main/module/DataPath.js";
import LoadEnchantData from "./module/LoadEnchantData.js";
import { EnchantCategory } from "./module/EnchantElement.js";
import EnchantSimulatorController from "./module/EnchantSimulatorController.js";


export default class EnchantSystem {
  constructor() {
    this.categorys = [];
  }
  async *init() {
    const datas = [];
    await createLoadDataPromise(DataPath('Enchant'), datas, 0);
    yield;

    LoadEnchantData(this, datas[0]);
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