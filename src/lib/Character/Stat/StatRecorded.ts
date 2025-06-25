import type { CharacterEquipment, EquipmentCrystal } from '@/lib/Character/CharacterEquipment'
import type { Food } from '@/lib/Character/FoodBuild'
import type { BagPotion } from '@/lib/Items/BagItem'
import type { RegistletItemBase } from '@/lib/Registlet/RegistletItem'
import type { SkillBranch } from '@/lib/Skill/Skill'

import { Stat, StatBase, StatElementBase } from './StatBase'
import { StatTypes, StatValueSourceTypes } from './enums'

type StatValueSourceDetails =
  | SkillBranch
  | CharacterEquipment
  | EquipmentCrystal
  | Food
  | RegistletItemBase
  | BagPotion
  | null

class StatValueSource {
  readonly src: StatValueSourceDetails
  readonly type: StatValueSourceTypes | null
  readonly value: number

  constructor(src: StatValueSourceDetails, value: number, type: StatValueSourceTypes | null) {
    this.src = src
    this.type = type
    this.value = value
  }

  // get displayedName(): string {
  //   const src = this.src

  //   switch (this.type) {
  //     case StatValueSourceTypes.Skill:
  //       return (src as SkillBranch).parent.parent.name
  //     case StatValueSourceTypes.Equipment:
  //       return (src as CharacterEquipment).name
  //     case StatValueSourceTypes.Crystal:
  //       return (src as EquipmentCrystal).name
  //     case StatValueSourceTypes.Registlet:
  //       return (src as RegistletItemBase).name
  //     case StatValueSourceTypes.Potion:
  //       return (src as BagPotion).name
  //     default:
  //       return ''
  //   }
  // }
}

class StatRecorded extends StatElementBase {
  private _value: number
  unknownSourceValue: number
  sources: StatValueSource[]

  static from(
    stat: Stat,
    source: StatValueSourceDetails,
    sourceType: StatValueSourceTypes | null
  ): StatRecorded {
    return new StatRecorded(stat.base, stat.type, stat.value, source, sourceType)
  }

  constructor(
    base: StatBase,
    type: StatTypes,
    value: number = 0,
    source: StatValueSourceDetails = null,
    sourceType: StatValueSourceTypes | null = null
  ) {
    super(base, type)
    this._value = 0
    this.sources = []
    this.unknownSourceValue = 0
    this.add(value, source, sourceType)
  }

  override get value(): number {
    return this._value
  }

  add(value: number, source: StatValueSourceDetails, type: StatValueSourceTypes | null): number {
    if (value !== 0) {
      this._value += value
      if (source) {
        this.sources.push(new StatValueSource(source, value, type))
      } else {
        this.unknownSourceValue += value
      }
    }
    return this.value
  }

  addStat(stat: StatRecorded) {
    this._value += stat.value
    this.sources.push(...stat.sources)
    this.unknownSourceValue += stat.unknownSourceValue
  }

  filterSource(filter: (src: StatValueSource) => boolean): StatRecorded {
    const sources = this.sources.filter(filter)
    const newStat = new StatRecorded(this.base, this.type)
    newStat._value = sources.reduce((cur, src) => cur + src.value, 0)
    newStat.sources = sources
    return newStat
  }

  clone(): StatRecorded {
    const newStat = new StatRecorded(this.base, this.type)
    newStat._value = this._value
    newStat.sources = this.sources.slice()
    return newStat
  }
}

export { StatRecorded, StatValueSource }
