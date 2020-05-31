import { DataPath, createLoadDataPromise } from "../main/module/DataPath.js";
import LoadEquipmentData from "./module/LoadEquipmentData.js";
import LoadCrystalData from "./module/LoadCrystalData.js";
import { Items } from "./module/ItemElements.js";
import SearchController from "./module/SearchController.js";

export default class ItemSystem {
  constructor() {
    this.items = new Items();
    this.searchController = new SearchController(this);
  }
  async *init() {
    const datas = [];

    const path = DataPath('Equipment/divided');

    const promise_ary = Array(3).fill().map((p, i) => createLoadDataPromise(path[i], datas, i));

    const crystal_data = [];
    promise_ary.push(createLoadDataPromise(DataPath('Crystal'), crystal_data, 0));

    await Promise.all(promise_ary);

    yield;

    LoadEquipmentData(this.items, datas.flat());
    LoadCrystalData(this.items, crystal_data[0]);
  }
}