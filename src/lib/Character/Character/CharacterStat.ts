import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data'
import { toInt } from '@/shared/utils/number'
import { splitComma } from '@/shared/utils/string'

import { SkillBranch, SkillBranchNames } from '@/lib/Skill/Skill'

import type CharacterSystem from '..'
import {
  StatBase,
  StatRecorded,
  StatTypes,
  StatValueSource,
  StatValueSourceTypes,
} from '../Stat'

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
  readonly isDefaultFormula: boolean
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

interface CharacterStatResultConditionBase {
  conditional: string
  options: string[]
}

interface StatPartsDetailAdditionalValueItem
  extends CharacterStatResultConditionBase {
  value: number
  isMul?: boolean
}

interface CharacterStatFormulaResultConditionalBase
  extends CharacterStatResultConditionBase {
  formula: string
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

interface CharacterStatResultInputVars {
  value: {
    [key: string]: number | Record<string, number>
  }
  conditional: {
    [key: string]: boolean | Record<string, boolean>
  }
  methods: {
    getSkillLevel: (skillId: string) => number
  }
}

interface CharacterStatResultVars extends CharacterStatResultInputVars {
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
    return displayFormula.replace(/\$(?:\.(\d))?v/, (_match, p1) => {
      if (ignoreDecimal) {
        return value.toString()
      }
      return p1 !== undefined
        ? value.toFixed(toInt(p1) ?? 0)
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
        isDefaultFormula: res.isDefaultFormula,
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
        isDefaultFormula: true,
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

    let isDefaultFormula = true

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

      ...vars.methods,

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
        isDefaultFormula = false
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
        res = isDefaultFormula
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
      isDefaultFormula,
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

export { CharacterStatCategory, CharacterStat, CharacterStatFormula }
export type {
  CharacterStatResult,
  CharacterStatResultConditionBase,
  CharacterStatFormulaResultConditionalBase,
  StatPartsDetailAdditionalValueItem,
}
