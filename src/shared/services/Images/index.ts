const UnknowSkillIcon = require('@/assets/images/skill-icons/unknow.svg');

class ImageStore {
  private _items: Map<string, string>;

  constructor() {
    this._items = new Map();
  }

  append(key: string, value: string) {
    this._items.set(key, value);
  }

  get(key: string) {
    return this._items.get(key) || UnknowSkillIcon;
  }
}

const Images = {
  skillIcons: new ImageStore(),
  equipmentIcons: new ImageStore(),
  crystalIcons: new ImageStore(),
};

async function InitSkillIcons() {
  const dataModule = await import(/* webpackChunkName: "image--skill-icons" */'./LoadSkillIcons');
  dataModule.default(Images.skillIcons);
}

async function InitEquipmentIcons() {
  const dataModule = await import(/* webpackChunkName: "image--equipment-icons" */'./LoadEquipmentIcons');
  dataModule.default(Images.equipmentIcons);
}

async function InitCrystalIcons() {
  const dataModule = await import(/* webpackChunkName: "image--crystal-icons" */'./LoadCrystalIcons');
  dataModule.default(Images.crystalIcons);
}

export type { ImageStore };
export { Images, UnknowSkillIcon, InitSkillIcons, InitEquipmentIcons, InitCrystalIcons };
