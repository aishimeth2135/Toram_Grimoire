import { handleFormula } from '@/shared/utils/data'

import { type StatComputed, StatTypes } from '@/lib/Character/Stat'

import type { EquipmentTraitCategory } from './enums'

type StackInfoKeys = 'max'

type TextFormulaReplaceTextsBase = Record<string, Record<string, string> | string>
type TextFormulaReplaceTexts = {
  $stat: TextFormulaReplaceTextsBase
  $stack: TextFormulaReplaceTextsBase
}

class EquipmentTraitItem {
  id: string
  category: EquipmentTraitCategory
  name: string
  maxLevel: number
  caption: {
    description: string
    tips: string[]
  }
  stats: StatComputed[]
  private _stackInfo: Map<string, string> | null

  static generateId(id: string, category: EquipmentTraitCategory) {
    return category + id
  }

  constructor(id: string, category: EquipmentTraitCategory, name: string) {
    this.id = id
    this.category = category
    this.name = name
    this.maxLevel = 1
    this.caption = {
      description: '',
      tips: [],
    }
    this.stats = []
    this._stackInfo = null
  }

  appendStat(stat: StatComputed): void {
    this.stats.push(stat)
  }

  setStackInfo(key: StackInfoKeys, value: string): void {
    if (!this._stackInfo) {
      this._stackInfo = new Map()
    }
    this._stackInfo.set(key, value)
  }

  getStackInfo(key: StackInfoKeys): string {
    if (!this._stackInfo) {
      return ''
    }
    return this._stackInfo.get(key) ?? ''
  }

  getTextFormulaReplaceTexts(): TextFormulaReplaceTexts {
    const cMap: Record<string, string> = {}
    const mMap: Record<string, string> = {}
    const tMap: Record<string, string> = {}
    this.stats.forEach(stat => {
      if (stat.type === StatTypes.Multiplier) {
        mMap[stat.baseId] = stat.value
      } else if (stat.type === StatTypes.Total) {
        tMap[stat.baseId] = stat.value
      } else {
        cMap[stat.baseId] = stat.value
      }
    })
    return {
      $stat: {
        ...cMap,
        m: mMap,
        t: tMap,
      },
      $stack: {
        max: this.getStackInfo('max'),
      },
    }
  }

  handleTextFormulaReplace(formulaStr: string, replaceTexts: TextFormulaReplaceTexts): string {
    return handleFormula(formulaStr, {
      texts: replaceTexts,
    }) as string
  }
}

export { EquipmentTraitItem }
