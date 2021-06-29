<template>
  <article>
    <div>
      <fieldset class="mb-4 p-4 border-1 border-solid border-light-2">
        <legend class="px-2">
          <cy-button v-for="(mode, i) in modeState.modes"
            :key="mode.id"
            :icon="mode.icon"
            :selected="i === modeState.currentModeIndex"
            @click="selectMode(i)"
            type="border">
            {{ $lang('search mode/' + mode.id) }}
          </cy-button>
        </legend>
        <div v-show="currentMode === 'normal'">
          <div class="mb-1 text-purple">
            <cy-icon-text icon="ic-outline-search" class="text-small">
              {{ $lang('search title') }}
            </cy-icon-text>
          </div>
          <cy-title-input icon="ic-outline-category"
            v-model:value="modeState['mode-normal'].searchText"
            :placeholder="$lang('search placeholder')" />
        </div>
        <div v-show="currentMode === 'stats'">
          <cy-button icon="mdi-rhombus-outline" type="border"
            @click="toggleSelectStatWindowVisible(true)">
            {{ currentStat ? currentStat.text : $lang('select stat: title') }}
          </cy-button>
        </div>
      </fieldset>
      <div>
        <template v-if="searchResult.length !== 0">
          <template v-for="(category, i) in searchResult"
            :key="category.id">
            <cy-hr v-if="i != 0" />
            <cy-button icon="bx-bx-cube-alt"
              type="drop-down"
              :menu-default-visible="true">
              {{ $lang('category title')[category.id] }}
              <template v-slot:menu>
                <cy-list-item v-for="cs in category.crystalStates" :key="cs.origin.id"
                  @click="selectCrystal(cs.origin)">
                  <cy-icon-text :icon="cs.imagePath" icon-src="image">
                    {{ cs.origin.name }}
                  </cy-icon-text>
                  <show-stat v-if="currentMode == 'stats' && currentStat" class="crystal-stat-detail"
                    :stat="cs.stat" :negative-value="cs.stat.value < 0" type="preview" />
                </cy-list-item>
              </template>
            </cy-button>
          </template>
        </template>
        <cy-default-tips v-else icon="bx-bx-message-rounded-x">
          {{ $lang('no result tips') }}
        </cy-default-tips>
      </div>
      <div v-if="currentCrystal"
        class="flex sticky bottom-2 mr-2 bg-white border-1 border-solid border-light-2 rounded-2xl mt-4">
        <div class="p-4">
          <div class="mb-2 text-purple">
            <cy-icon-text :icon="getCrystalImagePath(currentCrystal)" text-color="purple" icon-src="image">
              {{ currentCrystal.name }}
            </cy-icon-text>
          </div>
          <div v-if="currentCrystal.origin.enhancer"
            class="flex items-center pl-3 mb-2">
            <cy-icon-text icon="bx-bx-cube-alt" size="small">
              {{ $lang('enhancer title') }}
              <span class="text-orange">
                {{ currentCrystal.origin.enhancer }}
              </span>
            </cy-icon-text>
          </div>
          <div class="pl-1">
            <show-stat v-for="stat in currentCrystal.stats"
              :stat="stat" :key="stat.title"
              :negative-value="stat.value < 0" />
          </div>
        </div>
      </div>
    </div>
    <div>
      <cy-window v-model:visible="modeState['mode-stats'].selectStatWindowVisible"
        vertical-position="top">
        <template v-slot:title>
          <cy-icon-text icon="mdi-rhombus-outline">
            {{ $lang('select stat: window title') }}
          </cy-icon-text>
        </template>
        <template v-slot:default>
          <cy-title-input icon="ic-outline-category"
            class="mb-3"
            v-model:value="modeState['mode-stats'].searchText"
            :placeholder="$lang('select stat: search placeholder')" />
          <template v-if="statSearchResult.length != 0">
            <cy-list-item v-for="stat in statSearchResult"
              :key="`${stat.origin.baseName}-${stat.type.description}`"
              :selected="stat == currentStat"
              @click="selectStat(stat)">
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
    </div>
  </article>
</template>
<script>
import init from "./init.js";

import { StatBase } from "@/lib/Character/Stat";
import { EquipmentCrystal } from "@/lib/Character/CharacterEquipment";

import vue_showStat from "@/components/common/show-stat.vue";

export default {
  RegisterLang: 'Crystal Query',
  data() {
    const crystals = this.$store.state.datas.items.crystals;
    const crystalCategorys = new Array(5).fill().map((_, i) => {
      return {
        id: i,
        crystals: crystals.filter(a => a.category == i).map(p => new EquipmentCrystal(p))
      }
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

    return {
      crystalCategorys,
      currentCrystal: null,
      modeState: {
        modes: [{
          id: 'normal',
          icon: 'ic-round-list-alt'
        }, {
          id: 'stats',
          icon: 'mdi-rhombus-outline'
        }],
        currentModeIndex: 0,
        'mode-normal': {
          searchText: ''
        },
        'mode-stats': {
          stats,
          searchText: '',
          currentStat: null,
          selectStatWindowVisible: false
        }
      }
    };
  },
  computed: {
    currentMode() {
      return this.modeState.modes[this.modeState.currentModeIndex].id;
    },
    currentStat() {
      return this.modeState['mode-stats'].currentStat;
    },
    statSearchResult() {
      const s = this.modeState['mode-stats'];
      const v = s.searchText.toLowerCase();
      if (v === '') {
        return s.stats;
      }
      return s.stats.filter(stat => stat.text.toLowerCase().includes(v));
    },
    searchResult() {
      const res = [];
      if (this.currentMode === 'normal') {
        const v = this.modeState['mode-normal'].searchText.toLowerCase();
        if (v === '') {
          res.push(...this.crystalCategorys);
        }
        else {
          this.crystalCategorys.forEach(cat => {
            const t = cat.crystals.filter(c => c.name.toLowerCase().includes(v));
            t.length != 0 && res.push({
              id: cat.id,
              crystals: t
            });
          });
        }
      } else if (this.currentMode === 'stats') {
        const searchStat = this.currentStat;
        if (!searchStat) {
          return [];
        }
        this.crystalCategorys.forEach(cat => {
          const t = cat.crystals
            .filter(c => this.findCrystalStat(searchStat, c))
            .sort((a, b) => this.findCrystalStat(searchStat, b).value - this.findCrystalStat(searchStat, a).value);
          t.length != 0 && res.push({
            id: cat.id,
            crystals: t
          });
        });
      }

      res.forEach(cat => {
        cat.crystalStates = cat.crystals.map(c => ({
          origin: c,
          imagePath: this.getCrystalImagePath(c),
          stat: this.currentStat ? this.findCrystalStat(this.currentStat, c) : null
        }));
      });

      return res;
    }
  },
  methods: {
    findCrystalStat(from, crystal) {
      return crystal.stats
        .find(stat => stat.baseName == from.origin.baseName &&
            stat.type == from.type);
    },
    selectStat(stat) {
      this.modeState['mode-stats'].currentStat = stat;
      this.toggleSelectStatWindowVisible(false);
    },
    toggleSelectStatWindowVisible(force) {
      force = force !== void 0 ? !this.modeState['mode-stats'].selectStatWindowVisible : force;
      this.modeState['mode-stats'].selectStatWindowVisible = force;
    },
    selectMode(idx) {
      this.modeState.currentModeIndex = idx;
    },
    getCrystalImagePath(c) {
      const type = c.origin.enhancer ? 'enhance' :
        ['weapon', 'body', 'additional', 'special', 'normal'][c.origin.category];
      return '/imgs/crystals/' + type + '.png';
    },
    selectCrystal(crystal) {
      this.currentCrystal = crystal;
    }
  },
  beforeCreate() {
    init();
  },
  components: {
    'show-stat': vue_showStat
  }
};
</script>