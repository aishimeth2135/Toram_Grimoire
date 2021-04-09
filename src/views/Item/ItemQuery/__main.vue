<template>
  <article>
    <search-result class="search-result" :equipments="searchResult" />
    <div class="bottom-menu">
      <div class="top-content">
        <div class="mode-options">
          <cy-transition type="fade">
            <div class="mode-normal-content" v-if="modes.normal.optionsVisible">
              <cy-icon-text iconify-name="bx-bx-target-lock"
                text-size="small" text-color="purple">
                {{ langText('options: normal/title') }}
              </cy-icon-text>
              <div style="padding: 0.2rem 0.4rem;">
                <cy-button v-for="item in modes.normal.targets" :key="item.value" type="border"
                  iconify-name="gg-shape-rhombus" :selected="item.selected"
                  @click="toggleSelected(item)">
                  {{ langText('options: normal/' + item.value) }}
                </cy-button>
              </div>
            </div>
          </cy-transition>
          <div class="mode-options-container">
            <cy-options display="inline">
              <template #title>
                <span class="switch-mode-btn">
                  <cy-button type="icon-only" iconify-name="heroicons-solid:switch-vertical"
                    key="switch-btn" icon-color="water-blue-light" icon-color-hover="water-blue"
                    class="inline" />
                </span>
              </template>
              <template #options>
                <cy-list-item v-for="(p, id) in modes" :key="id"
                  @click="selectMode(id)">
                  <cy-icon-text :iconify-name="p.icon">
                    {{ langText('modes/' + id) }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
            </cy-options>
            <div class="mode-options">
              <template v-if="currentMode == 'normal'">
                <div class="mode-normal-title">
                  <div class="input-container">
                    <cy-icon-text iconify-name="ic-outline-search" class="icon" />
                    <input type="text" :placeholder="langText('search placeholder')"
                      v-model="modes.normal.searchText">
                  </div>
                  <cy-button type="icon-only" iconify-name="heroicons-solid:menu"
                    @click="modes.normal.optionsVisible = !modes.normal.optionsVisible" />
                </div>
              </template>
              <template v-if="currentMode == 'stat'">
                <cy-button type="border" iconify-name="gg-shape-rhombus"
                  @click="toggleSelectStatVisible(true)">
                  {{ modes.stat.currentStat ?
                      modes.stat.currentStat.text :
                      langText('options: stat/select stat: title') }}
                </cy-button>
              </template>
            </div>
          </div>
        </div>
        <div>
          <div class="menu-btn switch-display" v-if="currentMode !== 'normal'" @click="switchDisplay">
            <cy-icon-text iconify-name="heroicons-solid:switch-vertical" />
          </div>
          <div class="menu-btn" @click="menuVisible = !menuVisible">
            <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle" />
          </div>
        </div>
      </div>
      <cy-transition type="fade">
        <div class="condition-window" v-if="menuVisible">
          <div class="condtion-type">
            <div v-for="type in conditions.type" :key="type.id" class="column">
              <cy-flex-layout>
                <cy-icon-text class="options-title" @click="toggleSelected(type)"
                  :iconify-name="'ic-round-check-box' + (type.selected ? '' : '-outline-blank')">
                  {{ langText('equipment type category/' + type.id) }}
                </cy-icon-text>
                <template v-if="type.types !== null">
                  <cy-button iconify-name="ic-round-border-all" type="border"
                    @click="selectAll(type.types)" />
                  <cy-button iconify-name="eva-close-outline" type="border"
                    @click="cancelAll(type.types)" />
                </template>
              </cy-flex-layout>
              <div v-if="type.types !== null" class="options">
                <cy-button v-for="item in type.types" :key="item.value" type="border"
                  iconify-name="gg-shape-rhombus" :selected="type.selected && item.selected"
                  @click="toggleSelected(item)">
                  {{ langText('field type text/' + item.value.description) }}
                </cy-button>
              </div>
            </div>
          </div>
        </div>
      </cy-transition>
    </div>
    <cy-window :visible="modes.stat.selectStatVisible"
        vertical-position="top"
        @close-window="toggleSelectStatVisible(false)">
        <template v-slot:title>
          <cy-icon-text iconify-name="mdi-rhombus-outline">
            {{ langText('options: stat/select stat: window title') }}
          </cy-icon-text>
        </template>
        <template v-slot:default>
          <cy-title-input iconify-name="ic-outline-category" class="search-stat-input">
            <input type="text" v-model="modes.stat.statSearchText"
              :placeholder="langText('options: stat/select stat: search placeholder')" />
          </cy-title-input>
          <template v-if="statsSearchResult.length != 0">
            <cy-list-item v-for="stat in statsSearchResult"
              :key="`${stat.origin.baseName}-${stat.type.description}`"
              :selected="stat == modes.stat.currentStat"
              @click="selectStat(stat)">
              <cy-icon-text iconify-name="mdi-rhombus-outline">
                {{ stat.text }}
              </cy-icon-text>
            </cy-list-item>
          </template>
          <cy-default-tips v-else iconify-name="bx-bx-message-rounded-x">
            {{ langText('no result tips') }}
          </cy-default-tips>
        </template>
      </cy-window>
  </article>
</template>
<script>
import GetLang from "@Service/Language";

import init from "./init.js";

import vue_searchResult from "./search-result.vue";

import { CharacterEquipment, MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

import StatBase from "@lib/CharacterSystem/module/StatBase.js";

export default {
  data() {
    const equipments = this.$store.state.datas.items.equipments
      .map(p => CharacterEquipment.fromOriginEquipment(p));

    const handleOptions = opts => opts.map(p => {
      return {
        value: p, selected: true
      };
    });

    const stats = [], statTypes = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    this.$store.state.datas.character.statList.forEach(stat => {
      statTypes.forEach(type => {
        if (type == StatBase.TYPE_MULTIPLIER && !stat.hasMultiplier)
          return;
        stats.push({
          origin: stat,
          text: stat.title(type),
          type
        });
      })
    });

    return {
      state: {
        currentMode: 'normal',
        displayMode: 0
      },
      menuVisible: false,
      searchResultMaximum: 30,
      modes: {
        normal: {
          icon: 'ic-round-menu-book',
          targets: handleOptions(['name', 'material', 'obtain-name']),
          optionsVisible: false,
          searchText: ''
        },
        stat: {
          icon: 'ic-round-menu-book',
          stats,
          statSearchText: '',
          selectStatVisible: false,
          currentStat: null
        }
      },
      equipments,
      conditions: {
        type: [{
          id: 'main',
          instance: MainWeapon,
          types: handleOptions([
            MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
            MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
            MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
            MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
            MainWeapon.TYPE_KATANA
          ]),
          selected: true
        }, {
          id: 'sub',
          instance: [SubWeapon, SubArmor],
          types: handleOptions([SubWeapon.TYPE_ARROW, SubArmor.TYPE_SHIELD, SubWeapon.TYPE_DAGGER]),
          selected: true
        }, {
          id: 'body',
          instance: BodyArmor,
          types: null,
          selected: true
        }, {
          id: 'additional',
          instance: AdditionalGear,
          types: null,
          selected: true
        }, {
          id: 'special',
          instance: SpecialGear,
          types: null,
          selected: true
        }],
        obtain: ['smith', 'boss', 'mini_boss', 'mobs', 'quest', 'box', 'exchange', 'other']
      }
    };
  },
  provide() {
    return {
      'langText': this.langText,
      'findStat': this.findStat,
      'modesState': this.modes,
      'state': this.state
    };
  },
  computed: {
    currentMode: {
      get() {
        return this.state.currentMode;
      },
      set(v) {
        this.state.currentMode = v;
      }
    },
    displayMode: {
      get() {
        return this.state.displayMode;
      },
      set(v) {
        this.state.displayMode = v;
      }
    },
    statsSearchResult() {
      const searchText = this.modes.stat.statSearchText.toLowerCase();
      return this.modes.stat.stats.filter(stat => stat.text.toLowerCase().includes(searchText));
    },
    searchResult() {
      if (this.currentMode === 'normal') {
        const searchText = this.modes.normal.searchText;
        if (searchText === '') return [];
        const targets = this.modes.normal.targets
          .filter(p => p.selected)
          .map(p => p.value);
        const res = [];
        this.validEquipments
          .find(p => {
            const eq = p.origin;
            const check = targets.find(q => {
              if (q === 'name')
                return eq.name.toLowerCase().includes(searchText);
              else if (q === 'material')
                return eq.recipe && eq.recipe['materials'] &&
                  eq.recipe['materials'].find(c => c.name.toLowerCase().includes(searchText));
              else if (q === 'obtain-name')
                return eq.obtains.find(b => b['name'] && b['name'].toLowerCase().includes(searchText));
            });
            check && res.push(p);
            return res.length >= this.searchResultMaximum;
          });
        return res;
      }
      else if (this.currentMode === 'stat') {
        const searchStat = this.modes.stat.currentStat;
        if (!searchStat) return [];

        const res = [];
        this.validEquipments.find(p => {
          this.findStat(searchStat, p.stats) && res.push(p);
          return res.length >= this.searchResultMaximum;
        });
        return res;
      }
      return [];
    },
    validEquipments() {
      return this.equipments.filter(p => {
        const checkType = this.conditions.type
          .filter(type => type.selected)
          .find(type => {
            const checkInstance = !Array.isArray(type.instance) ?
              p instanceof type.instance :
              type.instance.find(a => p instanceof a);
            if (checkInstance) {
              if (type.types === null)
                return true;
              const t = type.types.find(a => p.type === a.value);
              return t && t.selected;
            }
            return false;
          });
        const checkObtain = this.conditions.obtain
          .filter(type => type.selected)
          .find(obtain => p.origin.obtains.find(a => a == obtain.value));
        return checkType || checkObtain;
      });
    }
  },
  methods: {
    findStat(target, stats) {
      return stats.find(stat => stat.baseName() == target.origin.baseName &&
        stat.type == target.type);
    },
    switchDisplay() {
      this.displayMode = this.displayMode == 0 ? 1 : 0;
    },
    selectStat(stat) {
      this.modes.stat.currentStat = stat;
      this.toggleSelectStatVisible(false);
    },
    toggleSelectStatVisible(force) {
      force = force !== void 0 ? !this.modes.stat.selectStatVisible : force;
      this.modes.stat.selectStatVisible = force;
    },
    selectMode(id) {
      this.currentMode = id;
      this.displayMode = 0;
    },
    toggleSelected(target) {
      target.selected = !target.selected;
    },
    selectAll(list) {
      list.forEach(p => p.selected = true);
    },
    cancelAll(list) {
      list.forEach(p => p.selected = false);
    },
    langText(v, vs) {
      return GetLang('Item Query/' + v, vs);
    }
  },
  beforeCreate() {
    init();
  },
  components: {
    'search-result': vue_searchResult
  }
};
</script>
<style lang="less" scoped>
.search-result {
  min-height: 70vh;
}

.condtion-type {
  > .column {
    .options-title {
      margin-right: 1rem;
      cursor: pointer;
    }
    & + .column {
      margin-top: 0.8rem;
    }
    > .options {
      padding: 0 0.6rem;
    }
  }
}

.bottom-menu {
  position: sticky;
  bottom: 0.8rem;
  padding: 0 0.6rem;
  z-index: 10;

  > .top-content {
    display: flex;
    align-items: flex-end;
    width: 100%;
  }

  > .condition-window {
    position: absolute;
    right: 0;
    bottom: 0;
    border: 0.1rem solid var(--primary-light);
    border-radius: 0.4rem;
    padding: 1rem 1.4rem;
    padding-bottom: 2rem;
    background-color: var(--white);
    max-height: 80vh;
    overflow-y: auto;
  }
}

.menu-btn {
  width: 3rem;
  height: 3rem;
  background-color: rgba(var(--rgb-primary-light), 0.3);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
  border: 0.1rem solid var(--primary-light-2);
  margin: 1rem;
  margin-top: 0;
  z-index: 5;
  flex-shrink: 0;

  &.switch-display {
    background-color: var(--white);
  }

  &:hover {
    background-color: rgba(var(--rgb-primary-light), 0.6);
    border-color: var(--primary-light-3);
  }
}

.mode-options {
  width: 100%;

  > .mode-options-container {
    margin-bottom: 1rem;
    margin-top: 0.8rem;
    border-radius: 1.4rem;
    border: 0.1rem solid var(--primary-light);
    display: grid;
    grid-template-columns: 3rem auto;
    align-items: center;
    background-color: var(--white);
  }
}

.mode-normal-title {
  display: grid;
  grid-template-columns: auto 3rem;

  .input-container {
    display: flex;
    align-items: center;

    > input {
      border: 0;
      padding: 0.2rem;
      margin-left: 0.4rem;
      display: inline-block;
      width: 100%;
    }
  }
}

.mode-normal-content {
  border-radius: 1rem;
  border: 0.1rem solid var(--primary-light);
  padding: 0.6rem 1rem;
  background-color: var(--white);
}

.switch-mode-btn {
  padding: 0.3rem;
  display: inline-block;
}
</style>