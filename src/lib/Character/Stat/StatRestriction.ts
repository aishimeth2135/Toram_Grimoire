import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { splitComma } from '@/shared/utils/string'

import {
  EquipmentTypes,
  MainWeaponTypeList,
  SubArmorTypeList,
  SubWeaponTypeList,
} from '../CharacterEquipment/enums'
import { Stat, StatBase } from './StatBase'
import { StatTypes } from './enums'

class StatRestriction extends Stat {
  restriction: EquipmentRestrictions | null

  constructor(
    base: StatBase,
    type: StatTypes,
    value: number,
    restriction: EquipmentRestrictions | null = null
  ) {
    super(base, type, value)
    this.restriction = restriction !== null ? markRaw(restriction) : restriction

    let rtext = 'none++'
    if (this.restriction !== null) {
      const rst = this.restriction
      const rstList = [rst.main, rst.sub, rst.body, rst.other]
      rtext = rstList
        .map(item => (typeof item === 'string' ? item : 'none'))
        .join('+')
    }
    this.statId = `${this.statId}|${rtext}`
  }

  override clone() {
    return new StatRestriction(
      this.base,
      this.type,
      this.value,
      this.restriction
    )
  }

  isEmpty() {
    if (!this.restriction) {
      return true
    }
    return (
      this.restriction.main === null &&
      this.restriction.sub === null &&
      this.restriction.body === null &&
      this.restriction.other === null
    )
  }

  pure() {
    return new Stat(this.base, this.type, this.value)
  }

  restrictionTexts(): string[] {
    const showData: string[] = []
    if (this.restriction !== null) {
      const restriction = this.restriction
      const items = [
        {
          key: 'main',
          value: restriction.main,
        },
        {
          key: 'sub',
          value: restriction.sub,
        },
        {
          key: 'body',
          value: restriction.body,
        },
      ] as const
      items
        .filter(item => item.value !== null)
        .forEach(item => {
          const [instance, originalType] = (item.value as string).split('|')
          const type = originalType ? originalType : instance
          showData.push((item.key === 'main' ? '' : item.key + '.') + type)
        })
    }
    return showData.map(item =>
      Grimoire.i18n.t('common.Equipment.stat-restriction.' + item)
    )
  }

  static from(
    stat: Stat,
    restriction?: EquipmentRestrictions | null
  ): StatRestriction {
    return new StatRestriction(stat.base, stat.type, stat.value, restriction)
  }

  static fromOrigin(stat: Stat, originRestriction: string): StatRestriction {
    const restrictionMapping: Record<string, EquipmentTypes> = {
      '1h_sword': EquipmentTypes.OneHandSword,
      '2h_sword': EquipmentTypes.TwoHandSword,
      'magic_device': EquipmentTypes.MagicDevice,
      'ninjutsu_scroll': EquipmentTypes.NinjutsuScroll,
      'dodge': EquipmentTypes.BodyDodge,
      'defense': EquipmentTypes.BodyDefense,
      'normal': EquipmentTypes.BodyNormal,
    }
    const restrictionList: string[] = [
      '',
      'event',

      ...MainWeaponTypeList,
      ...SubWeaponTypeList,
      ...SubArmorTypeList,

      EquipmentTypes.BodyDodge,
      EquipmentTypes.BodyDefense,
      EquipmentTypes.BodyNormal,
    ]

    const newOriginRestriction = new EquipmentRestrictions()

    splitComma(originRestriction).forEach(item => {
      let [_eqType, _restriction] = item.split('.')
      if (!_restriction) {
        _restriction = _eqType
        _eqType = 'main'
      }
      const eqType = _eqType as 'main' | 'sub' | 'body'
      const restriction = restrictionList.includes(_restriction)
        ? _restriction
        : restrictionMapping[_restriction]
      if (!['main', 'sub', 'body'].includes(eqType) || !restriction) {
        if (restriction !== '') {
          Grimoire.Logger.start(
            'StatRestriction.fromOrigin',
            'unknown restriction of stat'
          )
            .log(item)
            .end()
        }
        return StatRestriction.from(stat, newOriginRestriction)
      }

      if (restriction === 'event') {
        newOriginRestriction.other = restriction
      } else {
        newOriginRestriction[eqType] = restriction as EquipmentTypes
      }
    })

    return StatRestriction.from(stat, newOriginRestriction)
  }

  save(): StatRestrictionSaveData {
    const rest = this.restriction
    const restriction =
      rest && (rest.main || rest.sub || rest.body || rest.other)
        ? {
            main: rest.main ? rest.main : null,
            sub: rest.sub ? rest.sub : null,
            body: rest.body ? rest.body : null,
            other: rest.other ? rest.other : null,
          }
        : null
    return {
      id: this.baseId,
      value: this.value,
      type: this.type,
      restriction,
    }
  }
  static load(data: StatRestrictionSaveData) {
    const base = Grimoire.Character.findStatBase(data.id)
    if (base) {
      const stat = base.createStat(data.type, data.value)

      const restriction = new EquipmentRestrictions()
      if (data.restriction !== null) {
        const dataRestriction = data.restriction
        ;(['main', 'sub', 'body'] as const).forEach(key => {
          const type = dataRestriction[key]
          restriction[key] = type
        })
        restriction.other = data.restriction.other
      }

      return StatRestriction.from(stat, restriction)
    }

    console.warn(
      '[CharacterEquipment.load] can not find stat which id: ' + data.id
    )
    return null
  }
}

interface EquipmentRestrictionsParam {
  main?: EquipmentTypes | null
  sub?: EquipmentTypes | null
  body?: EquipmentTypes | null
  other?: string | null
}

class EquipmentRestrictions {
  main: EquipmentTypes | null
  sub: EquipmentTypes | null
  body: EquipmentTypes | null
  other: string | null

  constructor({
    main = null,
    sub = null,
    body = null,
    other = null,
  }: EquipmentRestrictionsParam = {}) {
    this.main = main
    this.sub = sub
    this.body = body
    this.other = other
  }
}

interface StatRestrictionSaveData {
  id: string
  value: number
  type: StatTypes
  restriction: EquipmentRestrictions | null
}

type EquipmentRestrictionsBaseKeys = 'main' | 'sub' | 'body'

export { StatRestriction, EquipmentRestrictions }
export type { StatRestrictionSaveData, EquipmentRestrictionsBaseKeys }
