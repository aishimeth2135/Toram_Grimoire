import { markRaw } from 'vue';

import { Equipment, Crystal } from './Item';

export default class ItemsSystem {
  equipments: Equipment[];
  crystals: Crystal[];

  constructor() {
    this.equipments = markRaw([]);
    this.crystals = markRaw([]);
  }
  appendEquipment(name: string, category: number, baseValue: number, stability: number, caption: string) {
    const item = markRaw(new Equipment(this.equipments.length, name, category, baseValue, stability, caption));
    this.equipments.push(item);
    return item;
  }
  appendCrystal(name: string, category: number, bossCategory: number) {
    const item = markRaw(new Crystal(this.crystals.length, name, category, bossCategory));
    this.crystals.push(item);
    return item;
  }
}
