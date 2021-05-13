import { markRaw } from "vue";
import { Equipment, Crystal } from "./Item";

export default class {
  constructor() {
    this.equipments = markRaw([]);
    this.crystals = markRaw([]);
  }
  appendEquipment() {
    const t = markRaw(new Equipment(this.equipments.length, ...arguments));
    this.equipments.push(t);
    return t;
  }
  appendCrystal() {
    const t = markRaw(new Crystal(this.crystals.length, ...arguments));
    this.crystals.push(t);
    return t;
  }
}