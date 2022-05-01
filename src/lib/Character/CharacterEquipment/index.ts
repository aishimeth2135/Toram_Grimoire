
import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'
import { Images } from '@/shared/services/Images'

import { Equipment, Crystal } from '@/lib/Items/Item'

import { StatRestriction } from '../Stat'
import type { StatRestrictionSaveData } from '../Stat/StatRestriction'
import { EquipmentTypes } from './enums'

type EquipmentOrigin = Equipment | null

let characterEquipmentAutoIncreasement = 0
abstract class CharacterEquipment {
  private _name: string
  private _isCustom: boolean

  instanceId: number
  origin: EquipmentOrigin
  stats: StatRestriction[]

  crystals?: EquipmentCrystal[]
  refining?: number
  stability?: number
  atk?: number
  def?: number
  customTypeList?: EquipmentTypes[]

  abstract type: EquipmentTypes

  constructor(origin: EquipmentOrigin = null, name: string = '', stats: StatRestriction[] = []) {
    this.instanceId = characterEquipmentAutoIncreasement
    characterEquipmentAutoIncreasement += 1

    this.origin = origin
    this.stats = stats
    this._name = name
    this._isCustom = false
  }

  // TODO: remove getter to support lagacy
  get id() {
    return this.instanceId
  }

  get name() {
    return this._name ? this._name : (this.origin ? this.origin.name : '')
  }
  set name(value: string) {
    this._name = value
  }

  get is() {
    if (this instanceof Weapon) {
      return 'weapon'
    }
    if (this instanceof Armor) {
      return 'armor'
    }
    if (this instanceof Avatar) {
      return 'avatar'
    }
    return 'other'
  }

  isWeapon(): this is Weapon {
    return this instanceof Weapon
  }
  isArmor(): this is Armor {
    return this instanceof Armor
  }
  isAvatar(): this is Avatar {
    return this instanceof Avatar
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
  get allStats() {
    const allStats = this.stats.map(stat => stat.clone())
    if (this.hasCrystal) {
      (this.crystals as EquipmentCrystal[]).forEach(crystal => {
        crystal.stats.forEach(crystalStat => {
          const find = allStats.find(stat => stat.equals(crystalStat))
          find ? find.add(crystalStat.value) : allStats.push(crystalStat.clone())
        })
      })
    }
    return allStats
  }
  get isCustom() {
    return this._isCustom
  }
  get elementStat() {
    return this.stats.find(stat => CharacterEquipment.elementStatIds.includes(stat.baseId))
  }

  get categoryText() {
    if (this.type === EquipmentTypes.Additional || this.type === EquipmentTypes.Special || this.type === EquipmentTypes.Avatar) {
      return Grimoire.i18n.t('common.Equipment.field.' + this.type)
    }
    return Grimoire.i18n.t('common.Equipment.category.' + this.type)
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
    return this instanceof MainWeapon ? 'mdi-sword' : 'mdi-shield'
  }

  getCategoryImagePath(fieldId = -1): string {
    if (this instanceof Avatar) {
      fieldId = 0
    }
    return CharacterEquipment.getImagePath(this.type, fieldId)
  }

  static getImagePath(type: EquipmentTypes, fieldId: number = -1): string {
    return Images.equipmentIcons.get(type + (fieldId === -1 ? '' : `-${fieldId}`))
  }

  getAllStats(checkRestriction: (stat: StatRestriction) => boolean = () => true): StatRestriction[] {
    const allStats = this.stats
      .map(stat => {
        const newStat = stat.clone()
        if (!checkRestriction(newStat)) {
          newStat.value = 0
        }
        return newStat
      })
    if (this.hasCrystal) {
      (this.crystals as EquipmentCrystal[]).forEach(crystal => {
        crystal.stats.forEach(crystalStat => {
          const find = allStats.find(stat => stat.equals(crystalStat))
          if (find) {
            find.add(checkRestriction(crystalStat) ? crystalStat.value : 0)
          } else {
            const newStat = crystalStat.clone()
            if (!checkRestriction(newStat)) {
              newStat.value = 0
            }
            allStats.push(newStat)
          }
        })
      })
    }
    return allStats
  }

  setCustom(set: boolean) {
    this._isCustom = set
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
  appendCrystal(origin: Crystal) {
    if (this.hasCrystal) {
      const crystals = this.crystals!
      if (crystals.length < 2) {
        crystals.push(new EquipmentCrystal(origin))
      }
    }
  }
  removeCrystal(crystal: EquipmentCrystal) {
    if (this.hasCrystal) {
      const crystals = this.crystals!
      const idx = crystals.indexOf(crystal)
      crystals.splice(idx, 1)
    }
  }

  clone(): CharacterEquipment {
    const stats = this.stats.map(stat => stat.clone())
    const name = this.name

    let eq: CharacterEquipment | null = null
    if (this instanceof Weapon) {
      if (this instanceof MainWeapon) {
        eq = new MainWeapon(this.origin, name, stats, this.type, this.atk)
      } else if (this instanceof SubWeapon) {
        eq = new SubWeapon(this.origin, name, stats, this.type, this.atk)
      }
      if (eq) {
        eq.atk = this.atk
      }
    }
    if (this instanceof Armor) {
      if (this instanceof SubArmor) {
        eq = new SubArmor(this.origin, name, stats, this.type, this.def)
      } else if (this instanceof BodyArmor) {
        eq = new BodyArmor(this.origin, name, stats, this.def)
      } else if (this instanceof AdditionalGear) {
        eq = new AdditionalGear(this.origin, name, stats, this.def)
      } else if (this instanceof SpecialGear) {
        eq = new SpecialGear(this.origin, name, stats, this.def)
      }
      if (eq) {
        eq.def = this.def
      }
    }
    if (this instanceof Avatar) {
      eq = new Avatar(this.origin, name, stats)
    }

    if (!eq) {
      eq = new Avatar(this.origin, name, stats)
    }

    if (this.hasRefining) {
      eq.refining = this.refining
    }
    if (this.hasStability) {
      eq.stability = this.stability
    }
    if (this.hasCrystal) {
      eq.crystals = this.crystals!.map(crystal => crystal.clone())
    }
    if (this.isCustom) {
      eq.setCustom(true)
    }

    return eq
  }

  // save and load of json-data
  save(): EquipmentSaveData {
    const data: EquipmentSaveData = {
      instance: -1,
      stats: [],
      isCustom: false,
      id: -1,
      name: '',
      type: EquipmentTypes.Empty,
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

    // == [ stats ] ==================================================
    data.stats = this.stats.map(stat => stat.save())

    // == [ atk ] [ def ] ============================================
    if (this instanceof Weapon) {
      data.atk = this.atk
    } else if (this instanceof Armor) {
      data.def = this.def
    }

    // == [ other ] ===================================================
    data.name = this.name
    if (this.hasStability) {
      data.stability = this.stability
    }
    if (this.hasRefining) {
      data.refining = this.refining
    }
    if (this.hasCrystal) {
      data.crystals = (this.crystals as EquipmentCrystal[]).map(crystal => crystal.name)
    }

    data.isCustom = this.isCustom

    // == [ id ] ======================================================
    data.id = this.id

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

  static loadEquipment(data: EquipmentSaveData): CharacterEquipment | null {
    try {
      const { id, name, instance, stability, refining, atk, def, crystals, isCustom } = data
      const stats = data.stats.map(stat => StatRestriction.load(stat)).filter(stat => stat !== null) as StatRestriction[]

      stats.forEach(stat => {
        if (typeof stat.value === 'string') {
          stat.value = isNumberString(stat.value) ? parseFloat(stat.value) : 0
        }
      })

      const origin = Grimoire.Items.equipments.find(item => item.id === id) || null

      // const instance = [
      //   MainWeapon, SubWeapon, SubArmor, BodyArmor,
      //   AdditionalGear, SpecialGear, Avatar,
      // ][data.instance];

      const type: EquipmentTypes = (() => {
        const originalType = (data.type || EquipmentTypes.Avatar) as string
        if (instance === 3 && (originalType === 'normal' || originalType === 'dodge' || originalType === 'defense')) {
          return 'body-' + originalType
        }
        return originalType.replace(/_/g, '-')
      })() as EquipmentTypes

      let eq
      if (instance === 0) {
        eq = new MainWeapon(origin, name, stats, type, atk as number, stability)
      } else if (instance === 1) {
        eq = new SubWeapon(origin, name, stats, type, atk as number, stability)
      } else if (instance === 2) {
        eq = new SubArmor(origin, name, stats, type, def as number)
      } else if (instance === 3) {
        eq = new BodyArmor(origin, name, stats, def as number)
        eq.setType(type)
      } else if (instance === 4) {
        eq = new AdditionalGear(origin, name, stats, def as number)
      } else if (instance === 5) {
        eq = new SpecialGear(origin, name, stats, def as number)
      } else {
        eq = new Avatar(origin, name, stats)
      }

      if (eq.hasRefining) {
        eq.refining = refining
      }
      if (eq.hasCrystal && crystals) {
        eq.crystals = crystals.map(crystalName => {
          const crystal = Grimoire.Items.crystals.find(_crystal => _crystal.name === crystalName)
          if (crystal) {
            return new EquipmentCrystal(crystal)
          }
          console.warn('[CharacterEquipment.load] Can not find crystal: ' + crystalName)
          return null
        }).filter(crystal => crystal) as EquipmentCrystal[]
      }

      eq.setCustom(isCustom)

      return eq
    } catch (err) {
      console.warn('[CharacterEquipment.load] An unexpected error occurred.')
      console.warn(err)
      return null
    }
  }

  static fromOriginEquipment(item: Equipment, {
    statValueToNumber = true,
  } = {}): CharacterEquipment {
    /* [
      0'單手劍', 1'雙手劍', 2'弓', 3'弩', 4'法杖',
      5'魔導具', 6'拳套', 7'旋風槍', 8'拔刀劍',
      100'箭矢', 101'小刀', 102'忍術卷軸',
      200'盾牌',
      300'身體裝備', 400'追加裝備', 500'特殊裝備',
    ] */
    const pre_args = [
      item,
      item.name as string,
      item.stats.map((stat, idx) => {
        const statRest = StatRestriction.fromOrigin(stat, item.statRestrictions[idx])
        if (statValueToNumber && typeof statRest.value === 'string') {
          statRest.value = isNumberString(statRest.value) ? parseFloat(statRest.value) : 0
        }
        return statRest
      }),
    ] as const

    if (item.category === -1) {
      return new Avatar(...pre_args)
    }

    const stability = item.baseStability
    if (item.category === 300) {
      return new BodyArmor(...pre_args, item.baseValue)
    }
    if (item.category === 400) {
      return new AdditionalGear(...pre_args, item.baseValue)
    }
    if (item.category === 500) {
      return new SpecialGear(...pre_args, item.baseValue)
    }
    if (item.category < 100) {
      const type = [
        EquipmentTypes.OneHandSword, EquipmentTypes.TwoHandSword,
        EquipmentTypes.Bow, EquipmentTypes.Bowgun,
        EquipmentTypes.Staff, EquipmentTypes.MagicDevice,
        EquipmentTypes.Knuckle, EquipmentTypes.Halberd,
        EquipmentTypes.Katana,
      ][item.category]

      return new MainWeapon(...pre_args, type, item.baseValue, stability)
    }
    if (item.category < 200) {
      const type = [
        EquipmentTypes.Arrow, EquipmentTypes.Dagger, EquipmentTypes.NinjutsuScroll,
      ][item.category - 100]
      return new SubWeapon(...pre_args, type, item.baseValue, stability)
    }
    if (item.category < 300) {
      return new SubArmor(...pre_args, EquipmentTypes.Shield, item.baseValue)
    }

    return new Avatar(...pre_args)
  }
}

interface EquipmentSaveData {
  name: string;
  instance: number;
  stats: StatRestrictionSaveData[];
  isCustom: boolean;
  id: number;
  type: EquipmentTypes;
  atk?: number;
  def?: number;
  stability?: number;
  refining?: number;
  crystals?: string[];
}

abstract class Weapon extends CharacterEquipment {
  override atk: number
  override stability: number

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], atk: number | string = 1, stability: number = 0) {
    super(origin, name, stats)

    atk = typeof atk === 'string' ? parseInt(atk, 10) : atk

    this.atk = atk
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
    stability?: number,
  ) {
    super(origin, name, stats, atk, stability)

    this.type = type
    this.crystals = []
    this.refining = 0
  }

  get refiningAdditionAmount() {
    return Math.floor(this.atk * this.refining * this.refining / 100) + this.refining
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
    stability?: number,
  ) {
    super(origin, name, stats, atk, stability)

    this.type = type
  }

  override get hasElement() {
    return this.type === EquipmentTypes.Arrow
  }
}

abstract class Armor extends CharacterEquipment {
  override def: number

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    def: number | string = 0,
  ) {
    super(origin, name, stats)

    def = typeof def === 'string' ? parseInt(def, 10) : def

    this.def = def
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
    def?: number | string,
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

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], def?: number | string) {
    super(origin, name, stats, def)

    this.type = EquipmentTypes.BodyNormal
    this.refining = 0
    this.crystals = []

    this.customTypeList = [
      EquipmentTypes.BodyNormal,
      EquipmentTypes.BodyDodge,
      EquipmentTypes.BodyDefense,
    ]
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

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], def?: number | string) {
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

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], def?: number | string) {
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
  origin: Crystal
  stats: StatRestriction[]

  constructor(origin: Crystal) {
    this.origin = origin
    this.stats = this.origin.stats
      .map((stat, idx) => StatRestriction.fromOrigin(stat, this.origin.statRestrictions[idx]))
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
