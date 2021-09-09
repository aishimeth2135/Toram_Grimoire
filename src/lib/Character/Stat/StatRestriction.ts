import { markRaw } from 'vue';
import Grimoire from '@/shared/Grimoire';
import GetLang from '@/shared/services/Language';
import { StatBase, Stat } from './StatBase';
import type { StatValue } from './StatBase';
import { StatTypes } from './enums';
import { EquipmentTypes } from '../CharacterEquipment/enums';

interface StatRestrictionItems {
  main: string | null;
  sub: string | null;
  body: string | null;
  other: string | null;
}

class StatRestriction extends Stat {
  restriction: StatRestrictionItems | null;

  constructor(base: StatBase, type: StatTypes, value: StatValue, restriction: StatRestrictionItems | null = null) {
    super(base, type, value);
    this.restriction = restriction !== null ? markRaw(restriction) : restriction;
  }

  get statId() {
    let rtext = 'none++';
    if (this.restriction !== null) {
      const r = this.restriction;
      const rs = [r.main, r.sub, r.body, r.other];
      rtext = rs.map(item => {
        if (typeof item === 'string')
          return item;
        return 'none';
      }).join('+');
    }
    return `${this.base.statId(this.type)}|${rtext}`;
  }

  copy() {
    return new StatRestriction(this.base, this.type, this.value, this.restriction);
  }

  restrictionTexts(): string[] {
    const showData: string[] = [];
    if (this.restriction !== null) {
      const restriction = this.restriction;
      const items = [{
        key: 'main',
        value: restriction.main,
      }, {
        key: 'sub',
        value: restriction.sub,
      }, {
        key: 'body',
        value: restriction.body,
      }] as const;
      items.filter(item => item.value !== null).forEach(item => {
        const [instance, originalType] = (item.value as string).split('|');
        const type = originalType ? originalType : instance;
        showData.push((item.key === 'main' ? '' : item.key + '/') + type);
      });
    }
    return showData.map(p => GetLang('common/Equipment/stat restriction/' + p));
  }

  static from(stat: Stat, restriction: StatRestrictionItems | null): StatRestriction {
    return new StatRestriction(stat.base, stat.type, stat.value, restriction);
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
    ];
    const itemStatRestrictionMappingList = [
      'event',

      EquipmentTypes.OneHandSword, EquipmentTypes.TwoHandSword,
      EquipmentTypes.Bow, EquipmentTypes.Bowgun,
      EquipmentTypes.Staff, EquipmentTypes.MagicDevice,
      EquipmentTypes.Knuckle, EquipmentTypes.Halberd,
      EquipmentTypes.Katana,

      EquipmentTypes.Arrow, EquipmentTypes.Dagger, EquipmentTypes.NinjutsuScroll,

      EquipmentTypes.Shield,

      EquipmentTypes.BodyDodge, EquipmentTypes.BodyDefense, EquipmentTypes.BodyNormal,
    ];

    const newOriginRestriction: StatRestrictionItems = {
      main: null, sub: null, body: null, other: null,
    };

    originRestriction.split(/\s*,\s*/).forEach(q => {
      let [_eqType, _restriction] = q.split('.');
      if (!_restriction) {
        _restriction = _eqType;
        _eqType = 'main';
      }
      const eqType = _eqType as ('main' | 'sub' | 'body');
      const restriction = _restriction;
      const restrictionIndex = itemStatRestrictionList.indexOf(restriction);
      if (!['main', 'sub', 'body'].includes(eqType) || restrictionIndex === -1) {
        if (restriction !== '') {
          console.warn('[warn] unknow restriction of stat: ' + q);
        }
        return StatRestriction.from(stat, newOriginRestriction);
      }

      const restrictionToSymbol = itemStatRestrictionMappingList[restrictionIndex];
      if (typeof restrictionToSymbol === 'string') {
        newOriginRestriction.other = restrictionToSymbol;
      }
      else {
        newOriginRestriction[eqType] = restrictionToSymbol;
      }
    });

    return StatRestriction.from(stat, newOriginRestriction);
  }

  save(): StatRestrictionSaveData {
    const rest = this.restriction;
    const restriction = rest && (rest.main || rest.sub || rest.body || rest.other) ? {
      main: rest.main ? rest.main : null,
      sub: rest.sub ? rest.sub : null,
      body: rest.body ? rest.body : null,
      other: rest.other ? rest.other : null,
    } : null;
    return {
      id: this.baseName,
      value: this.value,
      type: this.type,
      restriction,
    };
  }
  static load(data: StatRestrictionSaveData) {
    const base = Grimoire.Character.findStatBase(data.id);
    if (base) {
      const stat = base.createStat(data.type, data.value);

      const restriction: StatRestrictionItems = {
        main: null,
        sub: null,
        body: null,
        other: null,
      };
      if (data.restriction !== null) {
        const dataRestriction = data.restriction;
        (['main', 'sub', 'body'] as const).forEach(key => {
          const type = dataRestriction[key];
          restriction[key] = type;
        });
        restriction.other = data.restriction.other;
      }

      return StatRestriction.from(stat, restriction);
    }

    console.warn('[Error: CharacterEquipment.load] can not find stat which id: ' + data.id);
    return null;
  }
}

interface StatRestrictionSaveData {
  id: string;
  value: StatValue;
  type: StatTypes;
  restriction: {
    main: string | null;
    sub: string | null;
    body: string | null;
    other: string | null;
  } | null;
}

export default StatRestriction;
export type { StatRestrictionSaveData };
