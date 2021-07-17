import Grimoire from "@grimoire";
import GetLang from "@services/Language";
import { StatBase, Stat } from "./StatBase.js";
import { MainWeapon, SubWeapon, SubArmor, BodyArmor } from "../CharacterEquipment";

class RestrictionStat extends Stat {
  /**
   * @param {StatBase} base
   * @param {symbol} type
   * @param {StatValue} v
   * @param {StatRestriction|null} [restriction]
   */
  constructor(base, type, v, restriction = null) {
    super(base, type, v);

    /** @type {StatRestriction|null} */
    this.restriction = restriction;
  }

  get statId() {
    let rtext = 'none++';
    if (this.restriction) {
      const r = this.restriction;
      const rs = [r.main, r.sub, r.body, r.other];
      rtext = rs.map(p => {
        if (typeof p === 'symbol')
          return p.description;
        if (typeof p === 'string')
          return p;
        return 'none';
      }).join('+');
    }
    return `${this.base.statId(this.type)}|${rtext}`;
  }

  copy() {
    return new RestrictionStat(this.base, this.type, this.value, this.restriction);
  }
  showData() {
    const res = [];
    if (this.restriction) {
      const r = this.restriction;
      ['main', 'sub', 'body'].filter(p => r[p]).forEach(p => {
        let [instance, type] = r[p].description.split('|');
        if (!type) {
          type = instance;
        }
        res.push((p === 'main' ? '' : p + '/') + type);
      });
    }
    return res;
  }
  restrictionTexts() {
    return this.showData().map(p => GetLang('common/Equipment/stat restriction/' + p));
  }

  /**
   * create RestrictionStat from Stat
   * @param {Stat} stat - Base Stat
   * @param {StatRestriction} restriction
   * @returns {RestrictionStat}
   */
  static from(stat, restriction) {
    return new RestrictionStat(stat.base, stat.type, stat.value, restriction);
  }

  /**
   * @param {Stat} stat
   * @param {string} originRestriction
   * @returns {RestrictionStat}
   */
  static fromOrigin(stat, originRestriction) {
    const itemStatRestrictionList = [
      'event',

      '1h_sword', '2h_sword', 'bow', 'bowgun', 'staff',
      'magic_device', 'knuckle', 'halberd', 'katana',

      'arrow', 'dagger', 'ninjutsu-scroll',

      'shield',

      'dodge', 'defense', 'normal',
    ];
    const itemStatRestrictionMappingList = [
      'event',

      MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
      MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
      MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
      MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
      MainWeapon.TYPE_KATANA,

      SubWeapon.TYPE_ARROW, SubWeapon.TYPE_DAGGER, SubWeapon.TYPE_NINJUTSU_SCROLL,

      SubArmor.TYPE_SHIELD,

      BodyArmor.TYPE_DODGE, BodyArmor.TYPE_DEFENSE, BodyArmor.TYPE_NORMAL,
    ];

    const r = {
      main: null, sub: null, body: null, other: null,
    };

    originRestriction.split(/\s*,\s*/).forEach(q => {
      let [eqType, restriction] = q.split('.');
      if (!restriction) {
        restriction = eqType;
        eqType = 'main';
      }
      const restrictionIndex = itemStatRestrictionList.indexOf(restriction);
      if (!['main', 'sub', 'body'].includes(eqType) || restrictionIndex === -1) {
        restriction !== '' && console.warn('[warn] unknow restriction of stat: ' + q);
        return RestrictionStat.from(stat, r);
      }

      restriction = itemStatRestrictionMappingList[restrictionIndex];
      if (typeof restriction === 'string')
        r.other = restriction;
      else
        r[eqType] = restriction;
    });

    return RestrictionStat.from(stat, r);
  }

  save() {
    const types = ['constant', 'multiplier', 'total'];
    const r = this.restriction;
    const restriction = r && (r.main || r.sub || r.body || r.other) ? {
      main: r.main ? r.main.description : null,
      sub: r.sub ? r.sub.description : null,
      body: r.body ? r.body.description : null,
      other: r.other ? r.other : null,
    } : null;
    return {
      id: this.baseName,
      value: this.value,
      type: types.find(p => StatBase['TYPE_' + p.toUpperCase()] == this.type),
      restriction,
    };
  }
  static load(data) {
    const base = Grimoire.Character.findStatBase(data.id);
    if (base) {
      const stat = base.createStat(StatBase['TYPE_' + data.type.toUpperCase()], data.value);

      const restriction = {};
      if (!data.restriction) {
        restriction.main = null;
        restriction.sub = null;
        restriction.body = null;
        restriction.other = null;
      } else {
        ['main', 'sub', 'body'].forEach(key => {
          const t = data.restriction[key];
          let res = null;
          if (t !== null) {
            const handleType = a => 'TYPE_' + a.replace(/-/g, '_').toUpperCase();
            let [instance, type] = t.split('|');
            if (!type) {
              type = instance;
              res = MainWeapon[handleType(type)];
            } else {
              res = {
                'sub-weapon': SubWeapon,
                'sub-armor': SubArmor,
                'body-armor': BodyArmor,
              }[instance][handleType(type)]
            }
          }

          restriction[key] = res;
        });
        restriction.other = data.restriction.other;
      }

      return RestrictionStat.from(stat, restriction);
    }

    console.warn('[Error: CharacterEquipment.load] can not find stat which id: ' + data.id);
    return null;
  }
}

export default RestrictionStat;

/**
 * @typedef StatRestriction
 * @type {object}
 * @property {symbol|null} main
 * @property {symbol|null} sub
 * @property {symbol|null} body
 * @property {symbol|null} other
 */
/**
 * @typedef {string|number} StatValue
 */
