import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data'
import { splitComma } from '@/shared/utils/string'

import {
  CharacterEquipment,
  SubArmor,
  SubWeapon,
} from '@/lib/Character/CharacterEquipment'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { StatBase, StatRecorded, StatValueSource } from '@/lib/Character/Stat'
import { StatTypes, StatValueSourceTypes } from '@/lib/Character/Stat'
import { SkillBranch } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill'

import {
  CharacterComboBuild,
  CharacterComboBuildSaveData,
} from '../CharacterComboBuild'
import type CharacterSystem from '../index'
import { CharacterBuildBindOnCharacter } from './CharacterBuild'
import { CharacterBaseStatTypes, EquipmentFieldTypes } from './enums'

let _characterAutoIncreasement = 0
class Character implements CharacterBuildBindOnCharacter {
  private _baseStats: CharacterBaseStat[]
  private _optinalBaseStat: CharacterBaseStat | null

  readonly instanceId: number
  loadedId: string | null
  name: string
  level: number
  comboBuild: CharacterComboBuild

  readonly equipmentFields: EquipmentField[]

  static optionalBaseStatTypeList = [
    CharacterBaseStatTypes.TEC,
    CharacterBaseStatTypes.MEN,
    CharacterBaseStatTypes.LUK,
    CharacterBaseStatTypes.CRT,
  ]

  constructor(name = 'Potum') {
    this.loadedId = null
    this.instanceId = _characterAutoIncreasement
    _characterAutoIncreasement += 1

    this.name = name

    this.level = 1
    this._baseStats = [
      new CharacterBaseStat(CharacterBaseStatTypes.STR),
      new CharacterBaseStat(CharacterBaseStatTypes.DEX),
      new CharacterBaseStat(CharacterBaseStatTypes.INT),
      new CharacterBaseStat(CharacterBaseStatTypes.AGI),
      new CharacterBaseStat(CharacterBaseStatTypes.VIT),
    ]

    this._optinalBaseStat = null

    this.equipmentFields = [
      new EquipmentField(this, EquipmentFieldTypes.MainWeapon),
      new EquipmentField(this, EquipmentFieldTypes.SubWeapon),
      new EquipmentField(this, EquipmentFieldTypes.BodyArmor),
      new EquipmentField(this, EquipmentFieldTypes.Additional),
      new EquipmentField(this, EquipmentFieldTypes.Special),
      new EquipmentField(this, EquipmentFieldTypes.Avatar, 0),
      new EquipmentField(this, EquipmentFieldTypes.Avatar, 1),
      new EquipmentField(this, EquipmentFieldTypes.Avatar, 2),
    ]

    this.comboBuild = new CharacterComboBuild()
  }

  get origin(): Character {
    return this
  }

  get baseStats() {
    const res: CharacterBaseStat[] = this._baseStats.slice()
    if (this._optinalBaseStat !== null) {
      res.push(this._optinalBaseStat)
    }
    return res
  }
  get normalBaseStats() {
    return this._baseStats
  }
  get optionalBaseStat() {
    return this._optinalBaseStat
  }

  equipmentField(type: EquipmentFieldTypes, index: number = 0): EquipmentField {
    return this.equipmentFields.find(
      item => item.type === type && item.index === index
    )!
  }
  fieldEquipment(type: EquipmentFieldTypes) {
    return this.equipmentField(type)?.equipment ?? null
  }
  hasOptinalBaseStat() {
    return this._optinalBaseStat ? true : false
  }
  setOptionalBaseStat(name: CharacterBaseStatTypes) {
    this._optinalBaseStat = new CharacterBaseStat(name)
  }
  clearOptinalBaseStat() {
    this._optinalBaseStat = null
  }
  baseStat(name: CharacterBaseStatTypes) {
    if (this._optinalBaseStat !== null && this._optinalBaseStat.name === name) {
      return this._optinalBaseStat
    }
    return this._baseStats.find(bstat => bstat.name === name) ?? null
  }
  baseStatValue(name: CharacterBaseStatTypes) {
    const stat = this.baseStat(name)
    return stat ? stat.value : 0
  }
  checkFieldEquipmentType(
    fieldType: EquipmentFieldTypes,
    eqType: EquipmentTypes | null
  ) {
    return (
      eqType === null || this.equipmentField(fieldType).equipmentType === eqType
    )
  }
  subWeaponValid(subType: EquipmentTypes, mainType?: EquipmentTypes) {
    const validSubs: EquipmentTypes[] = []
    mainType =
      mainType ??
      this.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType
    switch (mainType) {
      case EquipmentTypes.OneHandSword:
        validSubs.push(EquipmentTypes.OneHandSword)
      // fall through
      case EquipmentTypes.Empty:
      case EquipmentTypes.Staff:
        validSubs.push(EquipmentTypes.NinjutsuScroll)
      // fall through
      case EquipmentTypes.Bowgun:
        validSubs.push(EquipmentTypes.Knuckle)
      // fall through
      case EquipmentTypes.Knuckle:
        validSubs.push(EquipmentTypes.MagicDevice, EquipmentTypes.Shield)
      // fall through
      case EquipmentTypes.Halberd:
        validSubs.push(EquipmentTypes.Arrow, EquipmentTypes.Dagger)
        break
      case EquipmentTypes.Katana:
        validSubs.push(EquipmentTypes.Dagger)
      // fall through
      case EquipmentTypes.MagicDevice:
        validSubs.push(EquipmentTypes.NinjutsuScroll)
        break
      case EquipmentTypes.Bow:
        validSubs.push(EquipmentTypes.Arrow, EquipmentTypes.Katana)
    }
    return validSubs.includes(subType)
  }

  clone() {
    const chara = new Character(this.name + '*')
    chara.level = this.level
    this.normalBaseStats.forEach(bstat => {
      const find = chara.normalBaseStats.find(
        _bstat => _bstat.name === bstat.name
      )!
      find.value = bstat.value
    })
    if (this.optionalBaseStat !== null) {
      chara.setOptionalBaseStat(this.optionalBaseStat.name)
      chara.optionalBaseStat!.value = this.optionalBaseStat.value
    }

    this.equipmentFields
      .filter(field => !field.isEmpty)
      .forEach(field => {
        const find = chara.equipmentFields.find(
          targetField =>
            field.type === targetField.type && field.index === targetField.index
        )!
        find.setEquipment(field.equipment)
      })

    return chara
  }

  save(equipments: CharacterEquipment[]): CharacterSaveData {
    const data: CharacterSaveData = {
      id: this.instanceId,
      name: this.name,
      level: this.level,
      normalBaseStats: [],
      fields: [],
    }

    // == [ name ] =====
    data.name = this.name
    data.level = this.level
    data.normalBaseStats = this.normalBaseStats.map(bstat => ({
      name: bstat.name,
      value: bstat.value,
    }))
    if (this.optionalBaseStat) {
      data.optionalBaseStat = {
        name: this.optionalBaseStat.name,
        value: this.optionalBaseStat.value,
      }
    }

    const fieldTypes = {
      [EquipmentFieldTypes.MainWeapon]: 'main_weapon',
      [EquipmentFieldTypes.SubWeapon]: 'sub_weapon',
      [EquipmentFieldTypes.BodyArmor]: 'body_armor',
      [EquipmentFieldTypes.Additional]: 'additional',
      [EquipmentFieldTypes.Special]: 'special',
      [EquipmentFieldTypes.Avatar]: 'avatar',
    } as const
    data.fields = this.equipmentFields
      .map(field => {
        let idx = -1
        if (field.equipment !== null) {
          idx = equipments.indexOf(field.equipment)
          if (idx === -1) {
            console.warn('[Character.save] Can not find equipment in list.')
            return null
          }
        }
        return {
          type: fieldTypes[field.type],
          index: field.index,
          equipmentIndex: idx,
        }
      })
      .filter(field => field !== null) as CharacterSaveDataField[]

    data.combo = this.comboBuild.save()

    return data
  }

  /**
   * @returns true if load successfully
   */
  load(
    loadCategory: string,
    data: CharacterSaveData,
    equipments: (CharacterEquipment | null)[]
  ): boolean {
    try {
      const { id, name, level, normalBaseStats, optionalBaseStat, fields } =
        data
      this.name = name
      this.level = level
      normalBaseStats.forEach(bstat => {
        const find = this.normalBaseStats.find(
          _bstat => _bstat.name === bstat.name
        )
        if (find) {
          find.value = bstat.value
        } else {
          console.warn(
            '[Character.save] Can not find CharacterBaseStat which name: ' +
              bstat.name
          )
        }
      })
      if (optionalBaseStat) {
        this.setOptionalBaseStat(optionalBaseStat.name)
        if (this.optionalBaseStat) {
          this.optionalBaseStat.value = optionalBaseStat.value
        } else {
          console.warn(
            '[Character.save] Can not find Optional-CharacterBaseStat which name: ' +
              optionalBaseStat.name
          )
        }
      }
      const fieldTypes = {
        main_weapon: EquipmentFieldTypes.MainWeapon,
        sub_weapon: EquipmentFieldTypes.SubWeapon,
        body_armor: EquipmentFieldTypes.BodyArmor,
        additional: EquipmentFieldTypes.Additional,
        special: EquipmentFieldTypes.Special,
        avatar: EquipmentFieldTypes.Avatar,
      } as const
      fields.forEach(fieldData => {
        if (fieldData.equipmentIndex !== -1) {
          const find = this.equipmentFields.find(
            field =>
              field.type === fieldTypes[fieldData.type] &&
              field.index === fieldData.index
          )
          if (find) {
            const eq = equipments[fieldData.equipmentIndex]
            if (eq) {
              find.equipment = eq
            }
          } else {
            console.warn(
              `[Character.load] Can not find equipment field of character which type: ${fieldData.type}, index: ${fieldData.index}`
            )
          }
        }
      })
      if (data.combo) {
        this.comboBuild = CharacterComboBuild.load(data.combo)
      }

      if (typeof id === 'number') {
        this.loadedId = `${loadCategory}-${id}`
      }

      return true
    } catch (err) {
      console.warn('[Character.load] An unexpected error occurred.')
      console.error(err)
      return false
    }
  }

  matchLoadedId(loadCategory: string, id: number | null) {
    return this.loadedId !== null && `${loadCategory}-${id}` === this.loadedId
  }
}

interface CharacterSaveData {
  id: number
  name: string
  level: number
  normalBaseStats: {
    name: CharacterBaseStatTypes
    value: number
  }[]
  optionalBaseStat?: {
    name: CharacterBaseStatTypes
    value: number
  }
  fields: CharacterSaveDataField[]
  combo?: CharacterComboBuildSaveData
}
interface CharacterSaveDataField {
  type:
    | 'main_weapon'
    | 'sub_weapon'
    | 'body_armor'
    | 'additional'
    | 'special'
    | 'avatar'
  index: number
  equipmentIndex: number
}

class CharacterBaseStat {
  name: CharacterBaseStatTypes
  value: number

  constructor(name: CharacterBaseStatTypes, value: number = 1) {
    this.name = name
    this.value = value
  }
}

class EquipmentField {
  private _parent: Character
  readonly type: EquipmentFieldTypes
  readonly index: number
  readonly fieldId: string
  equipment: CharacterEquipment | null

  constructor(parent: Character, type: EquipmentFieldTypes, index: number = 0) {
    this._parent = parent
    this.type = type
    this.index = index
    this.fieldId = type + (index === 0 ? '' : `-${index}`)

    this.equipment = null
  }

  get belongCharacter() {
    return this._parent
  }
  get equipmentType(): EquipmentTypes {
    if (this.isEmpty) {
      return EquipmentTypes.Empty
    }
    return this.equipment!.type
  }
  get isEmpty() {
    return this.equipment === null
  }

  setEquipment(equip: CharacterEquipment | null) {
    this.equipment = equip
    if (this.type === EquipmentFieldTypes.MainWeapon) {
      const chara = this.belongCharacter
      const sub = chara.equipmentField(EquipmentFieldTypes.SubWeapon)
      if (!chara.subWeaponValid(sub.equipmentType, this.equipmentType)) {
        sub.removeEquipment()
      }
    }
  }
  removeEquipment() {
    this.setEquipment(null)
  }
  statsDisabled() {
    if (!this.isEmpty && this.type === EquipmentFieldTypes.SubWeapon) {
      const eq = this.equipment
      return !(eq instanceof SubWeapon) && !(eq instanceof SubArmor)
    }
    return false
  }
}

class CharacterStatCategory {
  private _parent: CharacterSystem
  name: string
  stats: CharacterStat[]

  constructor(parent: CharacterSystem, name: string) {
    this._parent = parent
    this.name = name
    this.stats = markRaw([])
  }

  get belongCategorys() {
    return this._parent.characterStatCategoryList
  }

  appendStat(options: CharacterStatOptions): CharacterStat {
    const stat = markRaw(new CharacterStat(this, options))
    this.stats.push(stat)
    return stat
  }
}

interface CharacterStatFormulaResult {
  value: number
  readonly statValueParts: {
    base: number
    constant: number
    multiplier: number
    total: number
  }
  readonly statPartsDetail: StatPartsDetail
  readonly conditionalBase: CharacterStatFormulaResultConditionalBase | null
}
interface CharacterStatResult extends CharacterStatFormulaResult {
  origin: CharacterStat
  resultValue: number
  displayValue: string
  hidden: boolean
}

interface CharacterStatFormulaResultConditionalBase {
  conditional: string
  formula: string
  options: string[]
  result: boolean
  statBasePart: string | null
  isMul: boolean
  isBase: boolean
}

interface StatPartsDetail {
  additionalValues: {
    constant: StatPartsDetailAdditionalValueItem[]
    multiplier: StatPartsDetailAdditionalValueItem[]
    total: StatPartsDetailAdditionalValueItem[]
    base: StatPartsDetailAdditionalValueItem[]
  }
  initValue: {
    constant: number
    multiplier: number
    total: number
    base: number
  }
  statRecordeds: {
    constant: StatRecorded | null
    multiplier: StatRecorded | null
    total: StatRecorded | null
  }
}

interface CharacterStatOptions {
  id: string
  name: string
  displayFormula: string
  link: string
  max: number | null
  min: number | null
  caption: string
  hiddenOption: number
}

interface StatPartsDetailAdditionalValueItem {
  readonly conditional: string
  readonly options: string[]
  readonly value: number
  readonly isMul?: boolean
}

interface CharacterStatResultInputVars {
  value: {
    [key: string]: number | Record<string, number>
  }
  conditional: {
    [key: string]: boolean | Record<string, boolean>
  }
}

interface CharacterStatResultVars extends CharacterStatResultInputVars {
  value: {
    [key: string]: number | Record<string, number>
  }
  conditional: {
    [key: string]: boolean | Record<string, boolean>
  }
  getterResults: {
    [key: string]: number
  }
  getterOriginalResults: {
    [key: string]: CharacterStatResult
  }
}

class CharacterStat {
  private _formula!: CharacterStatFormula

  readonly category: CharacterStatCategory
  readonly id: string
  readonly displayFormula: string
  readonly link: string
  readonly isBoolStat: boolean

  name: string
  max: number | null
  min: number | null
  caption: string
  options: {
    hidden: number
  }

  linkedStatBase: StatBase | null

  constructor(
    category: CharacterStatCategory,
    {
      id,
      name,
      displayFormula,
      link,
      max,
      min,
      caption,
      hiddenOption,
    }: CharacterStatOptions
  ) {
    this.category = category

    this.id = id
    this.name = name
    this.displayFormula = displayFormula
    this.link = link
    this.max = max
    this.min = min
    this.caption = caption
    this.options = {
      hidden: hiddenOption, // -1: default, 0: always hidden, 1: hidden when cvalue, mvalue and tvalue are zero
    }

    this.isBoolStat = false
    this.linkedStatBase = null

    if (this.link) {
      const base = Grimoire.Character.findStatBase(this.link)
      if (!base) {
        console.warn(`[CharacterStat] link: ${this.link} is not found.`)
      } else {
        this.isBoolStat = base.checkBoolStat()
        this.linkedStatBase = base
      }
    }
  }

  setFormula(str: string): CharacterStatFormula {
    this._formula = markRaw(new CharacterStatFormula(this, str))
    return this._formula
  }

  getDisplayValue(value: number, ignoreDecimal: boolean = false): string {
    let displayFormula = this.displayFormula
    if (!displayFormula.match(/\$(?:\.\d)?v/)) {
      displayFormula = '$v' + displayFormula
    }
    return displayFormula.replace(/\$(?:\.(\d))?v/, (match, p1) => {
      if (ignoreDecimal) {
        return value.toString()
      }
      return p1 !== undefined
        ? value.toFixed(parseInt(p1, 10))
        : Math.floor(value).toString()
    })
  }

  result(
    currentStats: StatRecorded[],
    vars: CharacterStatResultVars
  ): CharacterStatResult {
    if (this.id in vars.getterOriginalResults) {
      return vars.getterOriginalResults[this.id]
    }
    const formula = this._formula
    try {
      const res = formula.calc(currentStats, vars)
      let value = res.value
      if (typeof value !== 'number') {
        value = parseFloat(value)
      }
      if (Number.isNaN(value) || !Number.isFinite(value)) {
        console.warn(
          '[CharacterStatFormula.calc] unexpected reslut:',
          value,
          '\nid:',
          this.id,
          '\nresult:',
          res,
          '\nformula:',
          formula
        )
        value = 0
      }
      const originalValue = value

      if (this.max !== null && value > this.max) {
        value = this.max
      }
      if (this.min !== null && value < this.min) {
        value = this.min
      }

      const hiddenOption = this.options.hidden
      const displayValue = this.getDisplayValue(value)

      // resultValue: after min-max and to integer
      const resultValue = parseFloat(displayValue.replace(/[^\-\d.]/g, ''))

      return {
        origin: this,
        value,
        resultValue,
        displayValue,
        statValueParts: res.statValueParts,
        statPartsDetail: res.statPartsDetail,
        conditionalBase: res.conditionalBase,
        hidden:
          hiddenOption === 0 ||
          (hiddenOption === 1 &&
            (['constant', 'multiplier', 'total'] as const).every(
              key => res.statValueParts[key] === 0
            )) ||
          (hiddenOption === 2 && originalValue === 0),
      }
    } catch (error) {
      console.warn(error)
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
          statRecordeds: {
            constant: null,
            multiplier: null,
            total: null,
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
      }
    }
  }

  static prepareCalcResultVars(
    input: CharacterStatResultInputVars
  ): CharacterStatResultVars {
    return {
      ...input,
      getterResults: {},
      getterOriginalResults: {},
    }
  }
}

class CharacterStatFormula {
  private _parent: CharacterStat

  readonly formula: string
  conditionValues: CharacterStatFormulaConditionalItem[]

  constructor(parent: CharacterStat, str: string) {
    this._parent = parent
    this.formula = str
    this.conditionValues = markRaw([])
  }

  get belongCharacterStat() {
    return this._parent
  }

  appendConditionValue(conditional: string, formula: string, options: string) {
    const optionList = splitComma(options)
    const item = markRaw(
      new CharacterStatFormulaConditionalItem(conditional, formula, optionList)
    )
    this.conditionValues.push(item)
  }

  /**
   * @param pureStats - pure stats. All stat ID of stat must be unique
   */
  calc(
    pureStats: StatRecorded[],
    vars: CharacterStatResultVars
  ): CharacterStatFormulaResult {
    const allCharacterStatMap: Record<string, CharacterStat> = {}
    this.belongCharacterStat.category.belongCategorys
      .map(cat => cat.stats)
      .flat()
      .forEach(stat => (allCharacterStatMap[stat.id] = stat))

    const checkBaseId = (stat: StatRecorded) =>
      stat.baseId === this.belongCharacterStat.link
    let cstat =
        pureStats
          .find(stat => checkBaseId(stat) && stat.type === StatTypes.Constant)
          ?.clone() ?? null,
      mstat =
        pureStats
          .find(stat => checkBaseId(stat) && stat.type === StatTypes.Multiplier)
          ?.clone() ?? null,
      tstat =
        pureStats
          .find(stat => checkBaseId(stat) && stat.type === StatTypes.Total)
          ?.clone() ?? null

    // `sub-weapon-atk` will ignore `weapon_atk` provided by active skill
    if (this.belongCharacterStat.id === 'sub_weapon_atk') {
      const filter = (src: StatValueSource) =>
        src.type !== StatValueSourceTypes.Skill ||
        (src.src as SkillBranch).name === SkillBranchNames.Passive
      cstat = cstat?.filterSource(filter) ?? null
      mstat = mstat?.filterSource(filter) ?? null
      tstat = tstat?.filterSource(filter) ?? null
    }

    const getStat = (query: string): StatRecorded | null => {
      let statType = StatTypes.Constant
      if (query.endsWith('%')) {
        query = query.slice(0, -1)
        statType = StatTypes.Multiplier
      }
      return (
        pureStats.find(
          stat => stat.baseId === query && stat.type === statType
        ) ?? null
      )
    }

    const getOriginalResult = (id: string) => {
      if (!vars.getterOriginalResults[id]) {
        const stat = allCharacterStatMap[id]
        if (!stat) {
          return null
        }
        vars.getterOriginalResults[id] = stat.result(pureStats, vars)
      }
      return vars.getterOriginalResults[id]
    }

    const getOriginalResultValue = (id: string) => {
      return getOriginalResult(id)?.value ?? 0
    }

    const excludeActive = (query: string): number => {
      let stat: StatRecorded | null
      if (query === '#cvalue') {
        stat = cstat
      } else if (query === '#mvalue') {
        stat = mstat
      } else if (query === '#tvalue') {
        stat = tstat
      } else {
        stat = getStat(query)
      }
      const filter = (src: StatValueSource) =>
        src.type !== StatValueSourceTypes.Skill ||
        (src.src as SkillBranch).name === SkillBranchNames.Passive
      return stat?.filterSource(filter).value ?? 0
    }

    let cvalue = cstat ? cstat.value : 0,
      mvalue = mstat ? mstat.value : 0,
      tvalue = tstat ? tstat.value : 0

    let defaultFormula = true

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
      statRecordeds: {
        constant: cstat ?? null,
        multiplier: mstat ?? null,
        total: tstat ?? null,
      },
    }

    const statValueVars = {
      cvalue: 0,
      tvalue: 0,
      mvalue: 0,
    }
    const handlerVars = {
      ...vars.value,
      ...vars.getterResults,

      reduceValue: (value: number) => {
        if (
          typeof value !== 'number' ||
          Number.isNaN(value) ||
          !Number.isFinite(value)
        ) {
          console.warn('[CharacterStatFormula.calc] unexpected value: ' + value)
          return 0
        }
        const neg = value < 0
        value = Math.abs(value)
        let rate = 1,
          res = neg ? 100 : 0
        while (value !== 0) {
          const fixedValue = Math.min(value, 50)
          res = neg ? (res * (100 + fixedValue)) / 100 : res + fixedValue / rate
          value -= fixedValue
          rate *= 2
        }

        return neg ? -1 * (res - 100) : res
      },

      stat: (query: string) => getStat(query)?.value ?? 0,
      excludeActive,
      resultValue: getOriginalResultValue,
    }
    const appendGetter = (key: string, handler: () => number) => {
      Object.defineProperty(handlerVars, key, {
        get: handler,
      })
    }

    ;(['cvalue', 'mvalue', 'tvalue'] as const).forEach(key => {
      appendGetter('#' + key, () => {
        defaultFormula = false
        return statValueVars[key]
      })
    })
    Object.keys(allCharacterStatMap).forEach(key => {
      const originalKey = key
      key = '$' + key
      appendGetter(key, () => {
        if (originalKey === this._parent.id) {
          console.warn('[CharacterStatFormula.calc] Infinite loop detected.')
          return 0
        }
        const src = vars.getterResults
        if (src[key] !== undefined) {
          return src[key]
        }
        const originalRes = getOriginalResult(originalKey)
        let res = originalRes?.value ?? 0
        res = typeof res === 'string' ? parseFloat(res) : res
        res = Math.floor(res)
        src[key] = res
        return res
      })
    })
    const formulaHandler = (
      formulaStr: string,
      { ignoreStatValue = false } = {}
    ) => {
      if (ignoreStatValue) {
        statValueVars.cvalue = 0
        statValueVars.mvalue = 0
        statValueVars.tvalue = 0
      } else {
        statValueVars.cvalue = cvalue
        statValueVars.mvalue = mvalue
        statValueVars.tvalue = tvalue
      }
      return (computeFormula(formulaStr, handlerVars) ?? 0) as number
    }

    const conditionalHandlerVars = {
      ...vars.conditional,
    }

    const conditions: CharacterStatFormulaResultConditionalBase[] =
      this.conditionValues
        .map(item => {
          let statBasePart: string | null = null,
            result = true,
            isMul = false,
            isBase = false

          if (item.conditional !== '#') {
            result = computeFormula(
              item.conditional,
              conditionalHandlerVars,
              true
            ) as boolean
          }
          item.options.forEach(option => {
            const match = option.match(/#([cmt]value)/)
            if (match) {
              if (statBasePart === null) {
                statBasePart = match[1]
              }
            } else if (option === '#base') {
              isBase = true
            } else if (option === '#mul') {
              isMul = true
            }
          })
          return {
            conditional: item.conditional,
            formula: item.formula,
            options: item.options,
            result,
            statBasePart,
            isMul,
            isBase,
          }
        })
        .filter(item => item.result)

    // #base不能和#[cmt]value共存，同時存在時，#base優先級高於#[cmt]value
    conditions
      .filter(item => item.statBasePart !== null && !item.isBase)
      .forEach(item => {
        const part = item.statBasePart
        const value = formulaHandler(item.formula)
        const data: StatPartsDetailAdditionalValueItem = {
          conditional: item.conditional,
          options: item.options,
          value: value,
        }
        switch (part) {
          case 'cvalue':
            cvalue += value
            statPartsDetail.additionalValues.constant.push(data)
            break
          case 'mvalue':
            mvalue += value
            statPartsDetail.additionalValues.multiplier.push(data)
            break
          case 'tvalue':
            tvalue += value
            statPartsDetail.additionalValues.total.push(data)
            break
        }
      })

    const conditionalBase = conditions.find(item => item.isBase) || null

    const extraValues = conditions
      .filter(item => !item.isBase)
      .filter(item => item.statBasePart === null)
      .map(item => {
        const value = formulaHandler(item.formula)
        statPartsDetail.additionalValues.base.push({
          conditional: item.conditional,
          options: item.options,
          isMul: item.isMul,
          value: value,
        })
        return {
          isMul: item.isMul,
          value: value,
        }
      })

    const addValues: number[] = []
    const mulValues: number[] = []
    extraValues.forEach(item =>
      (item.isMul ? mulValues : addValues).push(item.value)
    )

    let res = 0,
      basev = 0,
      initBasev = 0

    const formula = conditionalBase ? conditionalBase.formula : this.formula

    // formula是"0"的話，計算結果無條件為0。
    if (formula !== '0') {
      const sum = (ary: number[]) => ary.reduce((cur, value) => cur + value, 0)
      const mul = (ary: number[]) => ary.reduce((cur, value) => cur * value, 1)

      if (formula && formula.includes('#base')) {
        basev = sum(addValues) * mul(mulValues)
        res = formulaHandler(this.formula.replace('#base', basev.toString()))
      } else {
        initBasev = formula ? formulaHandler(formula) : 0
        basev = sum([initBasev, ...addValues]) * mul(mulValues)
        res = defaultFormula
          ? (((basev * (100 + mvalue)) / 100 + cvalue) * (100 + tvalue)) / 100
          : basev
      }
    }

    statPartsDetail.initValue['base'] = initBasev
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
    }
  }
}

class CharacterStatFormulaConditionalItem {
  readonly conditional: string
  readonly formula: string
  readonly options: string[]

  constructor(conditional: string, formula: string, options: string[]) {
    this.conditional = conditional
    this.formula = formula
    this.options = options
  }
}

export {
  CharacterStatCategory,
  CharacterStat,
  CharacterStatFormula,
  Character,
  EquipmentField,
}
export type {
  CharacterSaveData,
  CharacterStatResult,
  CharacterStatFormulaResultConditionalBase,
  StatPartsDetailAdditionalValueItem,
  CharacterBuildBindOnCharacter,
}
