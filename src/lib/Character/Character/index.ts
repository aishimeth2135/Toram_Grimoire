import { markRaw } from 'vue';
import Grimoire from '@/shared/Grimoire';
import { handleFormula, handleConditional } from '@/shared/utils/data';

import CharacterSystem from '../index';
import { StatBase, Stat } from '@/lib/Character/Stat';
import { StatTypes } from  '@/lib/Character/Stat/enums';
import { SubWeapon, SubArmor, CharacterEquipment } from '@/lib/Character/CharacterEquipment';
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';
import { EquipmentFieldTypes, CharacterBaseStatTypes, CharacterOptionalBaseStatTypes } from './enums';

type CharacterBaseStatValidType = CharacterBaseStatTypes | CharacterOptionalBaseStatTypes;
class Character {
  private _baseStats: readonly [
    CharacterBaseStat<CharacterBaseStatTypes.STR>,
    CharacterBaseStat<CharacterBaseStatTypes.DEX>,
    CharacterBaseStat<CharacterBaseStatTypes.INT>,
    CharacterBaseStat<CharacterBaseStatTypes.AGI>,
    CharacterBaseStat<CharacterBaseStatTypes.VIT>,
  ];
  private _optinalBaseStat: CharacterBaseStat<CharacterOptionalBaseStatTypes> | null;

  name: string;
  level: number;
  readonly equipmentFields: readonly [
    EquipmentField,
    EquipmentField,
    EquipmentField,
    EquipmentField,
    EquipmentField,
    EquipmentField,
    EquipmentField,
    EquipmentField,
  ];

  constructor(name = 'Potum') {
    this.name = name;

    this.level = 1;
    this._baseStats = [
      new CharacterBaseStat(CharacterBaseStatTypes.STR),
      new CharacterBaseStat(CharacterBaseStatTypes.DEX),
      new CharacterBaseStat(CharacterBaseStatTypes.INT),
      new CharacterBaseStat(CharacterBaseStatTypes.AGI),
      new CharacterBaseStat(CharacterBaseStatTypes.VIT),
    ] as const;

    this._optinalBaseStat = null;

    this.equipmentFields = [
      new EquipmentField(this, EquipmentFieldTypes.MainWeapon),
      new EquipmentField(this, EquipmentFieldTypes.SubWeapon),
      new EquipmentField(this, EquipmentFieldTypes.BodyArmor),
      new EquipmentField(this, EquipmentFieldTypes.Additional),
      new EquipmentField(this, EquipmentFieldTypes.Special),
      new EquipmentField(this, EquipmentFieldTypes.Avatar, 0),
      new EquipmentField(this, EquipmentFieldTypes.Avatar, 1),
      new EquipmentField(this, EquipmentFieldTypes.Avatar, 2),
    ] as const;
  }

  get baseStats() {
    const res: CharacterBaseStat<CharacterBaseStatTypes | CharacterOptionalBaseStatTypes>[] = this._baseStats.slice();
    if (this._optinalBaseStat !== null) {
      res.push(this._optinalBaseStat);
    }
    return res;
  }
  get normalBaseStats() {
    return this._baseStats;
  }
  get optionalBaseStat() {
    return this._optinalBaseStat;
  }

  equipmentField(type: EquipmentFieldTypes): EquipmentField {
    return this.equipmentFields.find(item => item.type === type) as EquipmentField;
  }
  fieldEquipment(type: EquipmentFieldTypes) {
    const field = this.equipmentField(type);
    return field ? field.equipment : undefined;
  }
  hasOptinalBaseStat() {
    return this._optinalBaseStat ? true : false;
  }
  setOptinalBaseStat(name: CharacterOptionalBaseStatTypes) {
    this._optinalBaseStat = new CharacterBaseStat(name);
  }
  clearOptinalBaseStat() {
    this._optinalBaseStat = null;
  }
  baseStat(name: CharacterBaseStatValidType) {
    if ((Object.values(CharacterOptionalBaseStatTypes) as readonly string[]).includes(name)) {
      return this._optinalBaseStat === null || this._optinalBaseStat.name !== name ?
        null : this._optinalBaseStat;
    }
    return this._baseStats.find(p => p.name === name);
  }
  baseStatValue(name: CharacterBaseStatValidType) {
    const stat = this.baseStat(name);
    return stat ? stat.value : 0;
  }
  checkFieldEquipmentType(fieldType: EquipmentFieldTypes, eqType: EquipmentTypes) {
    return this.equipmentField(fieldType).equipmentType === eqType;
  }
  subWeaponValid(subType: EquipmentTypes, mainType: EquipmentTypes) {
    const validSubs: EquipmentTypes[] = [];
    mainType = mainType || this.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType;
    switch (mainType) {
      case EquipmentTypes.OneHandSword:
        validSubs.push(EquipmentTypes.OneHandSword);
        // fall through
      case EquipmentTypes.Empty:
      case EquipmentTypes.Staff:
        validSubs.push(EquipmentTypes.NinjutsuScroll);
        // fall through
      case EquipmentTypes.Bowgun:
        validSubs.push(EquipmentTypes.Knuckle);
        // fall through
      case EquipmentTypes.Knuckle:
        validSubs.push(EquipmentTypes.MagicDevice, EquipmentTypes.Shield);
        // fall through
      case EquipmentTypes.Halberd:
        validSubs.push(EquipmentTypes.Arrow, EquipmentTypes.Dagger);
        break;
      case EquipmentTypes.Katana:
        validSubs.push(EquipmentTypes.Dagger, EquipmentTypes.NinjutsuScroll);
        break;
      case EquipmentTypes.Bow:
        validSubs.push(EquipmentTypes.Arrow, EquipmentTypes.Katana);
    }
    return validSubs.includes(subType);
  }

  copy() {
    const chara = new Character(this.name + '*');
    chara.level = this.level;
    this.normalBaseStats.forEach(p => {
      const find = chara.normalBaseStats.find(a => a.name === p.name) as CharacterBaseStat<CharacterBaseStatTypes>;
      find.value = p.value;
    });
    if (this.optionalBaseStat !== null) {
      chara.setOptinalBaseStat(this.optionalBaseStat.name);
      (chara.optionalBaseStat as CharacterBaseStat<CharacterOptionalBaseStatTypes>).value = this.optionalBaseStat.value;
    }

    this.equipmentFields.filter(field => !field.isEmpty).forEach(field => {
      const find = chara.equipmentFields.find(targetField => field.type === targetField.type && field.index === targetField.index) as EquipmentField;
      find.setEquipment(field.equipment);
    });

    return chara;
  }

  // save and load with json-data
  save(equipments: CharacterEquipment[]): CharacterSaveData {
    const data: CharacterSaveData = {
      name: this.name,
      level: this.level,
      normalBaseStats: [],
      fields: [],
    };

    // == [ name ] =====
    data.name = this.name;
    data.level = this.level;
    data.normalBaseStats = this.normalBaseStats.map(p => ({
      name: p.name,
      value: p.value,
    }));
    if (this.optionalBaseStat) {
      data.optionalBaseStat = {
        name: this.optionalBaseStat.name,
        value: this.optionalBaseStat.value,
      };
    }

    const fieldTypes = {
      [EquipmentFieldTypes.MainWeapon]: 'main_weapon',
      [EquipmentFieldTypes.SubWeapon]: 'sub_weapon',
      [EquipmentFieldTypes.BodyArmor]: 'body_armor',
      [EquipmentFieldTypes.Additional]: 'additional',
      [EquipmentFieldTypes.Special]: 'special',
      [EquipmentFieldTypes.Avatar]: 'avatar',
    } as const;
    data.fields = this.equipmentFields.map(field => {
      let idx = -1;
      if (field.equipment !== null) {
        idx = equipments.indexOf(field.equipment);
        if (idx === -1) {
          console.warn('Can not find equipment of Field in List of equipments');
          return null;
        }
      }
      return {
        type: fieldTypes[field.type],
        index: field.index,
        equipmentIndex: idx,
      };
    }).filter(field => field !== null) as CharacterSaveDataField[];

    return data;
  }
  load(data: CharacterSaveData, equipments: CharacterEquipment[]) {
    try {
      let success = true;

      const { name, level, normalBaseStats, optionalBaseStat, fields } = data;
      this.name = name;
      this.level = level;
      normalBaseStats.forEach(p => {
        const find = this.normalBaseStats.find(a => a.name === p.name);
        if (find)
          find.value = p.value;
        else {
          console.warn('[Character.save] Can not find CharacterBaseStat which name: ' + p.name);
          success = false;
        }
      });
      if (optionalBaseStat) {
        this.setOptinalBaseStat(optionalBaseStat.name);
        if (this.optionalBaseStat)
          this.optionalBaseStat.value = optionalBaseStat.value;
        else {
          console.warn('[Character.save] Can not find Optional-CharacterBaseStat which name: ' + optionalBaseStat.name);
          success = false;
        }
      }
      const fieldTypes = {
        'main_weapon': EquipmentFieldTypes.MainWeapon,
        'sub_weapon': EquipmentFieldTypes.SubWeapon,
        'body_armor': EquipmentFieldTypes.BodyArmor,
        'additional': EquipmentFieldTypes.Additional,
        'special': EquipmentFieldTypes.Special,
        'avatar': EquipmentFieldTypes.Avatar,
      } as const;
      fields.forEach(fieldData => {
        if (fieldData.equipmentIndex !== -1) {
          const find = this.equipmentFields.find(field => field.type === fieldTypes[fieldData.type] && field.index === fieldData.index);
          if (find) {
            const eq = equipments[fieldData.equipmentIndex];
            if (eq)
              find.equipment = eq;
            else
              console.warn(`Index: ${fieldData.index} of equipments is null.`);
          }
          else {
            console.warn(`Can not find Equipment Field of Character which type: ${fieldData.type} , index: ${fieldData.index}`);
            success = false;
          }
        }
      });

      return {
        success,
      };
    } catch (e) {
      console.warn(e);
      return {
        error: true,
      };
    }
  }
}

interface CharacterSaveData {
  name: string;
  level: number;
  normalBaseStats: {
    name: CharacterBaseStatTypes;
    value: number;
  }[];
  optionalBaseStat?: {
    name: CharacterOptionalBaseStatTypes;
    value: number;
  };
  fields: CharacterSaveDataField[];
}
interface CharacterSaveDataField {
  type: 'main_weapon' | 'sub_weapon' | 'body_armor' | 'additional' | 'special' | 'avatar';
  index: number;
  equipmentIndex: number;
}

class CharacterBaseStat<T> {
  name: T;
  value: number;

  constructor(name: T, value: number = 1) {
    this.name = name;
    this.value = value;
  }
}

class EquipmentField {
  private _parent: Character;
  type: EquipmentFieldTypes;
  index: number;
  equipment: CharacterEquipment | null;

  constructor(parent: Character, type: EquipmentFieldTypes, index: number = 0) {
    this._parent = parent;
    this.type = type;
    this.index = index;

    this.equipment = null;
  }

  get belongCharacter() {
    return this._parent;
  }
  get equipmentType(): EquipmentTypes {
    if (this.isEmpty)
      return EquipmentTypes.Empty;
    return (this.equipment as CharacterEquipment).type;
  }
  get isEmpty() {
    return this.equipment === null;
  }

  setEquipment(equip: CharacterEquipment | null) {
    this.equipment = equip;
    if (this.type === EquipmentFieldTypes.MainWeapon) {
      const c = this.belongCharacter;
      const sub = c.equipmentField(EquipmentFieldTypes.SubWeapon);
      if (!c.subWeaponValid(sub.equipmentType, this.equipmentType))
        sub.removeEquipment();
    }
  }
  removeEquipment() {
    this.setEquipment(null);
  }
  statsDisabled() {
    if (!this.isEmpty && this.type === EquipmentFieldTypes.SubWeapon) {
      const eq = this.equipment;
      return !(eq instanceof SubWeapon) && !(eq instanceof SubArmor);
    }
    return false;
  }
}

class CharacterStatCategory {
  private _parent: CharacterSystem;
  name: string;
  stats: CharacterStat[];

  constructor(parent: CharacterSystem, name: string) {
    this._parent = parent;
    this.name = name;
    this.stats = markRaw([]);
  }

  get belongCategorys() {
    return this._parent.characterStatCategoryList;
  }

  appendStat(options: CharacterStatOptions) {
    const stat = markRaw(new CharacterStat(this, options));
    this.stats.push(stat);
    return stat;
  }
}


interface CharacterStatResult extends CharacterStatFormulaResult {
  origin: CharacterStat;
  resultValue: number;
  displayValue: string;
  hidden: boolean;
}

interface CharacterStatFormulaResult {
  value: number;
  readonly statValueParts: {
    base: number;
    constant: number;
    multiplier: number;
    total: number;
  };
  readonly statPartsDetail: StatPartsDetail;
  readonly conditionalBase: CharacterStatFormulaResultConditionalBase | null;
}

interface CharacterStatFormulaResultConditionalBase {
  conditional: string;
  formula: string;
  options: string[];
  result: boolean;
  statBasePart: string | null;
  isMul: boolean;
  isBase: boolean;
}

interface StatPartsDetail {
  additionalValues: {
    constant: StatPartsDetailAdditionalValueItem[];
    multiplier: StatPartsDetailAdditionalValueItem[];
    total: StatPartsDetailAdditionalValueItem[];
    base: StatPartsDetailAdditionalValueItem[];
  };
  initValue: {
    constant: number;
    multiplier: number;
    total: number;
    base: number;
  };
}

interface CharacterStatOptions {
  id: string;
  name: string;
  displayFormula: string;
  link: string;
  max: number;
  min: number;
  caption: string;
  hiddenOption: number;
}

interface StatPartsDetailAdditionalValueItem {
  readonly conditional: string;
  readonly options: string[];
  readonly value: number;
  readonly isMul?: boolean;
}


interface CharacterStatResultVars {
  value: {
    [key: string]: number;
  };
  conditional: {
    [key: string]: boolean;
  };
  computed: {
    [key: string]: number;
  };
  computedResultStore: {
    [key: string]: CharacterStatResult;
  };
}
class CharacterStat {
  private _formula: CharacterStatFormula | null;

  category: CharacterStatCategory;
  id: string;
  name: string;
  displayFormula: string;
  link: string;
  max: number;
  min: number;
  caption: string;
  options: {
    hidden: number;
  };

  isBoolStat: boolean;
  linkedStatBase: StatBase | null;

  constructor(
    category: CharacterStatCategory, {
      id,
      name,
      displayFormula,
      link,
      max,
      min,
      caption,
      hiddenOption,
    }: CharacterStatOptions) {
    this.category = category;

    this.id = id;
    this.name = name;
    this.displayFormula = displayFormula;
    this.link = link; // const
    this.max = max;
    this.min = min;
    this.caption = caption;
    this.options = {
      hidden: hiddenOption, // -1: default, 0: always hidden, 1: hidden when cvalue, mvalue and tvalue are zero
    };

    this._formula = null;
    this.isBoolStat = false;
    this.linkedStatBase = null;

    if (this.link) {
      const base = Grimoire.Character.findStatBase(this.link);
      if (!base)
        console.warn(`Link of CharacterStat: ${this.link} is not found.`);
      else {
        this.isBoolStat = base.checkBoolStat();
        this.linkedStatBase = base;
      }
    }
  }

  setFormula(str: string): CharacterStatFormula {
    this._formula = markRaw(new CharacterStatFormula(this, str));
    return this._formula;
  }

  getDisplayValue(value: number, ignoreDecimal: boolean = false): string {
    let displayFormula = this.displayFormula;
    if (!displayFormula.match(/\$(?:\.\d)?v/)) {
      displayFormula = '$v' + displayFormula;
    }
    return displayFormula.replace(/\$(?:\.(\d))?v/, (match, p1) => {
      if (ignoreDecimal)
        return value.toString();
      return p1 !== undefined ?
        value.toFixed(parseInt(p1, 10)) :
        Math.floor(value).toString();
    });
  }

  result(currentStats: Stat[], vars: CharacterStatResultVars): CharacterStatResult {
    if (this.id in vars.computedResultStore) {
      return vars.computedResultStore[this.id];
    }
    const formula = this._formula as CharacterStatFormula;
    try {
      const res = formula.calc(currentStats, vars);
      let value = res.value;
      const originalValue = value;

      if (typeof value !== 'number')
        value = parseFloat(value);
      if (this.max !== null && value > this.max)
        value = this.max;
      if (this.min !== null && value < this.min)
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
        hidden: ho === 0 ||
          (ho === 1 && (['constant', 'multiplier', 'total'] as const).every(a => res.statValueParts[a] === 0)) ||
          (ho === 2 && originalValue == 0),
      };
    } catch (error) {
      console.warn(error);
      return {
        origin: this,
        value: 0,
        resultValue: 0,
        displayValue: '0',
        statValueParts: {
          base: 0,
          constant: 0,
          multiplier: 0,
          total: 0,
        },
        statPartsDetail: {
          additionalValues: {
            constant: [],
            multiplier: [],
            total: [],
            base: [],
          },
          initValue: {
            constant: 0,
            multiplier: 0,
            total: 0,
            base: 0,
          },
        },
        conditionalBase: {
          conditional: '',
          formula: '',
          options: [],
          result: false,
          statBasePart: '',
          isMul: false,
          isBase: false,
        },
        hidden: true,
      };
    }
  }
}


class CharacterStatFormula {
  private _parent: CharacterStat;

  readonly formula: string;
  conditionValues: CharacterStatFormulaConditionalItem[];

  constructor(parent: CharacterStat, str: string) {
    this._parent = parent;
    this.formula = str;
    this.conditionValues = markRaw([]);
  }
  get belongCharacterStat() {
    return this._parent;
  }
  appendConditionValue(conditional: string, formula: string, options: string) {
    const optionList = options.split(/\s*,\s*/);
    const item = markRaw(new CharacterStatFormulaConditionalItem(conditional, formula, optionList));
    this.conditionValues.push(item);
  }
  calc(pureStats: Stat[], vars: CharacterStatResultVars): CharacterStatFormulaResult {
    const allCharacterStatMap: { [key: string]: CharacterStat } = {};
    this.belongCharacterStat.category.belongCategorys
      .map(p => p.stats).flat()
      .forEach(p => allCharacterStatMap[p.id] = p);

    const checkBaseName = (stat: Stat) => stat.baseName === this.belongCharacterStat.link;
    const cstat = pureStats.find(stat => checkBaseName(stat) && stat.type === StatTypes.Constant),
      mstat = pureStats.find(stat => checkBaseName(stat) && stat.type === StatTypes.Multiplier),
      tstat = pureStats.find(stat => checkBaseName(stat) && stat.type === StatTypes.Total);
    let cvalue = cstat ? cstat.value as number : 0,
      mvalue = mstat ? mstat.value as number : 0,
      tvalue = tstat ? tstat.value as number : 0;

    let defaultFormula = true;

    const statPartsDetail: StatPartsDetail = {
      additionalValues: {
        constant: [],
        multiplier: [],
        total: [],
        base: [],
      },
      initValue: {
        constant: cvalue,
        multiplier: mvalue,
        total: tvalue,
        base: 0,
      },
    };

    const methods = {
      reduceValue: (value: number) => {
        const neg = value < 0;
        value = Math.abs(value);
        let rate = 1, res = neg ? 100 : 0;
        while (value !== 0) {
          const fixedValue = Math.min(value, 50);
          res = neg ? res * (100 + fixedValue) / 100 : res + fixedValue / rate;
          value -= fixedValue;
          rate *= 2;
        }

        return neg ? -1 * (res - 100) : res;
      },
    };

    const statValueVars = {
      cvalue: 0,
      tvalue: 0,
      mvalue: 0,
    };
    const handlerOptions = {
      vars: {
        ...vars.value,
        ...vars.computed,
      },
      getters: {} as { [key: string]: () => number },
      methods,
      toNumber: true,
    };
    (['cvalue', 'mvalue', 'tvalue'] as const).forEach(key => {
      handlerOptions.getters['#' + key] = () => {
        defaultFormula = false;
        return statValueVars[key];
      };
    });
    Object.entries(allCharacterStatMap).forEach(([key, value]) => {
      const originalKey = key;
      key = '$' + key;
      handlerOptions.getters[key] = () => {
        const src = vars.computed;
        if (src[key] !== undefined) {
          return src[key];
        }
        const originalRes = value.result(pureStats, vars);
        vars.computedResultStore[originalKey] = originalRes;
        let res = originalRes.value;
        res = typeof res === 'string' ? parseFloat(res) : res;
        res = Math.floor(res);
        src[key] = res;
        return res;
      };
    });
    const formulaHandler = (formulaStr: string, { ignoreStatValue = false } = {}) => {
      if (ignoreStatValue) {
        statValueVars.cvalue = 0;
        statValueVars.mvalue = 0;
        statValueVars.tvalue = 0;
      } else {
        statValueVars.cvalue = cvalue;
        statValueVars.mvalue = mvalue;
        statValueVars.tvalue = tvalue;
      }
      return handleFormula(formulaStr, handlerOptions) as number;
    };


    const conditionalHandlerOptions = {
      vars: {
        ...vars.conditional,
      },
      defaultValue: true,
    };

    const conditions: CharacterStatFormulaResultConditionalBase[] = this.conditionValues
      .map(p => {
        let statBasePart: string | null = null,
          result = true,
          isMul = false,
          isBase = false;

        if (p.conditional !== '#') {
          result = handleConditional(p.conditional, conditionalHandlerOptions);
        }
        p.options.forEach(option => {
          const match = option.match(/#([cmt]value)/);
          if (match) {
            if (statBasePart === null)
              statBasePart = match[1];
          } else if (option === '#base') {
            isBase = true;
          } else if (option === '#mul') {
            isMul = true;
          }
        });
        return {
          conditional: p.conditional,
          formula: p.formula,
          options: p.options,
          result,
          statBasePart,
          isMul,
          isBase,
        };
      })
      .filter(p => p.result);

    // #base不能和#[cmt]value共存，同時存在時，#base優先級高於#[cmt]value
    conditions
      .filter(p => p.statBasePart !== null && !p.isBase)
      .forEach(p => {
        const part = p.statBasePart;
        const value = formulaHandler(p.formula);
        const data: StatPartsDetailAdditionalValueItem = {
          conditional: p.conditional,
          options: p.options,
          value: value,
        };
        switch (part) {
          case 'cvalue':
            cvalue += value;
            statPartsDetail.additionalValues.constant.push(data);
            break;
          case 'mvalue':
            mvalue += value;
            statPartsDetail.additionalValues.multiplier.push(data);
            break;
          case 'tvalue':
            tvalue += value;
            statPartsDetail.additionalValues.total.push(data);
            break;
        }
      });

    const conditionalBase = conditions.find(p => p.isBase) || null;

    const extraValues = conditions
      .filter(p => !p.isBase)
      .filter(p => p.statBasePart === null)
      .map(p => {
        const value = formulaHandler(p.formula);
        statPartsDetail.additionalValues.base.push({
          conditional: p.conditional,
          options: p.options,
          isMul: p.isMul,
          value: value,
        });
        return {
          isMul: p.isMul,
          value: value,
        };
      });

    const addValues = extraValues
      .filter(p => !p.isMul).map(p => p.value);
    const mulValues = extraValues
      .filter(p => p.isMul).map(p => p.value);

    let res = 0, basev = 0, initBasev = 0;

    const formula = conditionalBase ? conditionalBase.formula : this.formula;

    // formula是"0"的話，計算結果無條件為0。
    if (formula !== '0') {
      const sum = (ary: number[]) => ary.reduce((cur, v) => cur + v, 0);
      const mul = (ary: number[]) => ary.reduce((cur, v) => cur * v, 1);

      if (formula && formula.includes('#base')) {
        basev = sum(addValues) * mul(mulValues);
        res = formulaHandler(this.formula.replace('#base', basev.toString()));
      } else {
        initBasev = formula ? formulaHandler(formula) : 0;
        basev = sum([initBasev, ...addValues]) * mul(mulValues);
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
        total: tvalue,
      },
      statPartsDetail,
      conditionalBase,
    };
  }
}

class CharacterStatFormulaConditionalItem {
  readonly conditional: string;
  readonly formula: string;
  readonly options: string[];

  constructor(conditional: string, formula: string, options: string[]) {
    this.conditional = conditional;
    this.formula = formula;
    this.options = options;
  }
}

export { CharacterStatCategory, CharacterStat, Character, EquipmentField };
