<template>
  <article>
    <search-result class="search-result" :equipments="searchResult" />
    <div class="bottom-menu">
      <div class="top-content">
        <div class="mode-options">
          <cy-transition type="fade">
            <div class="main-menu" v-if="checkMenuVisible">
              <div v-if="menuVisible.conditionOptions" class="content">
                <div v-for="type in conditions.type" :key="type.id" class="column">
                  <cy-flex-layout>
                    <cy-icon-text class="options-title" @click="toggleSelected(type)"
                      :iconify-name="'ic-round-check-box' + (type.selected ? '' : '-outline-blank')">
                      {{ $lang('equipment type category/' + type.id) }}
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
                      {{ $lang('field type text/' + item.value.description) }}
                    </cy-button>
                  </div>
                </div>
              </div>
              <div v-else-if="menuVisible.sortOptions" class="content">
                <div class="column">
                  <div class="normal-title">
                    <cy-icon-text iconify-name="mdi-sort-variant"
                      text-color="purple" text-size="small">
                      {{ $lang('sort options/title') }}
                    </cy-icon-text>
                  </div>
                  <div class="options">
                    <cy-button type="border" iconify-name="gg-shape-rhombus"
                      @click="selectSortOption('default')"
                      :selected="sortOptions.currentSelected === 'default'">
                      {{ $lang('sort options/options/default') }}
                    </cy-button>
                    <cy-button v-for="(_, id) in sortOptions.global"
                      type="border" :key="id"
                      iconify-name="gg-shape-rhombus"
                      @click="selectSortOption(id)"
                      :selected="sortOptions.currentSelected === id">
                      {{ $lang('sort options/options/' + id) }}
                    </cy-button>
                  </div>
                </div>
                <div class="column">
                  <div class="normal-title">
                    <cy-icon-text iconify-name="fluent-arrow-sort-24-filled"
                      text-color="purple" text-size="small">
                      {{ $lang('sort options/order/title') }}
                    </cy-icon-text>
                  </div>
                  <div class="options">
                    <cy-button type="border" iconify-name="akar-icons:arrow-down"
                      @click="selecetSortOrder('down')"
                      :selected="sortOptions.currentOrder === 'down'">
                      {{ $lang('sort options/order/down') }}
                    </cy-button>
                    <cy-button type="border" iconify-name="akar-icons:arrow-up"
                      @click="selecetSortOrder('up')"
                      :selected="sortOptions.currentOrder === 'up'">
                      {{ $lang('sort options/order/up') }}
                    </cy-button>
                  </div>
                </div>
              </div>
            </div>
          </cy-transition>
          <cy-transition type="fade">
            <div v-if="currentMode === 'normal' && modes.normal.optionsVisible"
              class="mode-normal-content">
              <cy-icon-text iconify-name="bx-bx-target-lock"
                text-size="small" text-color="purple">
                {{ $lang('options: normal/title') }}
              </cy-icon-text>
              <div style="padding: 0.2rem 0.4rem;">
                <cy-button v-for="item in modes.normal.targets" :key="item.value" type="border"
                  iconify-name="gg-shape-rhombus" :selected="item.selected"
                  @click="toggleSelected(item)">
                  {{ $lang('options: normal/' + item.value) }}
                </cy-button>
              </div>
            </div>
          </cy-transition>
          <div class="mode-options-container">
            <cy-options display="inline">
              <template #title>
                <span class="switch-mode-btn">
                  <cy-button type="icon" key="switch-btn"
                    iconify-name="heroicons-solid:switch-vertical"
                    icon-color="water-blue-light"
                    icon-color-hover="water-blue"
                    class="p-0" />
                </span>
              </template>
              <template #options>
                <cy-list-item v-for="(p, id) in modes" :key="id"
                  @click="selectMode(id)">
                  <cy-icon-text :iconify-name="p.icon">
                    {{ $lang('modes/' + id) }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
            </cy-options>
            <div class="mode-options">
              <template v-if="currentMode == 'normal'">
                <div class="mode-normal-title">
                  <div class="input-container">
                    <cy-icon-text iconify-name="ic-outline-search" class="icon" />
                    <input type="text" :placeholder="$lang('search placeholder')"
                      v-model="modes.normal.searchText">
                  </div>
                  <cy-button type="icon" iconify-name="heroicons-solid:menu"
                    @click="modes.normal.optionsVisible = !modes.normal.optionsVisible" />
                </div>
              </template>
              <template v-else-if="currentMode == 'stat'">
                <cy-button type="border" iconify-name="gg-shape-rhombus"
                  @click="toggleSelectStatVisible(true)">
                  {{ modes.stat.currentStat ?
                      modes.stat.currentStat.text :
                      $lang('options: stat/select stat: title') }}
                </cy-button>
              </template>
              <template v-else-if="currentMode == 'item-level'">
                <div class="mode-item-level-input-container">
                  <cy-icon-text iconify-name="jam-hammer" class="icon" />
                  <input type="text" placeholder="0"
                    v-model="itemLevelMinimum">
                  <cy-icon-text iconify-name="mdi-tilde" />
                  <input type="text" placeholder="300"
                    v-model="itemLevelMaximum">
                </div>
              </template>
              <template v-else-if="currentMode == 'dye'">
                <div class="mode-dye-title">
                  <div class="input-container">
                    <cy-icon-text iconify-name="ic-outline-palette" class="icon" />
                    <input type="text" :placeholder="$lang('search placeholder')"
                      v-model="modes.dye.searchText">
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div>
          <div class="menu-btn switch-display"
            v-if="currentMode !== 'normal' && currentMode !== 'dye'"
            @click="switchDisplay">
            <cy-icon-text iconify-name="heroicons-solid:switch-vertical" />
          </div>
          <div class="menu-btn select-sort" @click="toggleMenuVisible('sortOptions')">
            <cy-icon-text iconify-name="mdi-sort-variant" />
          </div>
          <div class="menu-btn" @click="toggleMenuVisible('conditionOptions')">
            <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle" />
          </div>
        </div>
      </div>
    </div>
    <cy-window :visible="modes.stat.selectStatVisible"
        vertical-position="top"
        @close-window="toggleSelectStatVisible(false)">
        <template v-slot:title>
          <cy-icon-text iconify-name="mdi-rhombus-outline">
            {{ $lang('options: stat/select stat: window title') }}
          </cy-icon-text>
        </template>
        <template v-slot:default>
          <cy-title-input iconify-name="ic-outline-category"
            v-model:value="modes.stat.statSearchText"
            :placeholder="$lang('options: stat/select stat: search placeholder')" />
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
            {{ $lang('no result tips') }}
          </cy-default-tips>
        </template>
      </cy-window>
  </article>
</template>
<script>
import init from "./init.js";

import vue_searchResult from "./search-result.vue";

import { CharacterEquipment, MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear } from "@lib/Character/CharacterEquipment";
import { StatBase } from "@lib/Character/Stat";

export default {
  RegisterLang: 'Item Query',
  data() {
    const equipments = this.$store.state.datas.items.equipments
      .map(p => CharacterEquipment.fromOriginEquipment(p, { statValueToNumber: false }));

    const handleOptions = opts => opts.map(p => {
      return {
        value: p, selected: true
      };
    });

    const stats = [], statTypes = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    this.$store.state.datas.character.statList.forEach(stat => {
      if (stat.attributes.hidden) return;
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

    const handleCompareValue = v => /^\d+$/.test(v) ? parseFloat(v) : -99999;

    return {
      state: {
        currentMode: 'normal',
        displayMode: 0
      },
      menuVisible: {
        conditionOptions: false,
        sortOptions: false,
      },
      searchResultMaximum: 50,
      modes: {
        'normal': {
          icon: 'ic-round-menu-book',
          targets: handleOptions(['name', 'material', 'obtain-name']),
          optionsVisible: false,
          searchText: ''
        },
        'stat': {
          icon: 'mdi-script-outline',
          stats,
          statSearchText: '',
          selectStatVisible: false,
          currentStat: null
        },
        'item-level': {
          icon: 'jam-hammer',
          min: '0',
          max: '300'
        },
        dye: {
          icon: 'ic-outline-palette',
          searchText: ''
        }
      },
      equipments,
      sortOptions: {
        currentSelected: 'default',
        currentOrder: 'down',
        global: {
          'atk': (a, b) => {
            const av = a.is === 'weapon' ? a.atk + 9999 : a.def,
              bv = b.is === 'weapon' ? b.atk + 9999 : b.def;
            return av - bv;
          },
          'def': (a, b) => {
            const av = a.is === 'armor' ? a.def + 9999 : b.atk,
              bv = b.is === 'armor' ? b.def + 9999 : b.atk;
            return av - bv;
          },
          'stability': (a, b) => {
            const av = a.is === 'weapon' ? a.stability : -1,
              bv = b.is === 'weapon' ? b.stability : -1;
            if (av === -1 && bv === -1)
              return this.sortOptions[this.currentMode].default(a, b);
            return av - bv;
          },
          'name':  (a, b) => a.name.localeCompare(b.name)
        },
        'normal': {
          default: (a, b) => a.origin.id - b.origin.id
        },
        'stat': {
          default: (a, b) => {
            const cs = this.modes.stat.currentStat;
            const av = handleCompareValue(this.findStat(cs, a.stats).statValue()),
              bv = handleCompareValue(this.findStat(cs, b.stats).statValue());
            return av - bv;
          }
        },
        'item-level': {
          default: (a, b) => {
            const av = handleCompareValue(a.origin.recipe['item_level']),
              bv = handleCompareValue(b.origin.recipe['item_level']);
            return av - bv;
          }
        },
        'dye': {
          default: (a, b) => a.origin.id - b.origin.id
        }
      },
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
      'findStat': this.findStat,
      'modesState': this.modes,
      'state': this.state,
      'findObtainByDye': this.findObtainByDye
    };
  },
  computed: {
    itemLevelMaximum: {
      get() {
        return this.modes['item-level'].max;
      },
      set(v) {
        v = parseInt(v, 10);
        this.modes['item-level'].max = Math.max(Math.min(500, v), 0);
        console.log(this.modes['item-level'].max);
      }
    },
    itemLevelMinimum: {
      get() {
        return this.modes['item-level'].min;
      },
      set(v) {
        v = parseInt(v, 10);
        this.modes['item-level'].min = Math.max(Math.min(500, v), 0);
      }
    },
    checkMenuVisible() {
      return Object.values(this.menuVisible).find(p => p);
    },
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
      let sr = this.allSearchResult;
      const mode = this.currentMode,
        target = this.sortOptions.currentSelected;
      sr.sort(target === 'default' ? this.sortOptions[mode].default : this.sortOptions.global[target]);
      
      // because array.sort is in-place, give a new array to ensure data reactive
      sr = this.sortOptions.currentOrder === 'down' ? sr.reverse() : sr.slice();
      
      return sr.length > this.searchResultMaximum ? sr.slice(0, this.searchResultMaximum) : sr;
    },
    allSearchResult() {
      if (this.currentMode === 'normal') {
        const searchText = this.modes.normal.searchText;
        if (searchText === '')
          return this.validEquipments;
        const targets = this.modes.normal.targets
          .filter(p => p.selected)
          .map(p => p.value);
        return this.validEquipments
          .filter(p => {
            const eq = p.origin;
            return targets.find(q => {
              if (q === 'name')
                return eq.name.toLowerCase().includes(searchText);
              else if (q === 'material')
                return eq.recipe && eq.recipe['materials'] &&
                  eq.recipe['materials'].find(c => c.name.toLowerCase().includes(searchText));
              else if (q === 'obtain-name')
                return eq.obtains.find(b => b['name'] && b['name'].toLowerCase().includes(searchText));
            });
          });
      }
      else if (this.currentMode === 'stat') {
        const searchStat = this.modes.stat.currentStat;
        if (!searchStat) return [];

        return this.validEquipments.filter(p => this.findStat(searchStat, p.stats));
      }
      else if (this.currentMode === 'item-level') {
        const min = this.modes['item-level'].min || 0,
          max = this.modes['item-level'].max || 999;

        return this.validEquipments.filter(p => {
          if (!p.origin.recipe) return false;
          const v = parseInt(p.origin.recipe['item_level'], 10);
          if (Number.isNaN(v)) return;
          return v >= min && v <= max;
        });
      }
      else if (this.currentMode === 'dye') {
        const searchText = this.modes.dye.searchText;
        if (searchText === '')
          return [];
        return this.validEquipments.filter(p => this.findObtainByDye(searchText, p).length > 0);
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
    findObtainByDye(text, eq) {
      text = text.toLowerCase();
      return eq.origin.obtains.filter(b => b['dye'] && b['dye'].toLowerCase().includes(text));
    },
    selecetSortOrder(id) {
      this.sortOptions.currentOrder = id;
    },
    selectSortOption(id) {
      this.sortOptions.currentSelected = id;
    },
    toggleMenuVisible(id) {
      const o = this.menuVisible;
      Object.entries(o).forEach(([key]) => o[key] = key === id ? !o[key] : false);
    },
    findStat(target, stats) {
      return stats.find(stat => stat.baseName() === target.origin.baseName &&
        stat.type === target.type);
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
}

.main-menu {
  // position: absolute;
  // right: 0;
  // bottom: 0;
  border: 0.1rem solid var(--primary-light);
  border-radius: 0.6rem;
  padding: 1rem 1.4rem;
  padding-bottom: 2rem;
  background-color: var(--white);
  max-height: 70vh;
  overflow-y: auto;

  > .content {
    > .column {
      .options-title {
        margin-right: 1rem;
        cursor: pointer;
      }
      > .normal-title {
        margin-bottom: 0.3rem;
      }
      & + .column {
        margin-top: 0.8rem;
      }
      > .options {
        padding: 0 0.6rem;
      }
    }
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
  margin: 0.8rem;
  margin-top: 0;
  flex-shrink: 0;
  z-index: 11;

  &.select-sort {
    border-color: var(--primary-water-blue);
    ::v-deep(svg) {
      --icon-color: var(--primary-water-blue);
    }
  }

  &.switch-display {
    background-color: var(--white);
    border-color: var(--primary-orange);
  }

  &:hover {
    background-color: rgba(var(--rgb-primary-light), 0.6);
    border-color: var(--primary-light-3);
  }
}

.mode-options {
  width: 100%;

  > .mode-options-container {
    margin-bottom: 0.8rem;
    margin-top: 0.8rem;
    border-radius: 1.4rem;
    border: 0.1rem solid var(--primary-light);
    display: grid;
    grid-template-columns: 3rem auto;
    align-items: center;
    background-color: var(--white);
  }
}

.mode-normal-title, .mode-dye-title {
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
  border-radius: 0.8rem;
  border: 0.1rem solid var(--primary-light);
  padding: 0.6rem 1rem;
  background-color: var(--white);
  margin-top: 0.8rem;
}

.mode-item-level-input-container {
  display: flex;
  align-items: center;
  > .icon {
    margin-right: 0.4rem;
  }
  > input {
    border: 0;
    padding: 0.2rem;
    display: inline-block;
    width: 3.5rem;
    text-align: center;
  }
}

.switch-mode-btn {
  padding: 0.3rem;
  display: inline-block;
}
</style>