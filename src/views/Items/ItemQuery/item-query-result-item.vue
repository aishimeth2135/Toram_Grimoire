<template>
  <div class="result-item">
    <cy-list-item
      class="title-container min-w-max"
      :class="{ 'detail-visible': detailVisible }"
      @click="detailVisible = !detailVisible"
    >
      <div class="title">
        <cy-icon-text
          class="py-1 w-48 flex-shrink-0"
          :icon="equipment.is !== 'avatar' ? equipment.getCategoryImagePath() : equipment.categoryIcon"
          :icon-src="equipment.is !== 'avatar' ? 'image' : 'iconify'"
          :text-color="detailVisible ? 'orange' : 'dark'"
          :icon-color="detailVisible ? 'orange' : 'light-2'"
        >
          <span class="inline-flex items-center flex-wrap">
            <span>{{ equipment.name }}</span>
            <cy-icon-text
              v-if="firstObtain && firstObtain.isDrop"
              icon="jam-box"
              icon-color="red"
              class="ml-2"
            />
          </span>
          <span
            v-if="equipment.hasRefining && equipment.refining !== 0"
            class="ml-1 text-water-blue"
          >
            +{{ equipment.refining }}
          </span>
        </cy-icon-text>
        <div
          v-if="state.currentMode === 'normal' ||
            state.currentMode === 'dye' || state.displayMode === 1"
          class="base-value"
        >
          <template v-if="equipment.is === 'weapon'">
            <cy-icon-text icon="mdi-sword" class="base-value--name" text-color="purple">
              ATK
            </cy-icon-text>
            <span>{{ equipment.atk }}</span>
            <span class="stability">{{ equipment.stability }}%</span>
          </template>
          <template v-else-if="equipment.is === 'armor'">
            <cy-icon-text icon="mdi-shield" class="base-value--name" text-color="purple">
              DEF
            </cy-icon-text>
            <span>{{ equipment.def }}</span>
          </template>
          <template v-else-if="equipment.origin.unknowCategory">
            <cy-icon-text icon="mdi-ghost" class="base-value--name" text-color="purple">
              {{ equipment.origin.unknowCategory }}
            </cy-icon-text>
          </template>
        </div>
        <template v-else-if="state.currentMode === 'stat'">
          <show-stat
            v-if="state.currentMode === 'stat'"
            :stat="previewStat"
            :negative-value="previewStat.value < 0"
            type="preview"
          />
        </template>
        <template v-else-if="state.currentMode === 'item-level'">
          <div class="item-level">
            <cy-icon-text icon="jam-hammer">
              {{ $lang('equipment detail/recipe/item level') }}
            </cy-icon-text>
            <span class="value">{{ originEquipment.recipe['item_level'] }}</span>
          </div>
        </template>
      </div>
    </cy-list-item>
    <cy-transition type="fade">
      <div v-if="detailVisible" class="detail">
        <div class="mb-2 pl-2 flex items-center">
          <cy-icon-text
            v-if="equipment.origin.unknowCategory"
            icon="mdi-ghost"
            size="small"
            text-color="orange"
          >
            {{ equipment.origin.unknowCategory }}
          </cy-icon-text>
          <cy-icon-text
            v-else
            :icon="equipment.getCategoryImagePath()"
            icon-src="image"
            text-color="orange"
            size="small"
            class="mr-4"
          >
            {{ equipment.categoryText }}
          </cy-icon-text>
          <template v-if="equipment.is === 'weapon'">
            <cy-icon-text icon="mdi-sword" size="small" class="mr-2">
              ATK
            </cy-icon-text>
            <span class="text-light-3 text-sm mr-2">{{ equipment.atk }}</span>
            <span class="text-water-blue text-sm border-l border-solid border-water-blue-light pl-2">
              {{ equipment.stability }}%
            </span>
          </template>
          <template v-else-if="equipment.is === 'armor'">
            <cy-icon-text icon="mdi-shield" size="small" class="mr-2">
              DEF
            </cy-icon-text>
            <span class="text-light-3 text-sm mr-2">{{ equipment.def }}</span>
          </template>
        </div>
        <div v-if="originEquipment.extra" class="mb-2 pl-2">
          <cy-icon-text
            v-if="originEquipment.extra['caption']"
            icon="ic-outline-info"
            size="small"
            text-color="light-3"
          >
            {{ originEquipment.extra['caption'] }}
          </cy-icon-text>
        </div>
        <fieldset class="stats column">
          <legend>
            <cy-icon-text
              icon="ic-baseline-format-list-bulleted"
              size="small"
              text-color="purple"
            >
              {{ $lang('equipment detail/scope title/stats') }}
            </cy-icon-text>
          </legend>
          <template v-if="equipment.stats.length !== 0">
            <show-stat
              v-for="stat in equipment.stats"
              :key="stat.statId"
              :stat="stat"
              :negative-value="stat.value < 0"
            />
          </template>
          <cy-default-tips v-else icon="mdi-ghost">
            {{ $lang('equipment detail/tips: without any stat') }}
          </cy-default-tips>
        </fieldset>
        <fieldset v-if="originEquipment.recipe" class="recipe column">
          <legend>
            <cy-icon-text icon="ion-hammer" size="small" text-color="purple">
              {{ $lang('equipment detail/scope title/recipe') }}
            </cy-icon-text>
          </legend>
          <div v-if="recipeInfoValid" class="recipe-info">
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" size="small">
                <span>
                  {{ $lang('equipment detail/recipe/item level') }}
                </span>
                <span class="ml-2 text-light-3">
                  {{ originEquipment.recipe['item_level'] || '?' }}
                </span>
              </cy-icon-text>
            </div>
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" size="small">
                <span>
                  {{ $lang('equipment detail/recipe/item difficulty') }}
                </span>
                <span class="ml-2 text-light-3">
                  {{ originEquipment.recipe['item_difficulty'] || '?' }}
                </span>
              </cy-icon-text>
            </div>
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" size="small">
                <span>
                  {{ $lang('equipment detail/recipe/base potential') }}
                </span>
                <span class="ml-2 text-light-3">
                  {{ originEquipment.recipe['potential'] || '?' }}
                </span>
              </cy-icon-text>
            </div>
          </div>
          <div class="recipe-materials">
            <template v-if="originEquipment.recipe['cost']">
              <cy-icon-text icon="la-coins">
                {{ $lang('equipment detail/recipe/spina') }}
              </cy-icon-text>
              <span class="value">{{ originEquipment.recipe['cost'] + 's' }}</span>
            </template>
            <template
              v-for="m in originEquipment.recipe['materials']"
              :key="m.name"
            >
              <cy-icon-text icon="mdi-cube-outline">
                {{ m.name }}
              </cy-icon-text>
              <span class="value">{{ '×' + m.quantity }}</span>
            </template>
          </div>
        </fieldset>
        <fieldset class="obtains column">
          <legend>
            <cy-icon-text icon="bx-bx-search-alt" size="small" text-color="purple">
              {{ $lang('equipment detail/scope title/obtains') }}
            </cy-icon-text>
          </legend>
          <div v-if="obtainsData.length !== 0" class="obtains-list">
            <div v-for="p in obtainsData" :key="p.iid" class="item">
              <div class="type-name">
                <cy-icon-text :icon="p.icon" class="type" size="small" text-color="water-blue">
                  {{ p.type }}
                </cy-icon-text>
                <span class="name">{{ p.name }}</span>
              </div>
              <div v-if="p.dye || p.map" class="info">
                <cy-icon-text v-if="p.dye" icon="ic-outline-palette" class="dye" size="small">
                  {{ p.dye }}
                </cy-icon-text>
                <cy-icon-text v-if="p.map" icon="ic-outline-map" class="map" size="small">
                  {{ p.map }}
                </cy-icon-text>
              </div>
            </div>
          </div>
          <cy-default-tips v-else icon="mdi-ghost">
            {{ $lang('equipment detail/tips: without any obtain') }}
          </cy-default-tips>
        </fieldset>
      </div>
      <div
        v-else-if="state.currentMode === 'dye'"
        class="pl-2 ml-4 border-l-2 border-solid border-light-2 mb-3"
      >
        <div class="obtains-list">
          <div v-for="p in dyeObtains" :key="p.iid" class="item">
            <div class="type-name">
              <cy-icon-text :icon="p.icon" class="type" size="small" text-color="water-blue">
                {{ p.type }}
              </cy-icon-text>
              <span class="name">{{ p.name }}</span>
            </div>
            <div class="info">
              <cy-icon-text v-if="p.dye" icon="ic-outline-palette" class="dye" size="small">
                {{ p.dye }}
              </cy-icon-text>
              <cy-icon-text v-if="p.map" icon="ic-outline-map" class="map" size="small">
                {{ p.map }}
              </cy-icon-text>
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
  </div>
</template>
<script>
import vue_showStat from '@/components/common/show-stat.vue';

export default {
  RegisterLang: 'Item Query',
  components: {
    'show-stat': vue_showStat,
  },
  inject: ['state', 'findStat', 'modesState', 'findObtainByDye'],
  props: ['equipment'],
  data() {
    return {
      detailVisible: false,
    }
  },
  computed: {
    recipeInfoValid() {
      const r = this.originEquipment.recipe;
      return this.equipment.creatable && (r['item_level'] || r['item_difficulty']);
    },
    dyeObtains() {
      const t = this.findObtainByDye(this.modesState.dye.searchText, this.equipment);
      return this.obtainsDataConvert(t);
    },
    previewStat() {
      return this.state.currentMode === 'stat' ?
        this.findStat(this.currentSearchStat, this.equipment.stats)
        : null;
    },
    currentSearchStat() {
      return this.modesState.stat.currentStat;
    },
    originEquipment() {
      return this.equipment.origin;
    },
    obtainsData() {
      return this.obtainsDataConvert(this.originEquipment.obtains);
    },
    firstObtain() {
      return this.obtainsData.length !== 0 ? this.obtainsData[0] : null;
    },
  },
  methods: {
    obtainsDataConvert(obtains) {
      const icons = {
        'mobs': 'jam-box',
        'boss': 'jam-box',
        'mini_boss': 'jam-box',
        'quest': 'mdi-script-outline',
        'smith': 'ion-hammer',
        'unknow': 'ri-file-unknow-line',
        'other': 'gg-shape-rhombus',
        'box': 'mdi-treasure-chest',
        'exchange': 'bx-bx-shopping-bag',
      };
      return obtains.map((p, i) => {
        const type = this.$rootLang('common/Equipment/obtain/' + p.type);
        const icon = icons[p.type];
        const name = p.type !== 'smith' ? p.name : this.$lang('equipment detail/production equipment');
        const { map=null, dye=null } = p;
        return {
          iid: i,
          isDrop: ['mobs', 'boss', 'mini_boss'].includes(p.type),
          type, name, map, dye, icon,
        };
      });
    },
  },
}
</script>
<style lang="postcss" scoped>
.result-item {
  max-height: 70vh;
  overflow-y: auto;
  & + .result-item {
    border-top: 1px solid var(--primary-light);
  }
}

.title-container {
  position: sticky;
  top: 0;
  z-index: 1;

  &.detail-visible {
    background-color: var(--white);
  }
}
.title {
  display: flex;
  align-items: center;
  width: 100%;

  & > .base-value {
    display: flex;
    align-items: center;

    & > .base-value--name {
      margin-right: 0.6rem;
    }

    & > .stability {
      color: var(--primary-water-blue);
      border-left: 1px solid var(--primary-water-blue-light);
      margin-left: 0.5rem;
      padding-left: 0.5rem;
    }
  }
}

.item-level {
  display: flex;
  align-items: center;
  & > .value {
    margin-left: 0.5rem;
    color: var(--primary-water-blue);
  }
}

.detail {
  padding: 0.4rem 1rem;
  padding-bottom: 0.8rem;
  padding-left: 1.5rem;
  max-width: 100%;

  @apply bg-white;
}

fieldset.column {
  padding: 1rem 0.8rem;
  border: 0;
  border-top: 0.1rem solid var(--primary-orange);
  padding-top: 0.4rem;

  & > legend {
    padding: 0.2rem 0.8rem;
  }
}

fieldset.recipe {
  & .recipe-attr {
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--primary-light);
    display: inline-flex;
    margin-right: 0.3rem;
    margin-bottom: 0.3rem;
  }

  & > .recipe-materials {
    display: grid;
    grid-template-columns: 10rem 3rem;
    margin-top: 0.4rem;
    padding-left: 0.8rem;

    & > .value {
      color: var(--primary-light-4);
    }
  }
}

fieldset.obtains {
  padding-top: 0;
}

.obtains-list {
  & > .item {
    padding: 0.4rem 0.3rem;

    & + .item  {
      border-top: 1px solid var(--primary-light);
    }

    & > .type-name {
      display: flex;
      align-items: center;

      & > .type {
        margin-right: 0.6rem;
      }
      & > .name {
        color: var(--primary-purple);
      }
    }

    & > .info {
      display: flex;
      align-items: center;
      margin-top: 0.3rem;

      & > .map {
        margin-left: 0.8rem;
        flex-shrink: 0;
      }
      & > .dye {
        margin-left: 0.8rem;
        min-width: 5rem;
        flex-shrink: 0;
      }
    }
  }
}
</style>