<template>
  <section>
    <div class="character-stat-categorys">
      <div v-for="data in showCharacterStatDatas" class="category" :key="data.name">
        <div class="title">{{ data.name }}</div>
        <div class="stats">
          <span v-for="stat in data.stats" :key="stat.name + stat.value">
            <span class="name">{{ stat.name }}</span>
            <span class="value">{{ stat.value }}</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import Grimoire from "@Grimoire";
import { EquipmentField } from "@lib/CharacterSystem/CharacterStat/class/main.js";
import { MainWeapon, SubWeapon, BodyArmor } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

export default {
  props: ['characterState'],
  computed: {
    showCharacterStatDatas() {
      const categoryList = Grimoire.CharacterSystem.characterStatCategoryList;
      const characterStatMap = {};
      categoryList.map(p => p.stats).flat().forEach(p => characterStatMap[p.id] = p)

      const c = this.characterState.origin;
      const vars = {
        value: {
          '@': {
            'clv': c.level,
            'str': c.baseStatValue('STR'),
            'dex': c.baseStatValue('DEX'),
            'int': c.baseStatValue('INT'),
            'agi': c.baseStatValue('AGI'),
            'vit': c.baseStatValue('VIT'),
            'tec': c.baseStatValue('TEC'),
            'men': c.baseStatValue('MEN'),
            'crt': c.baseStatValue('CRT'),
            'luk': c.baseStatValue('LUK'),
            'main': c.fieldEquipment(EquipmentField.TYPE_MAIN_WEAPON),
            'sub': c.fieldEquipment(EquipmentField.TYPE_SUB_WEAPON),
            'armor': c.fieldEquipment(EquipmentField.TYPE_BODY_ARMOR),
            'additional': c.fieldEquipment(EquipmentField.TYPE_ADDITIONAL),
            'special': c.fieldEquipment(EquipmentField.TYPE_SPECIAL),
            'shield': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_SHIELD) ?
              c.fieldEquipment(EquipmentField.TYPE_SUB_WEAPON) :
              {
                'refining': 0,
                'def': 0
              },
            'arrow': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_ARROW) ?
              c.fieldEquipment(EquipmentField.TYPE_SUB_WEAPON) :
              {
                'stability': 0,
                'atk': 0
              },
            'skill': {
              'Conversion': 0
            }
          },
          '#': {

          },
          '$': characterStatMap
        },
        conditional: {
          '@': {
            '1h_sword': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_ONE_HAND_SWORD),
            '2h_sword': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_TWO_HAND_SWORD),
            'bow': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_BOW),
            'bowgun': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_BOWGUN),
            'staff': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_STAFF),
            'magic_device': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_MAGIC_DEVICE),
            'knuckle': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_KNUCKLE),
            'dual_sword': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_ONE_HAND_SWORD) &&
              c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, MainWeapon.TYPE_ONE_HAND_SWORD),
            'halberd': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_HALBERD),
            'katana': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_KATANA),
            'main': {
              'none': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, EquipmentField.EMPTY)
            },
            'sub': {
              'arrow': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_ARROW),
              'shield': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_SHIELD),
              'dagger': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_DAGGER),
              'knuckle': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, MainWeapon.TYPE_KNUCKLE),
              'magic_device': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, MainWeapon.TYPE_MAGIC_DEVICE)
            },
            'armor': {
              'normal': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, BodyArmor.TYPE_NORMAL),
              'dodge': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, BodyArmor.TYPE_DODGE),
              'defense': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, BodyArmor.TYPE_DEFENSE),
              'none': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, EquipmentField.EMPTY)
            }
          },
          '#': {}
        }
      };

      const all_stats = [];

      function appendStat(stat) {
        const t = all_stats.find(a => a.equals(stat));
        t ? t.addStatValue(stat.statValue()) : all_stats.push(stat.copy());
      }
      c.equipmentFields.forEach(field => {
        if (!field.empty()) {
          field.equipment.allStats.forEach(appendStat);
        }
      });

      return categoryList.map(p => {
        return {
          name: p.name,
          stats: p.stats.map(a => {
            //console.log('%c' + a.id, 'color: white; background-color: red');
            const res = a.result(all_stats, vars);
            return {
              name: a.name,
              value: res.value + a.unit,
              hidden: res.hidden
            };
          }).filter(a => !a.hidden)
        };
      }).filter(a => a.stats.length != 0);
    },
  }
}
</script>
<style lang="less" scoped>
.character-stat-categorys {
  > .category {
    padding: 0 0.6rem;
    margin-bottom: 1.2rem;

    > .title {
      border-bottom: 1px solid var(--primary-light);
      padding-bottom: 0.1rem;
      padding-left: 0.3rem;
      font-size: 0.9rem;
    }

    > .stats {
      > span {
        padding: 0.2rem 0.6rem;
        border-bottom: 1px solid var(--primary-light-2);
        margin: 0.3rem;
        display: inline-block;

        > .name {
          margin-right: 0.4rem;
        }

        > .value {
          color: var(--primary-light-4);
        }
      }
    }
  }
}
</style>