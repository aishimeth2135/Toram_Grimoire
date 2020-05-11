<template>
  <article>
    <div class="main">
      <!-- <cy-sticky-header>
            </cy-sticky-header> -->
      <section v-if="currentContent == 0">
        <div class="character-stat-categorys">
          <div v-for="(data, i) in showCharacterStatDatas" class="category">
            <div class="title">{{ data.name }}</div>
            <div class="stats">
              <span v-for="(stat, j) in data.stats">
                <span class="name">{{ stat.name }}</span>
                <span class="value">{{ stat.value }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section v-else-if="currentContent == 1">
        <div class="character-fields">
          <div v-for="(field, i) in currentCharacterState.origin.equipmentFields" class="character-field">
            <div class="top">
              <div class="field-name">{{ langText('character field names/' + field.type.description) }}</div>
              <div class="buttons">
                <cy-button iconify-name="ic-outline-category" type="icon-only" class="single-line" @click="selectFieldEquipment(field)" />
              </div>
            </div>
            <equipment-information v-if="!field.empty()" @open-select-crystal="openSelectCrystal" :equipment-data="getShowEquipmentData(field.equipment)" @click.native.stop />
            <div class="warn-msg" v-else>
              {{ langText('Warn/no equipment selected') }}
            </div>
          </div>
        </div>
      </section>
      <section v-else-if="currentContent == 3">
      </section>
      <div class="tail">
        <cy-button iconify-name="mdi-rabbit" class="no-border" @click="switchContent(0)">
          {{ langText('character') }}
        </cy-button>
        <cy-button iconify-name="mdi:sword" class="no-border" @click="switchContent(1)">
          {{ langText('equipment') }}
        </cy-button>
        <cy-button iconify-name="fa-solid:star-half-alt" class="no-border" @click="switchContent(2)">
          {{ langText('skill') }}
        </cy-button>
      </div>
    </div>
    <div class="window-container">
      <cy-window :visible="browseEquipmentsWindowState.visible" @close-window="browseEquipmentsWindowState.visible = false" class="frozen-top width-wide browse-equipment-window">
        <template v-slot:title>{{ langText('browse equipments/action: ' + browseEquipmentsWindowState.action) }}</template>
        <template v-slot:default>
          <div class="buttons">
            <cy-button type="icon-only" iconify-name="ic-round-add-circle-outline" @click="appendEquipmentWindowState.visible = true">
            </cy-button>
          </div>
          <div class="equipments-scope">
            <div v-if="browsedEquipmentDatas.length == 0" class="msg">
              {{ langText('Warn/no eligible equipments found') }}
            </div>
            <div v-else class="equipments">
              <cy-button v-for="(data, i) in browsedEquipmentDatas" type="line" class="inline" :key="data.origin.id" :iconify-name="data.categoryIcon" @click="browsedEquipmentSelect(data)">
                {{ data.origin.name }}
              </cy-button>
            </div>
            <div class="bottom-menu" v-if="browseEquipmentsWindowState.currentEquipmentData != null">
              <div class="detail content">
                <div class="info">
                  <equipment-information :equipment-data="browseEquipmentsWindowState.currentEquipmentData" @open-select-crystal="openSelectCrystal" />
                </div>
                <div class="preview"></div>
              </div>
              <div class="tail-buttons" v-if="browseEquipmentsWindowState.action == 'select-field-equipment'">
                <cy-button iconify-name="ic-round-done" @click="equipmentConfirmSelection">
                  {{ langText('confirm selection') }}
                </cy-button>
              </div>
            </div>
          </div>
        </template>
      </cy-window>
      <append-equipment-window :visible="appendEquipmentWindowVisible" @close-append-equipment-window="closeAppendEquipmentWindow" />
      <cy-window :visible="selectCrystalWindowState.visible" @close-window="selectCrystalWindowState.visible = false">
        <template v-slot:title>{{ langText('select crystal/title') }}</template>
        <template v-slot:default>
          <cy-button v-for="(category, i) in crystalSearchResult" :key="category.id" iconify-name="bx-bx-cube-alt" type="drop-down">
            {{ langText('select crystal/category title')[category.id] }}
            <template v-slot:menu>
              <cy-button type="line" class="no-border" v-for="(c, i) in category.crystals" iconify-name="bx-bx-cube-alt" :key="c.id" @click="selectCrystal(c)">
                {{ c.name }}
              </cy-button>
            </template>
          </cy-button>
          <div class="bottom-menu" v-show="selectCrystalWindowState.currentCrystals.length > 0">
            <div>
              <cy-button type="line" iconify-name="bx-bx-cube-alt" v-for="(c, i) in selectCrystalWindowState.currentCrystals" @click="removeSelectedCrystal(i)" :key="c.id">
                {{ c.name }}
                <template v-slot:content-right>
                  <cy-icon-text iconify-name="ic-round-close" />
                </template>
              </cy-button>
            </div>
            <div class="tail-buttons">
              <cy-button iconify-name="ic-round-done" @click="equipmentAppendCrystals">
                {{ langText('confirm selection') }}
              </cy-button>
            </div>
          </div>
        </template>
      </cy-window>
    </div>
  </article>
</template>
<script>
import Grimoire from '@Grimoire';
import GetLang from "@global-modules/LanguageSystem.js";
import ShowMessage from "@global-modules/ShowMessage.js";

import { EquipmentField, Character } from "@lib/CharacterSystem/CharacterStat/class/main.js";
import { Weapon, Armor, MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

import vue_equipmentField from "./equipment-field.vue";
// import vue_langText from "@global-vue-components/lang-text.vue";

import vue_equipmentInformation from "./equipment-information.vue";
import vue_appendEquipmentWindow from "./append-equipment-window.vue";

import init from "./init.js";


function Lang(s, vs) {
  return GetLang('Character Simulator/' + s, vs);
}

export default {
  data() {
    return {
      characterStates: [],
      currentCharacterStateIndex: -1,
      equipments: [],
      currentContent: 1,
      browseEquipmentsWindowState: {
        visible: false,
        action: 'browse',
        currentField: null,
        currentEquipmentData: null
      },
      appendEquipmentWindowVisible: false,
      selectCrystalWindowState: {
        crystalCategorys: new Array(5).fill()
          .map((p, i) => {
            return {
              id: i,
              crystals: Grimoire.ItemSystem.items.crystals.filter(a => a.category == i)
            }
          }),
        visible: false,
        currentCrystals: [],
        currentEquipment: null
      },
      editCustomEquipmentWindow: {
        currentEquipmentData: null,
        equipmentTypeList: {
          'main-weapon': [
            'ONE_HAND_SWORD', 'TWO_HAND_SWORD', 'BOW', 'BOWGUN',
            'STAFF', 'MAGIC_DEVICE', 'KNUCKLE', 'HALBERD', 'KATANA'
          ],
          'sub-weapon': ['ARROW', 'SHIELD', 'DAGGER'],
          'body-armor': ['BODY_ARMOR_NORMAL', 'BODY_ARMOR_DODGE', 'BODY_ARMOR_DEFENSE'],
          'additional': null,
          'special': null,
          'avatar': null
        }
      }
    };
  },
  beforeCreate() {
    init();
  },
  created() {
    this.createCharacter();
  },
  filters: {

  },
  computed: {
    crystalSearchResult() {
      const state = this.selectCrystalWindowState;
      const eq = state.currentEquipment;

      const category = [MainWeapon, BodyArmor, AdditionalGear, SpecialGear]
        .findIndex(p => eq instanceof p);

      const exclude_ids = [
        ...state.currentCrystals.map(p => p.id)
      ];
      if (state.currentEquipment)
        exclude_ids.push(...state.currentEquipment.crystals.map(p => p.id));
      return state.crystalCategorys
        .filter(c => c.id == category || c.id == 4)
        .map(c => {
          return {
            id: c.id,
            crystals: c.crystals.filter(p => !exclude_ids.includes(p.id))
          };
        });
    },
    showCharacterStatDatas() {
      const categoryList = Grimoire.CharacterSystem.characterStatCategoryList;
      const characterStatMap = {};
      categoryList.map(p => p.stats).flat().forEach(p => characterStatMap[p.id] = p)

      const c = this.currentCharacterState.origin;
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
            'knuckle': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_KNUCKLE),
            'halberd': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_HALBERD),
            'katana': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_KATANA),
            'main': {
              'none': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, EquipmentField.EMPTY)
            },
            'sub': {
              'arrow': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_ARROW),
              'shield': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_SHIELD),
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
    appendEquipmentSelectedNumber() {
      return this.appendEquipmentWindowState.;
    },
    currentCharacterState() {
      return this.characterStates[this.currentCharacterStateIndex];
    },
    browsedEquipmentDatas() {
      return this.equipments
        .filter(p => this.browsedEquipmentFilter(p))
        .map(p => this.getShowEquipmentData(p));
    }
  },
  methods: {
    closeAppendEquipmentWindow() {
      this.appendEquipmentWindowVisible = false;
    },
    removeSelectedCrystal(index) {
      this.selectCrystalWindowState.currentCrystals.splice(index, 1);
    },
    selectCrystal(crystal_data) {
      const state = this.selectCrystalWindowState;
      const datas = state.currentCrystals;
      if (state.currentEquipment.crystals.length + datas.length < 2)
        datas.push(crystal_data);
    },
    equipmentAppendCrystals() {
      const state = this.selectCrystalWindowState;
      state.currentCrystals.forEach(p => state.currentEquipment.appendCrystal(p.id, p.name, p.stats));
      state.currentCrystals = [];
      state.currentEquipment = null;
      state.visible = false;
    },
    openSelectCrystal(eq) {
      const state = this.selectCrystalWindowState;
      state.currentEquipment = eq;
      state.visible = true;
    },
    fieldTypeText(field) {
      return this.langText('field type text/' + field.type.description);
    },
    equipmentConfirmSelection() {
      const state = this.browseEquipmentsWindowState;
      if (state.action == 'select-field-equipment') {
        state.currentField.setEquipment(state.currentEquipmentData.origin);
        state.currentEquipmentData = null;
        state.visible = false;
      }
    },
    browsedEquipmentSelect(data) {
      this.browseEquipmentsWindowState.currentEquipmentData = data;
    },
    openBrowseEquipmentsWindow() {
      const state = this.browseEquipmentsWindowState;
      state.currentEquipmentData = null;
      state.visible = true;
    },
    switchContent(index) {
      this.currentContent = index;
    },
    itemEquipmentConvert(item) {
      // 'Equipmemt Category list': [
      //     '單手劍', '雙手劍', '弓', '弩',
      //     '法杖', '魔導具', '拳套', '旋風槍',
      //     '拔刀劍', '箭矢', '盾牌', '小刀',
      //     '身體裝備', '追加裝備', '特殊裝備'
      // ]
      if (item.category < 9) {
        const t = [
          MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
          MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
          MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
          MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
          MainWeapon.TYPE_KATANA
        ][item.category];

        return new MainWeapon(item.id, t, item.name, item.stats, item.baseValue, item.baseStability);
      }
      if (item.category < 12) {
        const t = [
          SubWeapon.TYPE_ARROW, SubArmor.TYPE_SHIELD, SubWeapon.TYPE_DAGGER
        ][item.category - 9];
        if (item.category == 10)
          return new SubArmor(item.id, t, item.name, item.stats, item.baseValue);
        return new SubWeapon(item.id, t, item.name, item.stats, item.baseValue, item.baseStability);
      }
      if (item.category == 12)
        return new BodyArmor(item.id, item.name, item.stats, item.baseValue);
      if (item.category == 13)
        return new AdditionalGear(item.id, item.name, item.stats, item.baseValue);
      if (item.category == 14)
        return new SpecialGear(item.id, item.name, item.stats, item.baseValue);
    },
    getShowEquipmentData(o) {
      let category, icon;
      if (o instanceof BodyArmor) {
        category = this.langText('character field names/' + EquipmentField.TYPE_BODY_ARMOR.description) +
          '｜' + this.langText('field type text/' + o.type.description);
        icon = 'mdi-tshirt-crew';
      } else if (o instanceof AdditionalGear) {
        category = this.langText('character field names/' + EquipmentField.TYPE_ADDITIONAL.description);
        icon = 'cib-redhat';
      } else if (o instanceof SpecialGear) {
        category = this.langText('character field names/' + EquipmentField.TYPE_SPECIAL.description);
        icon = 'fa-solid:ring';
      } else {
        category = this.langText('field type text/' + o.type.description);
        icon = o instanceof MainWeapon ? 'mdi-sword' : 'mdi-shield';
      }

      return {
        origin: o,
        categoryIcon: icon,
        categoryText: category
      };
    },
    browsedEquipmentFilter(eq) {
      switch (this.browseEquipmentsWindowState.currentField.type) {
        case EquipmentField.TYPE_MAIN_WEAPON:
          return eq instanceof MainWeapon;
        case EquipmentField.TYPE_SUB_WEAPON:
          {
            const t = this.currentCharacterState.origin.fieldEquipment(EquipmentField.TYPE_MAIN_WEAPON);
            return t ? t.testSubWeapon(eq) : true;
          }
        case EquipmentField.TYPE_BODY_ARMOR:
          return eq instanceof BodyArmor;
        case EquipmentField.TYPE_ADDITIONAL:
          return eq instanceof AdditionalGear;
        case EquipmentField.TYPE_SPECIAL:
          return eq instanceof SpecialGear;
        case EquipmentField.TYPE_AVATAR:
          return eq instanceof Avatar;
      }
    },
    selectFieldEquipment(field) {
      const state = this.browseEquipmentsWindowState;
      state.action = 'select-field-equipment';
      state.currentField = field;
      this.openBrowseEquipmentsWindow();
    },
    createCharacter() {
      const c = new Character(this.langText('character') + ' ' + (this.characterStates.length + 1).toString()).init();

      this.currentCharacterStateIndex = this.characterStates.length;
      this.characterStates.push({
        origin: c
      });
    },
    selectCurrentCharacter(index) {
      this.currentCharacterStateIndex = index;
    },
    langText(s, vs) {
      return Lang(s, vs);
    },
    getLangText(s, vs) {
      return GetLang(s, vs);
    }
  },
  components: {
    'equipment-field': vue_equipmentField,
    'equipment-information': vue_equipmentInformation,
    'append-equipment-window': vue_appendEquipmentWindow
  }
};
</script>
<style lang="less" scoped>
.main {
  >section {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  >.tail {
    position: sticky;
    bottom: 0;
    background-color: var(--white);
    border-top: 1px solid var(--primary-light-2);
    margin-top: 1rem;
  }
}

.character-fields {
  display: flex;
  align-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  max-width: 41.2rem
}

.character-field {
  border: 1px solid var(--primary-light);
  padding: 0.7rem;
  margin: 0.3rem;
  width: 20rem;
  transition: 0.3s;

  >.top {
    border-bottom: 1px solid var(--primary-light);
    margin-bottom: 0.6rem;
    display: flex;
    align-items: center;

    >div {
      display: inline-block;
    }

    >.buttons {
      margin-left: auto;
    }
  }

  .field-name {
    margin-bottom: 0.2rem;
    font-size: 0.9rem;
    padding-left: 0.4rem;
  }

  >.equipment {}
}

.browse-equipment-window {
  .buttons {
    text-align: right;
  }

  .equipments-scope {
    border-top: 1px solid var(--primary-light-2);
    padding-top: 0.6rem;

    >.msg {
      padding: 0 0.6rem;
    }

    .detail {
      display: flex;
      flex-wrap: wrap;

      >div {
        border-left: 2px solid var(--primary-light-3);
        padding: 0.6rem;
      }

      >.info {
        width: 22rem;
      }

      >.preview {}
    }
  }
}

.bottom-menu {
  bottom: 0;
  padding-bottom: 1rem;
  position: sticky;
  background-color: var(--white);
  border-top: 2px solid var(--primary-light-2);

  max-height: 20rem;
  overflow-y: auto;

  >.content {
    padding: 0.6rem 0;
  }

  >.tail-buttons {
    border-top: 1px solid var(--primary-light);
    position: sticky;
    bottom: 0;
    background-color: var(--white);
    z-index: 1;
    text-align: right;
    padding: 0 0.6rem;
  }
}

.character-stat-categorys {
  >.category {
    padding: 0 0.6rem;
    margin-bottom: 1.2rem;

    >.title {
      border-bottom: 1px solid var(--primary-light);
      padding-bottom: 0.1rem;
      padding-left: 0.3rem;
      font-size: 0.9rem;
    }

    >.stats {
      >span {
        padding: 0.3rem 0.6rem;
        border-bottom: 1px solid var(--primary-light-2);
        margin: 0.3rem;
        display: inline-block;

        >.name {
          margin-right: 0.4rem;
        }

        >.value {
          color: var(--primary-light-4);
        }
      }
    }
  }
}

.warn-msg {
  padding: 0.1rem 0.4rem;
}

/* ==========================================================================
       transition group - move
       ========================================================================== */
.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-enter,
.flip-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}


/* ==========================================================================
       transition
       ========================================================================== */
.fade-enter-to,
.fade-leave {
  opacity: 1;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: 0.3s ease;
}

.slide-enter-to,
.slide-leave {
  transform: translateX(0);
  opacity: 1;
}

.slide-enter {
  transform: translateX(-50%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(50%);
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: 0.3s ease;
}
</style>