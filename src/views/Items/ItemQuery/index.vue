<template>
  <article class="flex flex-col">
    <div>
      <ItemQueryResult class="search-result" :equipments="searchResult" />
    </div>
    <div
      class="flex items-end ml-auto sticky z-10 px-2"
      style="bottom: 4.5rem"
    >
      <cy-transition type="fade">
        <div v-if="checkMenuVisible" class="main-menu">
          <div v-if="menuVisible.conditionOptions" class="content">
            <div v-for="type in conditions.type" :key="type.id" class="column">
              <div class="flex items-center">
                <cy-button-check
                  v-model:selected="type.selected"
                  class="options-title"
                  main-color="orange"
                >
                  {{ $rootLang('common/Equipment/field/' + type.id) }}
                </cy-button-check>
                <template v-if="type.types !== null">
                  <cy-button-border icon="ic-round-border-all" @click="selectAll(type.types)" />
                  <cy-button-border icon="eva-close-outline" @click="cancelAll(type.types)" />
                </template>
              </div>
              <div v-if="type.types !== null" class="options">
                <cy-button-check
                  v-for="item in type.types"
                  :key="item.value"
                  :selected="type.selected && item.selected"
                  :selected-icon="item.imagePath"
                  selected-icon-src="image"
                  @click="toggleSelected(item)"
                >
                  {{ $rootLang('common/Equipment/category/' + item.value.description) }}
                </cy-button-check>
              </div>
            </div>
          </div>
          <div v-else-if="menuVisible.sortOptions" class="content">
            <div class="column">
              <div class="normal-title">
                <cy-icon-text icon="mdi-sort-variant" text-color="purple" size="small">
                  {{ $lang('sort options/title') }}
                </cy-icon-text>
              </div>
              <cy-button-check-group
                v-model:value="sortOptions.currentSelected"
                class="options"
                :options="consts.sortOptions"
              />
            </div>
            <div class="column">
              <div class="normal-title">
                <cy-icon-text
                  icon="fluent-arrow-sort-24-filled"
                  text-color="purple"
                  size="small"
                >
                  {{ $lang('sort options/order/title') }}
                </cy-icon-text>
              </div>
              <cy-button-check-group
                v-model:value="sortOptions.currentOrder"
                class="options"
                :options="consts.sortOrderOptions"
              />
            </div>
          </div>
        </div>
      </cy-transition>
      <div class="flex-shrink-0 ml-2">
        <div
          v-if="currentMode !== 'normal' && currentMode !== 'dye'"
          class="menu-btn switch-display"
          @click="switchDisplay"
        >
          <cy-icon-text icon="heroicons-solid:switch-vertical" />
        </div>
        <div
          class="menu-btn bg-white border-water-blue"
          @click="toggleMenuVisible('sortOptions')"
        >
          <cy-icon-text icon="mdi-sort-variant" icon-color="water-blue" />
        </div>
        <div
          class="menu-btn bg-white border-light-4"
          @click="toggleMenuVisible('conditionOptions')"
        >
          <cy-icon-text icon="mdi-checkbox-multiple-blank-circle" icon-color="light-4" />
        </div>
      </div>
    </div>
    <div class="bottom-menu">
      <div class="top-content">
        <cy-options inline>
          <template #title>
            <div
              class="bg-white flex-shrink-0 rounded-full border-1 border-water-blue-light hover:border-water-blue inline-flex items-center justify-center mr-2 mb-2 cursor-pointer"
              style="width: 2.8rem; height: 2.8rem;"
            >
              <cy-icon-text
                icon="heroicons-solid:switch-vertical"
                icon-color="water-blue-light"
                icon-color-hover="water-blue"
              />
            </div>
          </template>
          <template #options>
            <cy-list-item
              v-for="(p, id) in modes"
              :key="id"
              @click="selectMode(id)"
            >
              <cy-icon-text :icon="p.icon">
                {{ $lang('modes/' + id) }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-options>
        <div class="w-full">
          <cy-transition type="fade">
            <div
              v-if="currentMode === 'normal' && modes.normal.optionsVisible"
              class="mode-normal-content"
            >
              <cy-icon-text
                icon="bx-bx-target-lock"
                size="small"
                text-color="purple"
              >
                {{ $lang('options: normal/title') }}
              </cy-icon-text>
              <div style="padding: 0.2rem 0.4rem;">
                <cy-button-check
                  v-for="item in modes.normal.targets"
                  :key="item.value"
                  v-model:selected="item.selected"
                >
                  {{ $lang('options: normal/' + item.value) }}
                </cy-button-check>
              </div>
            </div>
          </cy-transition>
          <div class="flex items-center">
            <div class="mode-options-container w-full">
              <template v-if="currentMode === 'normal'">
                <div class="mode-normal-title ml-2">
                  <div class="input-container">
                    <cy-icon-text icon="ic-outline-search" class="icon" />
                    <input
                      v-model="modes.normal.searchText"
                      type="text"
                      :placeholder="$lang('search placeholder')"
                    >
                  </div>
                  <cy-button-icon
                    icon="heroicons-solid:menu"
                    @click="modes.normal.optionsVisible = !modes.normal.optionsVisible"
                  />
                </div>
              </template>
              <template v-else-if="currentMode === 'stat'">
                <cy-button-inline
                  class="w-full"
                  @click="toggleSelectStatVisible(true)"
                >
                  {{ modes.stat.currentStat ? modes.stat.currentStat.text : $lang('options: stat/select stat: title') }}
                </cy-button-inline>
              </template>
              <template v-else-if="currentMode === 'item-level'">
                <div class="flex items-center">
                  <cy-icon-text icon="jam-hammer" class="ml-2" />
                  <input
                    v-model="itemLevelMinimum"
                    type="text"
                    placeholder="0"
                    class="border-0 p-1 inline-block w-14 text-center"
                  >
                  <cy-icon-text icon="mdi-tilde" />
                  <input
                    v-model="itemLevelMaximum"
                    type="text"
                    placeholder="300"
                    class="border-0 p-1 inline-block w-14 text-center"
                  >
                </div>
              </template>
              <template v-else-if="currentMode === 'dye'">
                <div class="mode-dye-title">
                  <div class="input-container">
                    <cy-icon-text icon="ic-outline-palette" class="ml-2" />
                    <input
                      v-model="modes.dye.searchText"
                      type="text"
                      :placeholder="$lang('search placeholder')"
                    >
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <cy-window v-model:visible="modes.stat.selectStatVisible" vertical-position="top">
      <template #title>
        <cy-icon-text icon="mdi-rhombus-outline">
          {{ $lang('options: stat/select stat: window title') }}
        </cy-icon-text>
      </template>
      <template #default>
        <cy-title-input
          v-model:value="modes.stat.statSearchText"
          icon="ic-outline-category"
          :placeholder="$lang('options: stat/select stat: search placeholder')"
        />
        <template v-if="statsSearchResult.length != 0">
          <cy-list-item
            v-for="stat in statsSearchResult"
            :key="`${stat.origin.baseName}-${stat.type.description}`"
            :selected="stat == modes.stat.currentStat"
            @click="selectStat(stat)"
          >
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ stat.text }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <cy-default-tips v-else icon="bx-bx-message-rounded-x">
          {{ $lang('no result tips') }}
        </cy-default-tips>
      </template>
    </cy-window>
  </article>
</template>
<script>
import init from "./init.js";

import vue_ItemQueryResult from "./item-query-result";

import {
  CharacterEquipment,
  MainWeapon, SubWeapon,
  SubArmor, BodyArmor,
  AdditionalGear, SpecialGear, Avatar } from "@/lib/Character/CharacterEquipment";
import { StatBase } from "@/lib/Character/Stat";

export default {
  name: 'ItemQuery',
  RegisterLang: 'Item Query',
  components: {
    ItemQueryResult: vue_ItemQueryResult,
  },
  provide() {
    return {
      'findStat': this.findStat,
      'modesState': this.modes,
      'state': this.state,
      'findObtainByDye': this.findObtainByDye,
    };
  },
  data() {
    const equipments = this.$store.state.datas.items.equipments
      .map(p => CharacterEquipment.fromOriginEquipment(p, { statValueToNumber: false }));

    const handleOptions = opts => opts.map(p => {
      return {
        value: p, selected: true,
      };
    });
    const handleEquipmentTypes = (category, opts) => {
      opts = handleOptions(opts);
      opts.forEach(opt => {
        opt.imagePath = CharacterEquipment.getImagePath(category, opt.value);
      });
      return opts;
    };

    const stats = [], statTypes = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    this.$store.state.datas.character.statList.forEach(stat => {
      if (stat.attributes.hidden) return;
      statTypes.forEach(type => {
        if (type === StatBase.TYPE_MULTIPLIER && !stat.hasMultiplier)
          return;
        stats.push({
          origin: stat,
          text: stat.title(type),
          type,
        });
      })
    });

    const handleCompareValue = v => /^-?\d+$/.test(v) ? parseFloat(v) : -99999;

    return {
      state: {
        currentMode: 'normal',
        displayMode: 0,
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
          searchText: '',
        },
        'stat': {
          icon: 'mdi-script-outline',
          stats,
          statSearchText: '',
          selectStatVisible: false,
          currentStat: null,
        },
        'item-level': {
          icon: 'jam-hammer',
          min: '0',
          max: '300',
        },
        dye: {
          icon: 'ic-outline-palette',
          searchText: '',
        },
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
          'name':  (a, b) => a.name.localeCompare(b.name),
        },
        'normal': {
          default: (a, b) => a.origin.id - b.origin.id,
        },
        'stat': {
          default: (a, b) => {
            const cs = this.modes.stat.currentStat;
            const av = handleCompareValue(this.findStat(cs, a.stats).value),
              bv = handleCompareValue(this.findStat(cs, b.stats).value);
            return av - bv;
          },
        },
        'item-level': {
          default: (a, b) => {
            const av = handleCompareValue(a.origin.recipe['item_level']),
              bv = handleCompareValue(b.origin.recipe['item_level']);
            return av - bv;
          },
        },
        'dye': {
          default: (a, b) => a.origin.id - b.origin.id,
        },
      },
      conditions: {
        type: [{
          id: 'main-weapon',
          instance: MainWeapon,
          types: handleEquipmentTypes('main-weapon', [
            MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
            MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
            MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
            MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
            MainWeapon.TYPE_KATANA,
          ]),
          selected: true,
        }, {
          id: 'sub-weapon',
          instance: [SubWeapon, SubArmor],
          types: [
            ...handleEquipmentTypes('sub-weapon', [
              SubWeapon.TYPE_ARROW,
              SubWeapon.TYPE_DAGGER,
              SubWeapon.TYPE_NINJUTSU_SCROLL,
            ]),
            ...handleEquipmentTypes('sub-armor', [
              SubArmor.TYPE_SHIELD,
            ]),
          ],
          selected: true,
        }, {
          id: 'body-armor',
          instance: BodyArmor,
          types: null,
          selected: true,
        }, {
          id: 'additional',
          instance: AdditionalGear,
          types: null,
          selected: true,
        }, {
          id: 'special',
          instance: SpecialGear,
          types: null,
          selected: true,
        }],
        obtain: ['smith', 'boss', 'mini_boss', 'mobs', 'quest', 'box', 'exchange', 'other'],
      },
      consts: {
        sortOrderOptions: ['down', 'up'].map(id => ({
          value: id,
          text: this.$lang('sort options/order/' + id),
        })),
        sortOptions: ['default', 'atk', 'def', 'stability', 'name'].map(id => ({
          value: id,
          text: this.$lang('sort options/options/' + id),
        })),
      },
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
      },
    },
    itemLevelMinimum: {
      get() {
        return this.modes['item-level'].min;
      },
      set(v) {
        v = parseInt(v, 10);
        this.modes['item-level'].min = Math.max(Math.min(500, v), 0);
      },
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
      },
    },
    displayMode: {
      get() {
        return this.state.displayMode;
      },
      set(v) {
        this.state.displayMode = v;
      },
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
        const searchText = this.modes.normal.searchText.toLowerCase();
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
      const validTypes = this.conditions.type.filter(type => type.selected);
      if (validTypes.length === 0) {
        validTypes.push({
          id: 'avatar',
          instance: Avatar,
          types: null,
          selected: true,
        });
      }
      return this.equipments.filter(p => {
        const checkType = validTypes.find(type => {
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
    },
  },
  beforeCreate() {
    init();
  },
  methods: {
    findObtainByDye(text, eq) {
      text = text.toLowerCase();
      return eq.origin.obtains.filter(b => b['dye'] && b['dye'].toLowerCase().includes(text));
    },
    selectSortOption(id) {
      this.sortOptions.currentSelected = id;
    },
    toggleMenuVisible(id) {
      const o = this.menuVisible;
      Object.entries(o).forEach(([key]) => o[key] = key === id ? !o[key] : false);
    },
    findStat(target, stats) {
      return stats.find(stat => stat.baseName === target.origin.baseName &&
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
      force = force !== undefined ? !this.modes.stat.selectStatVisible : force;
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
  },
};
</script>
<style lang="postcss" scoped>
.search-result {
  min-height: 70vh;
}

.bottom-menu {
  position: sticky;
  bottom: 0.8rem;
  padding: 0 0.6rem;
  z-index: 10;

  & > .top-content {
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
  border-radius: 0.5rem;
  padding: 1rem 1.4rem;
  padding-bottom: 2rem;
  background-color: var(--white);
  max-height: 70vh;
  overflow-y: auto;

  & > .content {
    & > .column {
      & .options-title {
        margin-right: 1rem;
        cursor: pointer;
      }
      & > .normal-title {
        margin-bottom: 0.3rem;
      }
      & + .column {
        margin-top: 0.8rem;
      }
      & > .options {
        padding: 0 0.6rem;
      }
    }
  }
}

.menu-btn {
  width: 3rem;
  height: 3rem;
  // background-color: rgba(var(--rgb-primary-light), 0.3);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  flex-shrink: 0;
  z-index: 11;

  @apply border-1 opacity-70 duration-300;

  &.switch-display {
    background-color: var(--white);
    border-color: var(--primary-orange);
  }

  &:hover {
    opacity: 1;
  }
}

.mode-options-container {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 1.4rem;
  padding: 0.25rem 0.5rem;
  border: 0.1rem solid var(--primary-light);
  display: flex;
  align-items: center;
  background-color: var(--white);
  height: 2.7rem;
}

.mode-normal-title, .mode-dye-title {
  display: flex;
  align-items: center;
  width: 100%;

  & .input-container {
    display: flex;
    align-items: center;
    width: 100%;

    & > input {
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
</style>
