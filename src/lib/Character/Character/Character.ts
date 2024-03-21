import {
  CharacterEquipment,
  SubArmor,
  SubWeapon,
} from '@/lib/Character/CharacterEquipment'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'

import {
  CharacterComboBuild,
  CharacterComboBuildSaveData,
} from '../CharacterComboBuild'
import {
  CharacterBindingBuild,
  checkLoadedId,
  getLoadedId,
} from './CharacterBuild'
import { CharacterBaseStatTypes, EquipmentFieldTypes } from './enums'

let _characterAutoIncreasement = 0
class Character implements CharacterBindingBuild {
  private _baseStats: CharacterBaseStat[]
  private _optinalBaseStat: CharacterBaseStat | null

  readonly id: number
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
    this.id = _characterAutoIncreasement
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
      id: this.id,
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
        this.loadedId = getLoadedId(loadCategory, id)
      }

      return true
    } catch (err) {
      console.warn('[Character.load] An unexpected error occurred.')
      console.error(err)
      return false
    }
  }

  matchLoadedId(loadCategory: string, id: number | null): boolean {
    return checkLoadedId(this, loadCategory, id)
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

export { Character, EquipmentField }
export type { CharacterBaseStat, CharacterSaveData, CharacterBindingBuild }
