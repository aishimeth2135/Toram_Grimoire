import StatBase from "../../module/StatBase.js";
import { SimpleStat } from "../../module/StatBase.js";
import { MainWeapon, SubWeapon, SubArmor, BodyArmor } from "./CharacterEquipment.js";
import Grimoire from "@Grimoire";

class Character {
  constructor(name = 'Potum') {
    this.name = name;

    this.level = 1;
    this._baseStats = [];
    this._optinalBaseStat = null;

    this.equipmentFields = [];

    // init
    this._baseStats.push(...['STR', 'DEX', 'INT', 'AGI', 'VIT']
      .map(p => new CharacterBaseStat(p)));

    [
      EquipmentField.TYPE_MAIN_WEAPON,
      EquipmentField.TYPE_SUB_WEAPON,
      EquipmentField.TYPE_BODY_ARMOR,
      EquipmentField.TYPE_ADDITIONAL,
      EquipmentField.TYPE_SPECIAL, {
        type: EquipmentField.TYPE_AVATAR,
        numbers: 3
      }
    ].map(p => {
      if (typeof p == 'object') {
        Array(p.numbers).fill().forEach((_, i) => {
          this.equipmentFields.push(new EquipmentField(this, p.type, i));
        });
        return;
      }
      this.equipmentFields.push(new EquipmentField(this, p));
    })
  }

  get baseStats() {
    const res = this._baseStats.slice();
    this._optinalBaseStat && res.push(this._optinalBaseStat);
    return res;
  }
  get normalBaseStats() {
    return this._baseStats;
  }
  get optionalBaseStat() {
    return this._optinalBaseStat;
  }

  equipmentField(type) {
    return this.equipmentFields.find(p => p.type == type);
  }
  fieldEquipment(type) {
    const t = this.equipmentField(type);
    return t ? (t.equipment || void 0) : void 0;
  }
  hasOptinalBaseStat() {
    return this._optinalBaseStat ? true : false;
  }
  setOptinalBaseStat(name) {
    const list = Character.OPTIONAL_BASE_STAT_LIST;
    if (!list.includes(name))
      throw new Error('argument "name" must be in the following list: ' + list.join(', '));

    this._optinalBaseStat = new CharacterBaseStat(name);
  }
  clearOptinalBaseStat() {
    this._optinalBaseStat = null;
  }
  baseStat(name) {
    if (Character.OPTIONAL_BASE_STAT_LIST.includes(name))
      return this._optinalBaseStat == null || this._optinalBaseStat.name != name ?
        null : this._optinalBaseStat;
    return this._baseStats.find(p => p.name == name);
  }
  baseStatValue(name) {
    const stat = this.baseStat(name);
    return stat ? stat.value : 0;
  }
  checkFieldEquipmentType(field_type, eq_type) {
    return this.equipmentField(field_type).equipmentType == eq_type;
  }
  testSubWeapon(sub_type, main_type) {
    const t = [];
    main_type = main_type || this.equipmentField(EquipmentField.TYPE_MAIN_WEAPON).equipmentType;
    switch (main_type) {
      case MainWeapon.TYPE_ONE_HAND_SWORD:
        t.push(MainWeapon.TYPE_ONE_HAND_SWORD);
        // fall through
      case EquipmentField.EMPTY:
      case MainWeapon.TYPE_BOWGUN:
      case MainWeapon.TYPE_STAFF:
        t.push(MainWeapon.TYPE_KNUCKLE);
        // fall through
      case MainWeapon.TYPE_KNUCKLE:
        t.push(MainWeapon.TYPE_MAGIC_DEVICE, SubArmor.TYPE_SHIELD);
        // fall through
      case MainWeapon.TYPE_HALBERD:
        t.push(SubWeapon.TYPE_ARROW);
        // fall through
      case MainWeapon.TYPE_KATANA:
        t.push(SubWeapon.TYPE_DAGGER);
        break;
      case MainWeapon.TYPE_BOW:
        t.push(SubWeapon.TYPE_ARROW, MainWeapon.TYPE_KATANA);
    }
    return t.includes(sub_type);
  }

  copy() {
    const chara = new Character(this.name + '*');
    chara.level = this.level;
    this.normalBaseStats.forEach(p => {
      const find = chara.normalBaseStats.find(a => a.name == p.name);
      find.value = p.value;
    });
    chara.setOptinalBaseStat(this.optionalBaseStat.name);
    chara.optionalBaseStat.value = this.optionalBaseStat.value;

    this.equipmentFields.forEach(p => {
      if (p.isEmpty())
        return;
      const find = chara.equipmentFields.find(a => a.type == p.type && a.index == p.index);
      find.setEquipment(p.equipment);
    });

    return chara;
  }

  // save and load with json-data
  save(equipments) {
    const data = {};

    // == [ name ] =====
    data.name = this.name;
    data.level = this.level;
    data.normalBaseStats = this.normalBaseStats.map(p => ({
      name: p.name,
      value: p.value
    }));
    if (this.optionalBaseStat) {
      data.optionalBaseStat = {
        name: this.optionalBaseStat.name,
        value: this.optionalBaseStat.value
      };
    }

    const fieldTypes = {
      [EquipmentField.TYPE_MAIN_WEAPON]: 'main_weapon',
      [EquipmentField.TYPE_SUB_WEAPON]: 'sub_weapon',
      [EquipmentField.TYPE_BODY_ARMOR]: 'body_armor',
      [EquipmentField.TYPE_ADDITIONAL]: 'additional',
      [EquipmentField.TYPE_SPECIAL]: 'special',
      [EquipmentField.TYPE_AVATAR]: 'avatar'
    };
    data.fields = this.equipmentFields.map(p => {
      let idx = -1;
      if (p.equipment != null) {
        idx = equipments.indexOf(p.equipment);
        if (idx == -1) {
          console.warn('Can not find equipment of Field in List of equipments');
          return null;
        }
      }
      return {
        type: fieldTypes[p.type],
        index: p.index,
        equipmentIndex: idx
      };
    }).filter(p => p);

    return data;
  }
  load(data, equipments) {
    try {
      let success = true;

      const { name, level, normalBaseStats, optionalBaseStat, fields } = data;
      this.name = name;
      this.level = level;
      normalBaseStats.forEach(p => {
        const find = this.normalBaseStats.find(a => a.name == p.name);
        if (find)
          find.value = p.value;
        else {
          console.warn('Can not find CharacterBaseStat which name: ' + p.name);
          success = false;
        }
      });
      if (optionalBaseStat) {
        this.setOptinalBaseStat(optionalBaseStat.name);
        if (this.optionalBaseStat)
          this.optionalBaseStat.value = optionalBaseStat.value;
        else {
          console.warn('Can not find Optional-CharacterBaseStat which name: ' + optionalBaseStat.name);
          success = false;
        }
      }
      const fieldTypes = {
        'main_weapon': EquipmentField.TYPE_MAIN_WEAPON,
        'sub_weapon': EquipmentField.TYPE_SUB_WEAPON,
        'body_armor': EquipmentField.TYPE_BODY_ARMOR,
        'additional': EquipmentField.TYPE_ADDITIONAL,
        'special': EquipmentField.TYPE_SPECIAL,
        'avatar': EquipmentField.TYPE_AVATAR
      };
      fields.forEach(p => {
        if (p.equipmentIndex != -1) {
          const find = this.equipmentFields.find(f => f.type == fieldTypes[p.type] && f.index == p.index);
          if (find) {
            const eq = equipments[p.equipmentIndex];
            if (eq)
              find.equipment = eq;
            else
              console.warn(`Index: ${p.index} of equipments is null.`);
          }
          else {
            console.warn(`Can not find Equipment Field of Character which type: ${p.type} , index: ${p.index}`);
            success = false;
          }
        }
      });

      return {
        success
      };
    } catch (e) {
      console.warn(e);
      return {
        error: true
      };
    }
  }
}
Character.OPTIONAL_BASE_STAT_LIST = ['TEC', 'MEN', 'LUK', 'CRT'];

class CharacterBaseStat {
  constructor(name, value = 1) {
    this.name = name;
    this.value = value;
  }
}

class EquipmentField {
  /**
   * @param  {Character} parent 屬於的Character
   * @param  {symbol}    type   Equipment.TYPE_XXX
   * @param  {Number}    index  同樣的type有多個時才需要指定，表示是第幾個。
   */
  constructor(parent, type, index = 0) {
    this._parent = parent;
    this.type = type;
    this.index = index;

    this.equipment = null;
  }

  get belongCharacter() {
    return this._parent;
  }
  get equipmentType() {
    if (this.isEmpty())
      return EquipmentField.EMPTY;
    return this.equipment.type;
  }

  setEquipment(eq) {
    this.equipment = eq;
    if (this.type == EquipmentField.TYPE_MAIN_WEAPON) {
      const c = this.belongCharacter;
      const sub = c.equipmentField(EquipmentField.TYPE_SUB_WEAPON);
      if (!c.testSubWeapon(sub.equipmentType, this.equipmentType))
        sub.removeEquipment();
    }
  }
  removeEquipment() {
    this.setEquipment(null);
  }
  isEmpty() {
    return this.equipment == null;
  }
  statsDisable() {
    if (!this.isEmpty() && this.type == EquipmentField.TYPE_SUB_WEAPON) {
      const eq = this.equipment;
      return !(eq instanceof SubWeapon) && !(eq instanceof SubArmor);
    }
    return false;
  }
}

EquipmentField.TYPE_MAIN_WEAPON = Symbol('main-weapon');
EquipmentField.TYPE_SUB_WEAPON = Symbol('sub-weapon');
EquipmentField.TYPE_BODY_ARMOR = Symbol('body-armor');
EquipmentField.TYPE_ADDITIONAL = Symbol('additional');
EquipmentField.TYPE_SPECIAL = Symbol('special');
EquipmentField.TYPE_AVATAR = Symbol('avatar');

EquipmentField.EMPTY = Symbol('empty');

class CharacterStatCategory {
  constructor(name) {
    this.name = name;
    this.stats = [];
  }
  appendStat(...args) {
    const t = new CharacterStat(this, ...args);
    this.stats.push(t);
    return t;
  }
}


class CharacterStat {
  constructor(cat, id, name, displayFormula, link, max, min, caption, hidden_option) {
    this.category = cat;

    this.id = id;
    this.name = name;
    this.displayFormula = displayFormula;
    this.link = link; // const
    this.max = max;
    this.min = min;
    this.caption = caption;
    this.options = {
      hidden: hidden_option // -1: default, 0: always hidden, 1: hidden when cvalue, mvalue and tvalue are zero
    };

    this._formula = null;
    this.isBoolStat = false;
    this.linkedStatBase = null;

    if (this.link) {
      const base = Grimoire.CharacterSystem.findStatBase(this.link);
      if (!base)
        console.warn(`Link of CharacterStat: ${this.link} is not found.`);
      else {
        this.isBoolStat = base.checkBoolStat();
        this.linkedStatBase = base;
      }
    }
  }

  setFormula(str) {
    this._formula = new CharacterStatFormula(this, str);
    return this._formula;
  }
  getDisplayValue(v, ignoreDecimal = false) {
    let displayFormula = this.displayFormula;
    if (!displayFormula.match(/\$(?:\.\d)?v/)) {
      displayFormula = '$v' + displayFormula;
    }
    return displayFormula.replace(/\$(?:\.(\d))?v/, (m, m1) => {
      if (ignoreDecimal)
        return v;
      return m1 !== void 0 ?
        v.toFixed(parseInt(m1, 10)) :
        Math.floor(v);
    });
  }
  result(character_simple_stats, vars) {
    try {
      const res = this._formula.calc(character_simple_stats, vars);
      let value = res.value;
      const originalValue = value;

      if (typeof value != 'number')
        value = parseFloat(value);
      if (this.max != null && value > this.max)
        value = this.max;
      if (this.min != null && value < this.min)
        value = this.min;

      const ho = this.options.hidden;
      const displayValue = this.getDisplayValue(value);

      // resultValue: after min-max and to integer
      const resultValue = parseFloat(displayValue.replace(/[^\-\d.]/g, ''));

      return {
        origin: this,
        value,
        resultValue,
        displayValue,
        statValueParts: res.statValueParts,
        statPartsDetail: res.statPartsDetail,
        conditionalBase: res.conditionalBase,
        hidden: ho == 0 ||
          (ho == 1 && ['constant', 'multiplier', 'total'].every(a => res.statValueParts[a] == 0)) ||
          (ho == 2 && originalValue == 0)
      };
    } catch (e) {
      console.warn(e);
      return 0;
    }
  }
}


class CharacterStatFormula {
  constructor(parent, str) {
    this._parent = parent;
    this.formula = str;
    this.conditionValues = [];
  }
  get belongCharacterStat() {
    return this._parent;
  }
  appendConditionValue(conditional, formula, options) {
    options = options.split(/\s*,\s*/);
    this.conditionValues.push({
      conditional,
      formula,
      options
    });
  }
  calc(simple_stats, vars) {
    const reduceValue = v => { // eslint-disable-line
      const neg = v < 0;
      v = Math.abs(v);

      let p = 1, res = neg ? 100 : 0;

      while (v != 0) {
        const t = Math.min(v, 50);
        res = neg ? res * (100 + t) / 100 : res + t / p;
        v -= t;
        p *= 2;
      }

      return neg ? -1 * (res - 100) : res;
    };

    const safeEval = (v, dv) => {
      try {
        return eval(v);
      } catch (e) {
        console.warn('error handle: ' + v);
        console.warn(e);
        return dv === void 0 ? '0' : dv;
      }
    };

    const handleVar = (from, var_str, def_v, is_object = false) => {
      const [v1, v2] = var_str.split('.');
      if (from[v1] === void 0)
        return def_v;
      if (!is_object && typeof from[v1] == 'object') {
        if (v2 === void 0)
          return def_v;
        const t = from[v1][v2];
        return t !== void 0 ? t : def_v;
      }
      return from[v1];
    }

    const checkBaseName = stat => stat.baseName() == this.belongCharacterStat.link;
    const c_stat = simple_stats.find(stat => checkBaseName(stat) && stat.type == StatBase.TYPE_CONSTANT),
      m_stat = simple_stats.find(stat => checkBaseName(stat) && stat.type == StatBase.TYPE_MULTIPLIER),
      t_stat = simple_stats.find(stat => checkBaseName(stat) && stat.type == StatBase.TYPE_TOTAL);
    let cvalue = c_stat ? c_stat.statValue() : 0,
      mvalue = m_stat ? m_stat.statValue() : 0,
      tvalue = t_stat ? t_stat.statValue() : 0;

    // const hexVarlist = ['cvalue', 'mvalue', 'tvalue']; // 一般的#變數

    let defaultFormula = true;

    const statPartsDetail = {
      additionalValues: {
        constant: [],
        multiplier: [],
        total: [],
        base: []
      },
      initValue: {
        constant: cvalue,
        multiplier: mvalue,
        total: tvalue,
        base: 0
      }
    }

    const handleFormula = f => {
      // console.group('formula: before: ', f);
      f = f
        .replace(/\$([a-zA-Z0-9_.]+)/g, (m, m1) => {
          const a = handleVar(vars.value['$'], m1, null, true);
          return a ? a.result(simple_stats, vars).resultValue.toString() : '0';
        })
        .replace(/@([a-zA-Z0-9_.]+)/g, (m, m1) => {
          return handleVar(vars.value['@'], m1, '0');
        })
        .replace(/#([cmt]value)/g, (m, m1) => {
          defaultFormula = false;
          switch (m1) {
            case 'cvalue':
              return cvalue;
            case 'mvalue':
              return mvalue;
            case 'tvalue':
              return tvalue;
          }
        })
        .replace(/#([a-zA-Z0-9_.]+)/g, (m, m1) => {
          return handleVar(vars.value['#'], m1, '0');
        })
        .replace(/-{2,}/g, m => Number.isInteger(m.length/2) ? '+' : '-'); 
      // console.log('formula: after: ', f);
      // console.groupEnd();
      return safeEval(f);
    }

    const conditions = this.conditionValues
      .map(p => {
        let statBasePart = null,
          result = true,
          isMul = false,
          isBase = false;

        if (p.conditional != '#') {
          const c = p.conditional
            .replace(/"[^"]+"/g, 'true')
            .replace(/@([a-zA-Z0-9_.]+)/g, (m, m1) => {
              const t = handleVar(vars.conditional['@'], m1, true);
              return t ? 'true' : 'false';
            })
            .replace(/#([a-zA-Z0-9_.]+)/g, (m, m1) => {
              const t = handleVar(vars.conditional['#'], m1, true);
              return t ? 'true' : 'false';
            });
          result = safeEval(c, true);
        }
        p.options.forEach(option => {
          const m = option.match(/#([cmt]value)/);
          if (m) {
            if (statBasePart == null)
              statBasePart = m[1];
          } else if (option == '#base') {
            isBase = true;
          } else if (option == '#mul') {
            isMul = true;
          }
        })
        return {
          conditional: p.conditional,
          formula: p.formula,
          options: p.options,
          result,
          statBasePart,
          isMul,
          isBase
        };
      })
      .filter(p => p.result)

    // #base不能和#[cmt]value共存，同時存在時，#base優先級高於#[cmt]value
    conditions
      .filter(p => p.statBasePart != null && !p.isBase)
      .forEach(p => {
        const t = p.statBasePart;
        const v = handleFormula(p.formula);
        const data = {
          conditional: p.conditional,
          options: p.options,
          value: v
        };
        switch (t) {
          case 'cvalue':
            cvalue += v;
            statPartsDetail.additionalValues.constant.push(data);
            break;
          case 'mvalue':
            mvalue += v;
            statPartsDetail.additionalValues.multiplier.push(data);
            break;
          case 'tvalue':
            tvalue += v;
            statPartsDetail.additionalValues.total.push(data);
            break;
        }
    });

    const conditionalBase = conditions.find(p => p.isBase);

    const extra_values = conditions
      .filter(p => !p.isBase)
      .filter(p => p.statBasePart == null)
      .map(p => {
        const v = handleFormula(p.formula);
        statPartsDetail.additionalValues.base.push({
          conditional: p.conditional,
          options: p.options,
          isMul: p.isMul,
          value: v
        });
        return {
          isMul: p.isMul,
          value: v
        };
      });

    const add_values = extra_values
      .filter(p => !p.isMul).map(p => p.value);
    const mul_values = extra_values
      .filter(p => p.isMul).map(p => p.value);

    let res = 0, basev = 0, initBasev = 0;

    const formula = conditionalBase ? conditionalBase.formula : this.formula;

    // formula是"0"的話，計算結果無條件為0。
    if (formula !== '0') {
      const sum = ary => ary.reduce((cur, v) => cur + v, 0);
      const mul = ary => ary.reduce((cur, v) => cur * v, 1);

      if (formula && formula.includes('#base')) {
        basev = sum(add_values) * mul(mul_values);
        res = handleFormula(this.formula.replace('#base', basev));
      } else {
        initBasev = formula ? handleFormula(formula) : 0;
        basev = sum([initBasev, ...add_values]) * mul(mul_values);
        res = defaultFormula ? (basev * (100 + mvalue) / 100 + cvalue) * (100 + tvalue) / 100 : basev;
      }
    }

    statPartsDetail.initValue['base'] = initBasev;

    return {
      value: res,
      statValueParts: {
        base: basev,
        constant: cvalue,
        multiplier: mvalue,
        total: tvalue
      },
      statPartsDetail,
      conditionalBase
    };
  }
}

class RestrictionStat extends SimpleStat {
  constructor(base, type, v, restriction=null) {
    super(base, type, v);
    this.restriction = restriction;
  }
  copy() {
    return new RestrictionStat(this.base, this.type, this.statValue(), this.restriction);
  }
  save() {
    const types = ['constant', 'multiplier', 'total'];
    const r = this.restriction;
    const restriction = r && (r.main || r.sub || r.body || r.other) ? {
      main: r.main ? r.main.description : null,
      sub: r.sub ? r.sub.description : null,
      body: r.body ? r.body.description : null,
      other: r.other ? r.other : null
    } : null;
    return {
      id: this.baseName(),
      value: this.value,
      type: types.find(p => StatBase['TYPE_' + p.toUpperCase()] == this.type),
      restriction
    };
  }
  showData() {
    const res = [];
    const r = this.restriction;
    if (r) {
      
      ['main', 'sub', 'body'].forEach(p => {
        if (!r[p])
          return;
        let [instance, type] = r[p].description.split('|');
        if (!type)
          type = instance;
        res.push((p == 'main' ? '' : p + '/') + type);
      });
    }
    return res;
  }
}

/**
 * create RestrictionStat from SimpleStat
 * @param  {SimpleStat} stat
 * @param  {String?}    restriction
 * @return RestrictionStat
 */
RestrictionStat.from = function(stat, restriction) {
  return new RestrictionStat(stat.base, stat.type, stat.statValue(), restriction);
};

RestrictionStat.fromOrigin = function(stat, originRestriction) {
  const itemStatRestrictionList = [
    'event',

    '1h_sword', '2h_sword', 'bow', 'bowgun', 'staff',
    'magic_device', 'knuckle', 'halberd', 'katana',

    'arrow', 'shield', 'dagger',

    'dodge', 'defense', 'normal'
  ];
  const itemStatRestrictionMappingList = [
    'event',

    MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
    MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
    MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
    MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
    MainWeapon.TYPE_KATANA,

    SubWeapon.TYPE_ARROW, SubArmor.TYPE_SHIELD, SubWeapon.TYPE_DAGGER,

    BodyArmor.TYPE_DODGE, BodyArmor.TYPE_DEFENSE, BodyArmor.TYPE_NORMAL
  ];

  const r = {
    main: null, sub: null, body: null, other: null
  };

  originRestriction.split(/\s*,\s*/).forEach(q => {
    let [eqType, restriction] = q.split('.');
    if (!restriction) {
      restriction = eqType;
      eqType = 'main';
    }
    const restrictionIndex = itemStatRestrictionList.indexOf(restriction);

    if (!['main', 'sub', 'body'].includes(eqType) || restrictionIndex == -1) {
      restriction !== '' && console.warn('[warn] unknow restriction of stat: ' + q);
      return RestrictionStat.from(stat, r);
    }

    restriction = itemStatRestrictionMappingList[restrictionIndex];
    if (typeof restriction == 'string')
      r.other = restriction;
    else
      r[eqType] = restriction;
  });

  return RestrictionStat.from(stat, r);
};

RestrictionStat.load = function(data) {
  const base = Grimoire.CharacterSystem.findStatBase(data.id);
  if (base) {
    const stat = base.createSimpleStat(StatBase['TYPE_' + data.type.toUpperCase()], data.value);

    const restriction = {};
    if (!data.restriction) {
      restriction.main = null;
      restriction.sub = null;
      restriction.body = null;
      restriction.other = null;
    } else {
      ['main', 'sub', 'body'].forEach(key => {
        const t = data.restriction[key];
        let res;
        if (t === null)
          res = null;
        else {
          const handleType = a => 'TYPE_' + a.replace(/-/g, '_').toUpperCase();
          let [instance, type] = t.split('|');
          if (!type) {
            type = instance;
            res = MainWeapon[handleType(type)];
          } else {
            res = {
              'sub-weapon': SubWeapon,
              'sub-armor': SubArmor,
              'body-armor': BodyArmor
            }[instance][handleType(type)]
          }
        }

        restriction[key] = res;
      });
      restriction.other = data.restriction.other;
    }

    return RestrictionStat.from(stat, restriction);
  }

  console.warn('[Error: CharacterEquipment.load] can not find stat which id: ' + data.id);
  return null;
};

export { CharacterStatCategory, CharacterStat, Character, EquipmentField, RestrictionStat };