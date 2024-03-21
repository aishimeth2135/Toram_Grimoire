import Grimoire from '@/shared/Grimoire'
import { Images } from '@/shared/services/Images'
import { normalizeInteger } from '@/shared/utils/number'
import { isNumberString } from '@/shared/utils/string'

import type { BagCrystal, BagEquipment } from '@/lib/Items/BagItem'

import { CharacterBuildLabel } from '../Character/CharacterBuildLabel'
import { StatRecorded } from '../Stat/StatRecorded'
import {
  StatRestriction,
  StatRestrictionSaveData,
} from '../Stat/StatRestriction'
import { StatValueSourceTypes } from '../Stat/enums'
import {
  BodyArmorTypeList,
  EquipmentKinds,
  EquipmentTypes,
  MainWeaponTypeList,
  SubArmorTypeList,
  SubWeaponTypeList,
} from './enums'

type EquipmentOrigin = BagEquipment | null

interface EquipmentSaveData {
  name: string
  instance: number
  stats: StatRestrictionSaveData[]
  id: number
  type: EquipmentTypes
  basicValue: number
  atk?: number
  def?: number
  stability?: number
  refining?: number
  crystals?: string[]
  labels?: number[]
}

abstract class CharacterEquipment {
  private static _autoIncreasement = 0

  abstract type: EquipmentTypes

  private _name: string

  loadedId: string | null
  readonly instanceId: number
  readonly origin: EquipmentOrigin
  stats: StatRestriction[]

  basicValue: number
  crystals: EquipmentCrystal[]
  refining: number
  stability: number

  labels: CharacterBuildLabel[]

  readonly customTypeList?: EquipmentTypes[]

  constructor(
    origin: EquipmentOrigin = null,
    name: string = '',
    stats: StatRestriction[] = []
  ) {
    this.loadedId = null
    this.instanceId = CharacterEquipment._autoIncreasement
    CharacterEquipment._autoIncreasement += 1

    this.origin = origin
    this.stats = stats.map(stat => stat.clone())
    this._name = name

    this.basicValue = 0
    this.crystals = []
    this.refining = 0
    this.stability = 0

    this.labels = []
  }

  // TODO: remove getter to support lagacy
  get id() {
    return this.instanceId
  }

  get name() {
    return this._name ? this._name : this.origin ? this.origin.name : ''
  }
  set name(value: string) {
    this._name = value
  }

  is(kind: EquipmentKinds) {
    if (this instanceof Weapon) {
      return kind === EquipmentKinds.Weapon
    }
    if (this instanceof Armor) {
      return kind === EquipmentKinds.Armor
    }
    if (this instanceof Avatar) {
      return kind === EquipmentKinds.Avatar
    }
    return kind === EquipmentKinds.Other
  }

  get hasRefining() {
    return false
  }
  get hasCrystal() {
    return false
  }
  get hasStability() {
    return false
  }
  get hasElement() {
    return false
  }
  get creatable() {
    return false
  }
  get elementStat() {
    return this.stats.find(stat =>
      CharacterEquipment.elementStatIds.includes(stat.baseId)
    )
  }

  get typeText() {
    return CharacterEquipment.getTypeText(this.type)
  }
  get categoryIcon(): string {
    if (this instanceof BodyArmor) {
      return 'mdi-tshirt-crew'
    }
    if (this instanceof AdditionalGear) {
      return 'cib-redhat'
    }
    if (this instanceof SpecialGear) {
      return 'fa-solid:ring'
    }
    if (this instanceof Avatar) {
      return 'eva-star-outline'
    }
    return this instanceof MainWeapon ? 'mdi-sword' : 'mdi:shield-outline'
  }

  getCategoryImagePath(fieldId = -1): string {
    if (this instanceof Avatar) {
      fieldId = 0
    }
    return CharacterEquipment.getImagePath(this.type, fieldId)
  }

  get refiningText(): string {
    if (this.refining < 10) {
      return this.refining.toString()
    }
    return ['E', 'D', 'C', 'B', 'A', 'S'][this.refining - 10]
  }

  static getImagePath(type: EquipmentTypes, fieldId: number = -1): string {
    return Images.equipmentIcons.get(type + (fieldId <= 0 ? '' : `-${fieldId}`))
  }

  static getTypeText(type: EquipmentTypes) {
    return Grimoire.i18n.t('common.Equipment.category.' + type)
  }

  getAllStats(
    checkRestriction: (stat: StatRestriction) => boolean = () => true
  ): StatRecorded[] {
    const allStats = this.stats.map(stat => {
      const newStat = stat.clone()
      if (!checkRestriction(newStat)) {
        newStat.value = 0
      }
      return StatRecorded.from(newStat, this, StatValueSourceTypes.Equipment)
    })
    if (this.hasCrystal) {
      this.crystals.forEach(crystal => {
        crystal.stats.forEach(crystalStat => {
          const find = allStats.find(stat => stat.equals(crystalStat))
          if (find) {
            find.add(
              checkRestriction(crystalStat) ? crystalStat.value : 0,
              crystal,
              StatValueSourceTypes.Crystal
            )
          } else {
            const newStat = crystalStat.clone()
            if (!checkRestriction(newStat)) {
              newStat.value = 0
            }
            allStats.push(
              StatRecorded.from(newStat, crystal, StatValueSourceTypes.Crystal)
            )
          }
        })
      })
    }
    return allStats
  }

  /**
   * @param [type] - If not give, it will toggle type to next index
   */
  setCustomType(type?: EquipmentTypes) {
    if (type) {
      this.type = type
    } else if (this.customTypeList) {
      const len = this.customTypeList.length
      let idx = this.customTypeList.indexOf(this.type) + 1
      if (idx === len) {
        idx = 0
      }
      this.type = this.customTypeList[idx]
    }
  }

  findStat(baseId: string, type: string) {
    return this.stats.find(stat => stat.baseId === baseId && stat.type === type)
  }

  removeStat(stat: StatRestriction) {
    const idx = this.stats.indexOf(stat)
    if (idx > -1) {
      this.stats.splice(idx, 1)
    }
  }

  appendCrystal(origin: BagCrystal) {
    if (this.hasCrystal) {
      const crystals = this.crystals
      if (crystals.length < 2) {
        crystals.push(new EquipmentCrystal(origin))
      }
    }
  }

  removeCrystal(crystal: EquipmentCrystal) {
    if (this.hasCrystal) {
      const crystals = this.crystals
      const idx = crystals.indexOf(crystal)
      crystals.splice(idx, 1)
    }
  }

  clone(): CharacterEquipment {
    const stats = this.stats
    const name = this.name

    let eq: CharacterEquipment | null = null
    if (this instanceof Weapon) {
      if (this instanceof MainWeapon) {
        eq = new MainWeapon(this.origin, name, stats, this.type)
      } else if (this instanceof SubWeapon) {
        eq = new SubWeapon(this.origin, name, stats, this.type)
      }
    }
    if (this instanceof Armor) {
      if (this instanceof SubArmor) {
        eq = new SubArmor(this.origin, name, stats, this.type)
      } else if (this instanceof BodyArmor) {
        eq = new BodyArmor(this.origin, name, stats)
        eq.type = this.type
      } else if (this instanceof AdditionalGear) {
        eq = new AdditionalGear(this.origin, name, stats)
      } else if (this instanceof SpecialGear) {
        eq = new SpecialGear(this.origin, name, stats)
      }
    }
    if (this instanceof Avatar) {
      eq = new Avatar(this.origin, name, stats)
    }

    if (!eq) {
      eq = new Avatar(this.origin, name, stats)
    }

    eq.basicValue = this.basicValue

    if (this.hasRefining) {
      eq.refining = this.refining
    }
    if (this.hasStability) {
      eq.stability = this.stability
    }
    if (this.hasCrystal) {
      eq.crystals = this.crystals.map(crystal => crystal.clone())
    }

    return eq
  }

  // save and load of json-data
  save(): EquipmentSaveData {
    const data: EquipmentSaveData = {
      instance: -1,
      stats: [],
      id: -1,
      name: '',
      type: EquipmentTypes.Empty,
      basicValue: this.basicValue,
    }

    let instance = -1
    if (this instanceof MainWeapon) {
      instance = 0
    } else if (this instanceof SubWeapon) {
      instance = 1
    } else if (this instanceof SubArmor) {
      instance = 2
    } else if (this instanceof BodyArmor) {
      instance = 3
    } else if (this instanceof AdditionalGear) {
      instance = 4
    } else if (this instanceof SpecialGear) {
      instance = 5
    } else if (this instanceof Avatar) {
      instance = 6
    }

    data.instance = instance
    data.type = this.type

    // [stats]
    data.stats = this.stats.map(stat => stat.save())

    // [other]
    data.name = this.name
    if (this.hasStability) {
      data.stability = this.stability
    }
    if (this.hasRefining) {
      data.refining = this.refining
    }
    if (this.hasCrystal) {
      data.crystals = (this.crystals as EquipmentCrystal[]).map(
        crystal => crystal.name
      )
    }

    // [id]
    data.id = this.id

    // [label]
    if (this.labels.length !== 0) {
      data.labels = this.labels.map(label => label.id)
    }

    return data
  }

  static elementStatIds = [
    'element_fire',
    'element_water',
    'element_earth',
    'element_wind',
    'element_light',
    'element_dark',
  ]

  static loadEquipment(
    loadCategory: string,
    data: EquipmentSaveData,
    buildLabels: CharacterBuildLabel[]
  ): CharacterEquipment | null {
    try {
      const {
        id,
        name,
        instance,
        stability,
        refining = 0,
        basicValue,
        atk,
        def,
        crystals,
        labels,
      } = data
      const stats = data.stats
        .map(stat => StatRestriction.load(stat))
        .filter(stat => stat !== null && !stat.base.hidden) as StatRestriction[]

      stats.forEach(stat => {
        if (typeof stat.value === 'string') {
          stat.value = isNumberString(stat.value) ? parseFloat(stat.value) : 0
        }
      })

      const type: EquipmentTypes = (() => {
        const originalType = (data.type || EquipmentTypes.Avatar) as string
        if (
          instance === 3 &&
          (originalType === 'normal' ||
            originalType === 'dodge' ||
            originalType === 'defense')
        ) {
          return 'body-' + originalType
        }
        return originalType.replace(/_/g, '-')
      })() as EquipmentTypes

      const _basicValue = basicValue ?? atk ?? def ?? 0

      let eq
      if (instance === 0) {
        eq = new MainWeapon(null, name, stats, type, _basicValue, stability)
      } else if (instance === 1) {
        eq = new SubWeapon(null, name, stats, type, _basicValue, stability)
      } else if (instance === 2) {
        eq = new SubArmor(null, name, stats, type, _basicValue)
      } else if (instance === 3) {
        eq = new BodyArmor(null, name, stats, _basicValue)
        eq.setType(type)
      } else if (instance === 4) {
        eq = new AdditionalGear(null, name, stats, _basicValue)
      } else if (instance === 5) {
        eq = new SpecialGear(null, name, stats, _basicValue)
      } else {
        eq = new Avatar(null, name, stats)
      }

      if (eq.hasRefining) {
        eq.refining = refining
      }
      if (eq.hasCrystal && crystals) {
        eq.crystals = crystals
          .map(crystalName => {
            const crystal = Grimoire.Items.crystals.find(
              _crystal => _crystal.name === crystalName
            )
            if (crystal) {
              return new EquipmentCrystal(crystal)
            }
            console.warn(
              '[CharacterEquipment.load] Can not find crystal: ' + crystalName
            )
            return null
          })
          .filter(crystal => crystal) as EquipmentCrystal[]
      }

      eq.loadedId = `${loadCategory}-${id}`

      if (labels) {
        eq.labels = labels
          .map(labelId =>
            buildLabels.find(buildLabel =>
              buildLabel.matchLoadedId(loadCategory, labelId)
            )
          )
          .filter(item => item) as CharacterBuildLabel[]
      }

      return eq
    } catch (err) {
      console.warn('[CharacterEquipment.load] Unexpected error.')
      console.warn(err)
      return null
    }
  }

  static convertOriginalCategory(category: number) {
    /*
      0: 單手劍, 1: 雙手劍, 2: 弓, 3: 弩, 4: 法杖,
      5: 魔導具, 6: 拳套, 7: 旋風槍, 8: 拔刀劍,
      100: 箭矢, 101: 小刀, 102: 忍術卷軸,
      200: 盾牌,
      300: 身體裝備', 400: 追加裝備', 500: 特殊裝備,
    */

    if (category === -1) {
      return EquipmentTypes.Avatar
    }

    if (category === 300) {
      return EquipmentTypes.BodyNormal
    }
    if (category === 400) {
      return EquipmentTypes.Additional
    }
    if (category === 500) {
      return EquipmentTypes.Special
    }
    if (category < 100) {
      return [
        EquipmentTypes.OneHandSword,
        EquipmentTypes.TwoHandSword,
        EquipmentTypes.Bow,
        EquipmentTypes.Bowgun,
        EquipmentTypes.Staff,
        EquipmentTypes.MagicDevice,
        EquipmentTypes.Knuckle,
        EquipmentTypes.Halberd,
        EquipmentTypes.Katana,
      ][category]
    }
    if (category < 200) {
      return [
        EquipmentTypes.Arrow,
        EquipmentTypes.Dagger,
        EquipmentTypes.NinjutsuScroll,
      ][category - 100]
    }
    if (category < 300) {
      return EquipmentTypes.Shield
    }

    return EquipmentTypes.Avatar
  }

  static fromOriginEquipment(item: BagEquipment): CharacterEquipment {
    const origin = item
    const { name, baseValue, baseStability: stability } = item
    const stats = item.stats.map(stat => stat.clone())

    const type = CharacterEquipment.convertOriginalCategory(item.category)

    if (MainWeaponTypeList.includes(type)) {
      return new MainWeapon(origin, name, stats, type, baseValue, stability)
    } else if (SubWeaponTypeList.includes(type)) {
      return new SubWeapon(origin, name, stats, type, baseValue, stability)
    } else if (SubArmorTypeList.includes(type)) {
      return new SubArmor(origin, name, stats, type, baseValue)
    } else if (BodyArmorTypeList.includes(type)) {
      return new BodyArmor(origin, name, stats, baseValue)
    } else if (type === EquipmentTypes.Additional) {
      return new AdditionalGear(origin, name, stats, baseValue)
    } else if (type === EquipmentTypes.Special) {
      return new SpecialGear(origin, name, stats, baseValue)
    }

    return new Avatar(origin, name, stats)
  }

  static createEmpty(name: string, type: EquipmentTypes): CharacterEquipment {
    if (MainWeaponTypeList.includes(type)) {
      return new MainWeapon(null, name, [], type)
    } else if (SubWeaponTypeList.includes(type)) {
      return new SubWeapon(null, name, [], type)
    } else if (SubArmorTypeList.includes(type)) {
      return new SubArmor(null, name, [], type)
    } else if (BodyArmorTypeList.includes(type)) {
      return new BodyArmor(null, name, [])
    } else if (type === EquipmentTypes.Additional) {
      return new AdditionalGear(null, name, [])
    } else if (type === EquipmentTypes.Special) {
      return new SpecialGear(null, name, [])
    }
    return new Avatar(null, name, [])
  }
}

abstract class Weapon extends CharacterEquipment {
  override stability: number

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    atk: number | string = 1,
    stability: number = 0
  ) {
    super(origin, name, stats)

    this.basicValue = normalizeInteger(atk)
    this.stability = stability
  }

  override get hasStability() {
    return true
  }
}

class MainWeapon extends Weapon {
  override refining: number
  override crystals: EquipmentCrystal[]
  type: EquipmentTypes

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    type: EquipmentTypes,
    atk?: number,
    stability?: number
  ) {
    super(origin, name, stats, atk, stability)

    this.type = type
    this.crystals = []
    this.refining = 0
  }

  override get hasRefining() {
    return true
  }
  override get hasCrystal() {
    return true
  }
  override get hasElement() {
    return true
  }
  override get creatable() {
    return true
  }
}

class SubWeapon extends Weapon {
  type: EquipmentTypes

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    type: EquipmentTypes,
    atk?: number,
    stability?: number
  ) {
    super(origin, name, stats, atk, stability)

    this.type = type
  }

  override get hasElement() {
    return this.type === EquipmentTypes.Arrow
  }
}

abstract class Armor extends CharacterEquipment {
  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    def: number | string = 0
  ) {
    super(origin, name, stats)

    this.basicValue = normalizeInteger(def)
  }
}

class SubArmor extends Armor {
  override refining: number
  type: EquipmentTypes

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    type: EquipmentTypes,
    def?: number | string
  ) {
    super(origin, name, stats, def)

    this.type = type
    this.refining = 0
  }

  override get hasRefining() {
    return true
  }
}

class BodyArmor extends Armor {
  override refining: number
  override crystals: EquipmentCrystal[]
  override customTypeList: EquipmentTypes[]

  type: EquipmentTypes

  static _customTypeList: EquipmentTypes[] = BodyArmorTypeList

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    def?: number | string
  ) {
    super(origin, name, stats, def)

    this.type = EquipmentTypes.BodyNormal
    this.refining = 0
    this.crystals = []

    this.customTypeList = BodyArmor._customTypeList
  }
  setType(type: EquipmentTypes) {
    this.type = type
  }

  override get hasRefining() {
    return true
  }

  override get hasCrystal() {
    return true
  }

  override get creatable() {
    return true
  }
}

class AdditionalGear extends Armor {
  override refining: number
  override crystals: EquipmentCrystal[]

  readonly type: EquipmentTypes

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    def?: number | string
  ) {
    super(origin, name, stats, def)

    this.refining = 0
    this.crystals = []
    this.type = EquipmentTypes.Additional
  }

  override get hasRefining() {
    return true
  }

  override get hasCrystal() {
    return true
  }
}

class SpecialGear extends Armor {
  override crystals: EquipmentCrystal[]

  readonly type: EquipmentTypes

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    def?: number | string
  ) {
    super(origin, name, stats, def)

    this.crystals = []
    this.type = EquipmentTypes.Special
  }

  override get hasCrystal() {
    return true
  }
}

class Avatar extends CharacterEquipment {
  readonly type: EquipmentTypes

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[]) {
    super(origin, name, stats)
    this.type = EquipmentTypes.Avatar
  }
}

class EquipmentCrystal {
  origin: BagCrystal
  stats: StatRestriction[]

  constructor(origin: BagCrystal) {
    this.origin = origin
    this.stats = this.origin.stats.map(stat => stat.clone())
  }

  get id() {
    return this.origin.id
  }
  get name() {
    return this.origin.name
  }

  clone() {
    return new EquipmentCrystal(this.origin)
  }

  get crystalIconPath() {
    return this.origin.crystalIconPath
  }
}

export {
  CharacterEquipment,
  EquipmentCrystal,
  MainWeapon,
  SubWeapon,
  SubArmor,
  BodyArmor,
  AdditionalGear,
  SpecialGear,
  Avatar,
}
export type { EquipmentSaveData }
