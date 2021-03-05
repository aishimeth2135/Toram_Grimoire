<template>
  <article>
    <div class="main">
      <fieldset class="top">
        <legend>
          <cy-button v-for="(mode, i) in modeState.modes"
            :key="mode.id"
            :iconify-name="mode.icon"
            :selected="i == modeState.currentModeIndex"
            @click="selectMode(i)"
            type="border">
            {{ langText('search mode/' + mode.id) }}
          </cy-button>
        </legend>
        <div class="mode--normal" v-show="currentMode == 'normal'">
          <div class="top-title">
            <cy-icon-text iconify-name="ic-outline-search" class="text-small">
              {{ langText('search title') }}
            </cy-icon-text>
          </div>
          <cy-title-input iconify-name="ic-outline-category" class="search-input">
            <input type="text"
              ref="normal-search-input"
              :placeholder="langText('search placeholder')"
              @input="updateSearchResult()" />
          </cy-title-input>
        </div>
        <div class="mode--stats" v-show="currentMode == 'stats'">
          <cy-button iconify-name="mdi-rhombus-outline" type="border"
            class="select-stat"
            @click="toggleSelectStatWindowVisible(true)">
            {{ currentStat ? currentStat.text : langText('select stat: title') }}
          </cy-button>
        </div>
      </fieldset>
      <div class="crystals">
        <template v-if="searchResult.length != 0">
          <template v-for="(category, i) in searchResult">
            <cy-hr v-if="i != 0" :key="category.id + '-hr'" />
            <cy-button :key="category.id + '-btn'"
              iconify-name="bx-bx-cube-alt" type="drop-down"
              :menu-default-visible="true">
              {{ langText('category title')[category.id] }}
              <template v-slot:menu>
                <cy-list-item v-for="cs in category.crystalStates" :key="cs.origin.id"
                  @click="selectCrystal(cs.origin)">
                  <cy-icon-text :image-path="cs.imagePath">
                    {{ cs.origin.name }}
                  </cy-icon-text>
                  <show-stat v-if="currentMode == 'stats' && currentStat" class="crystal-stat-detail"
                    :stat="cs.stat" :negative-value="cs.stat.statValue() < 0" type="preview" />
                </cy-list-item>
              </template>
            </cy-button>
          </template>
        </template>
        <cy-default-tips v-else iconify-name="bx-bx-message-rounded-x">
          {{ langText('no result tips') }}
        </cy-default-tips>
      </div>
      <div class="detail-container" v-if="currentCrystal">
        <div class="detail">
          <div class="title">
            <cy-icon-text :image-path="getCrystalImagePath(currentCrystal)" text-color="purple">
              {{ currentCrystal.name }}
            </cy-icon-text>
          </div>
          <cy-flex-layout class="enhancer" v-if="currentCrystal.origin.enhancer">
            <cy-icon-text iconify-name="bx-bx-cube-alt" text-size="small">
              {{ langText('enhancer title') }}
              <span class="enhancer-value">
                {{ currentCrystal.origin.enhancer }}
              </span>
            </cy-icon-text>
          </cy-flex-layout>
          <div class="stats">
            <show-stat v-for="stat in currentCrystal.stats"
              :stat="stat" :key="stat.baseName()"
              :negative-value="stat.statValue() < 0" />
          </div>
        </div>
      </div>
    </div>
    <div>
      <cy-window :visible="modeState['mode-stats'].selectStatWindowVisible"
        vertical-position="top"
        @close-window="toggleSelectStatWindowVisible(false)">
        <template v-slot:title>
          <cy-icon-text iconify-name="mdi-rhombus-outline">
            {{ langText('select stat: window title') }}
          </cy-icon-text>
        </template>
        <template v-slot:default>
          <cy-title-input iconify-name="ic-outline-category" class="search-stat-input">
            <input type="text"
              ref="stat-search-input"
              :placeholder="langText('select stat: search placeholder')"
              @input="updateStatSearchResult()" />
          </cy-title-input>
          <template v-if="modeState['mode-stats'].statsSearchResult.length != 0">
            <cy-list-item v-for="stat in modeState['mode-stats'].statsSearchResult"
              :key="`${stat.origin.baseName}-${stat.type.description}`"
              :selected="stat == currentStat"
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
    </div>
  </article>
</template>
<script>
import GetLang from "@global-modules/LanguageSystem.js";
import Grimoire from "@Grimoire";

import init from "./init.js";

import StatBase from "@lib/CharacterSystem/module/StatBase.js";
import { EquipmentCrystal } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

import vue_showStat from "./show-stat.vue";

export default {
  data() {
    const crystals = Grimoire.ItemSystem.items.crystals;
    const crystalCategorys = new Array(5).fill().map((p, i) => {
      return {
        id: i,
        crystals: crystals.filter(a => a.category == i).map(p => new EquipmentCrystal(p))
      }
    });

    const stats = [], statTypes = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    Grimoire.CharacterSystem.statList.forEach(stat => {
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
      searchResult: [],
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
        'mode-stats': {
          stats,
          statsSearchResult: stats,
          currentStat: null,
          selectStatWindowVisible: false
        }
      }
    };
  },
  provide() {
    return {
      'langText': this.langText
    }
  },
  mounted() {
    this.updateSearchResult();
  },
  computed: {
    currentMode() {
      return this.modeState.modes[this.modeState.currentModeIndex].id;
    },
    currentStat() {
      return this.modeState['mode-stats'].currentStat;
    }
  },
  methods: {
    updateStatSearchResult() {
      const s = this.modeState['mode-stats'];
      const v = this.$refs['stat-search-input'].value.toLowerCase();
      if (v == '') {
        s.statsSearchResult = s.stats;
        return;
      }
      s.statsSearchResult = s.stats.filter(stat => stat.text.toLowerCase().includes(v));
      console.log(s.statsSearchResult);
    },
    findCrystalStat(from, crystal) {
      return crystal.stats
        .find(stat => stat.baseName() == from.origin.baseName &&
            stat.type == from.type);
    },
    selectStat(stat) {
      this.modeState['mode-stats'].currentStat = stat;
      this.toggleSelectStatWindowVisible(false);
      this.updateSearchResult();

      const s = this.modeState['mode-stats'];
      s.statsSearchResult = s.stats;
    },
    toggleSelectStatWindowVisible(force) {
      force = force !== void 0 ? !this.modeState['mode-stats'].selectStatWindowVisible : force;
      this.modeState['mode-stats'].selectStatWindowVisible = force;
    },
    selectMode(idx) {
      this.modeState.currentModeIndex = idx;
      this.updateSearchResult();
    },
    updateSearchResult() {
      const res = [];
      if (this.currentMode == 'normal') {
        const v = this.$refs['normal-search-input'].value.toLowerCase();
        if (v == '') {
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
      } else if (this.currentMode == 'stats') {
        const searchStat = this.currentStat;
        if (!searchStat) {
          this.searchResult = [];
          return;
        }
        this.crystalCategorys.forEach(cat => {
          const t = cat.crystals
            .filter(c => this.findCrystalStat(searchStat, c))
            .sort((a, b) => this.findCrystalStat(searchStat, b).statValue() - this.findCrystalStat(searchStat, a).statValue());
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
      this.searchResult = res;
    },
    getCrystalImagePath(c) {
      const type = c.origin.enhancer ? 'enhance' :
        ['weapon', 'body', 'additional', 'special', 'normal'][c.origin.category];
      return '/imgs/crystals/' + type + '.png';
    },
    selectCrystal(crystal) {
      this.currentCrystal = crystal;
    },
    langText(v, vs) {
      return GetLang('Crystal Query/' + v, vs);
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
<style lang="less" scoped>
@deep: ~'>>>';

.mode--normal {
  > .top-title {
    color: var(--primary-purple);
    margin-bottom: 0.3rem;
  }
}

.top {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 0.1rem solid var(--primary-light-2);

  > legend {
    padding: 0 0.6rem;
  }
}

.detail-container {
  display: flex;
  position: sticky;
  bottom: 0;
  margin-right: 0.6rem;
  background-color: var(--white);
  border-top: 1px solid var(--primary-light-2);
  margin-top: 1rem;

  > .detail {
    //margin-left: auto;
    padding: 1rem;
    // border: 0.1rem solid var(--primary-light-2);
    // background-color: var(--white);

    > .title {
      margin-bottom: 0.4rem;
      color: var(--primary-purple);
    }
    > .stats {
      padding-left: 0.3rem;
    }
  }
}

.search-stat-input {
  margin-bottom: 0.8rem;
}
.enhancer {
  padding-left: 0.6rem;
  margin-bottom: 0.4rem;

  @{deep} .enhancer-value {
    color: var(--primary-orange);
    font-size: 0.9rem;
  }
}
</style>