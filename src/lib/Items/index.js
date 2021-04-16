import { Equipment, Crystal } from "./Item";

export default class {
  constructor() {
    this.equipments = [];
    this.crystals = [];
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