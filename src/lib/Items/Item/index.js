import Grimoire from '@grimoire';
import { StatBase } from '@/lib/Character/Stat';
import { isNumberString } from '@utils/string';

class Item {
  constructor(id, name) {
    this.id = id;
    this.name = name;

    this.stats = [];
    this.statRestrictions = [];

    this.obtains = [];

    this.recipe = null;
    this.extra = null;
  }
  appendObtain() {
    const t = {};
    this.obtains.push(t);
    return t;
  }
  appendStat(baseName, v, tail, restriction) {
    if (typeof v === 'string') {
      v = isNumberString(v) ? parseFloat(v) : 0;
    }
    let type;
    switch (tail) {
    case '':
      type = StatBase.TYPE_CONSTANT;
      break;
    case '%':
      type = StatBase.TYPE_MULTIPLIER;
      break;
    case '~':
      type = StatBase.TYPE_TOTAL;
      break;
    }
    const statBase = Grimoire.Character.findStatBase(baseName);
    if (!statBase) {
      console.warn('[Character] Can\'t find stat-base with id: ' + baseName);
      return;
    }
    const stat = statBase.createStat(type, v);
    this.stats.push(stat);
    this.statRestrictions.push(restriction);
  }
  setExtra() {
    this.extra = {};
    return this.extra;
  }
}

class Equipment extends Item {
  constructor(id, n, cat, bv, bstab, cap) {
    super(id, n);

    this.category = cat;

    this.baseValue = bv;
    this.baseStability = bstab || 0;

    this.caption = cap;

    this.unknowCategory = null;
  }
  setRecipe() {
    this.recipe = {};
    return this.recipe;
  }
}

class Crystal extends Item {
  constructor(id, name, cat, boss_cat) {
    super(id, name);

    this.category = cat;
    this.bossCategory = boss_cat;
    this.enhancer = null;
  }
  setEnhancer(t) {
    this.enhancer = t;
  }
}

class Prop {
  constructor(name, quantity, cat) {
    this.name = name;
    this.quantity = quantity;
    this.category = cat;
  }
}
Prop.CATEGORY_MATERIAL = Symbol('Material');
Prop.CATEGORY_MATERIAL_POINT = Symbol('Material Point');

export { Equipment, Crystal, Prop };
