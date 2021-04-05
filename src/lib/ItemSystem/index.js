import SearchController from "./module/SearchController.js";
import { Equipment, Crystal, Prop } from "./module/ItemElements.js"

export default class ItemSystem {
  constructor() {
    this.equipments = [];
    this.crystals = [];
    this.searchController = new SearchController(this);
  }
  appendEquipment() {
    const t = new Equipment(this.equipments.length, ...arguments);
    this.equipments.push(t);
    return t;
  }
  appendCrystal() {
    const t = new Crystal(this.crystals.length, ...arguments);
    this.crystals.push(t);
    return t;
  }
}

ItemSystem.Prop = Prop;