import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { EquipmentRestriction } from '@/lib/Skill/SkillComputingContainer'

import { EquipmentTypes } from '../CharacterEquipment/enums'
import { StatTypes } from './enums'
import { StatBase, Stat } from './StatBase'

interface StatRestrictionItems extends EquipmentRestriction {
  other: string | null;
}

class StatRestriction extends Stat {
  restriction: StatRestrictionItems | null

  constructor(base: StatBase, type: StatTypes, value: number, restriction: StatRestrictionItems | null = null) {
    super(base, type, value)
    this.restriction = restriction !== null ? markRaw(restriction) : restriction
  }

  override get statId() {
    let rtext = 'none++'
    if (this.restriction !== null) {
      const r = this.restriction
      const rs = [r.main, r.sub, r.body, r.other]
      rtext = rs.map(item => {
        if (typeof item === 'string')
          return item
        return 'none'
      }).join('+')
    }
    return `${this.base.statId(this.type)}|${rtext}`
  }

  override clone() {
    return new StatRestriction(this.base, this.type, this.value, this.restriction)
  }

  pure() {
    return new Stat(this.base, this.type, this.value)
  }

  restrictionTexts(): string[] {
    const showData: string[] = []
    if (this.restriction !== null) {
      const restriction = this.restriction
      const items = [{
        key: 'main',
        value: restriction.main,
      }, {
        key: 'sub',
        value: restriction.sub,
      }, {
        key: 'body',
        value: restriction.body,
      }] as const
      items.filter(item => item.value !== null).forEach(item => {
        const [instance, originalType] = (item.value as string).split('|')
        const type = originalType ? originalType : instance
        showData.push((item.key === 'main' ? '' : item.key + '.') + type)
      })
    }
    return showData.map(item => Grimoire.i18n.t('common.Equipment.stat-restriction.' + item))
  }

  static from(stat: Stat, restriction?: StatRestrictionItems | null): StatRestriction {
    return new StatRestriction(stat.base, stat.type, stat.value, restriction)
  }

  static fromOrigin(stat: Stat, originRestriction: string): StatRestriction {
    const itemStatRestrictionList = [
      'event',

      '1h_sword', '2h_sword',
      'bow', 'bowgun',
      'staff', 'magic_device',
      'knuckle', 'halberd',
      'katana',

      'arrow', 'dagger', 'ninjutsu-scroll',

      'shield',

      'dodge', 'defense', 'normal',
    ]
    const itemStatRestrictionMappingList: ('event' | EquipmentTypes)[] = [
      'event',

      EquipmentTypes.OneHandSword, EquipmentTypes.TwoHandSword,
      EquipmentTypes.Bow, EquipmentTypes.Bowgun,
      EquipmentTypes.Staff, EquipmentTypes.MagicDevice,
      EquipmentTypes.Knuckle, EquipmentTypes.Halberd,
      EquipmentTypes.Katana,

      EquipmentTypes.Arrow, EquipmentTypes.Dagger, EquipmentTypes.NinjutsuScroll,

      EquipmentTypes.Shield,

      EquipmentTypes.BodyDodge, EquipmentTypes.BodyDefense, EquipmentTypes.BodyNormal,
    ]

    const newOriginRestriction: StatRestrictionItems = {
      main: null, sub: null, body: null, other: null,
    }

    originRestriction.split(/\s*,\s*/).forEach(q => {
      let [_eqType, _restriction] = q.split('.')
      if (!_restriction) {
        _restriction = _eqType
        _eqType = 'main'
      }
      const eqType = _eqType as ('main' | 'sub' | 'body')
      const restriction = _restriction
      const restrictionIndex = itemStatRestrictionList.indexOf(restriction)
      if (!['main', 'sub', 'body'].includes(eqType) || restrictionIndex === -1) {
        if (restriction !== '') {
          console.warn('[CharacterEquipment.fromOrigin] unknow restriction of stat: ' + q)
        }
        return StatRestriction.from(stat, newOriginRestriction)
      }

      const restrictionToType = itemStatRestrictionMappingList[restrictionIndex]
      if (restrictionToType === 'event') {
        newOriginRestriction.other = restrictionToType
      } else {
        newOriginRestriction[eqType] = restrictionToType
      }
    })

    return StatRestriction.from(stat, newOriginRestriction)
  }

  save(): StatRestrictionSaveData {
    const rest = this.restriction
    const restriction = rest && (rest.main || rest.sub || rest.body || rest.other) ? {
      main: rest.main ? rest.main : null,
      sub: rest.sub ? rest.sub : null,
      body: rest.body ? rest.body : null,
      other: rest.other ? rest.other : null,
    } : null
    return {
      id: this.baseName,
      value: this.value,
      type: this.type,
      restriction,
    }
  }
  static load(data: StatRestrictionSaveData) {
    const base = Grimoire.Character.findStatBase(data.id)
    if (base) {
      const stat = base.createStat(data.type, data.value)

      const restriction: StatRestrictionItems = {
        main: null,
        sub: null,
        body: null,
        other: null,
      }
      if (data.restriction !== null) {
        const dataRestriction = data.restriction;
        (['main', 'sub', 'body'] as const).forEach(key => {
          const type = dataRestriction[key]
          restriction[key] = type
        })
        restriction.other = data.restriction.other
      }

      return StatRestriction.from(stat, restriction)
    }

    console.warn('[Error: CharacterEquipment.load] can not find stat which id: ' + data.id)
    return null
  }
}

interface StatRestrictionSaveData {
  id: string;
  value: number;
  type: StatTypes;
  restriction: StatRestrictionItems | null;
}

export default StatRestriction
export type { StatRestrictionSaveData }
