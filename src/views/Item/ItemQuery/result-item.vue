<template>
  <div class="result-item">
    <cy-list-item class="title-container" @click="detailVisible = !detailVisible">
      <div class="title">
        <cy-icon-text :iconify-name="equipmentIcon">
          {{ equipment.name }}
        </cy-icon-text>
        <div class="base-value" v-if="state.currentMode === 'normal' || state.displayMode === 1">
          <template v-if="equipment.is == 'weapon'">
            <cy-icon-text iconify-name="mdi-sword" class="base-value--name" text-color="purple">
              ATK
            </cy-icon-text>
            <span class="base-value--value">{{ equipment.atk }}</span>
            <span class="stability">{{ equipment.stability }}%</span>
          </template>
          <template v-else>
            <cy-icon-text iconify-name="mdi-shield" class="base-value--name" text-color="purple">
              DEF
            </cy-icon-text>
            <span class="base-value--value">{{ equipment.def }}</span>
          </template>
        </div>
        <template v-else>
          <show-stat v-if="state.currentMode === 'stat'" :stat="previewStat"
            :negative-value="previewStat.statValue() < 0"
            type="preview" />
        </template>
      </div>
    </cy-list-item>
    <cy-transition type="fade">
      <div class="detail" v-if="detailVisible">
        <fieldset class="stats column">
          <legend>
            <cy-icon-text iconify-name="ic-baseline-format-list-bulleted"
              text-size="small" text-color="purple">
              {{ langText('equipment detail/scope title/stats') }}
            </cy-icon-text>
          </legend>
          <show-stat v-for="stat in equipment.stats" :stat="stat"
            :key="`${stat.baseName()}-${stat.type.description}`"
            :negative-value="stat.statValue() < 0" />
        </fieldset>
        <fieldset v-if="equipment.recipe" class="recipe column">
          <legend>
            <cy-icon-text iconify-name="ion-hammer" text-size="small" text-color="purple">
              {{ langText('equipment detail/scope title/recipe') }}
            </cy-icon-text>
          </legend>
          <div class="recipe-info">
            <div class="recipe-attr">
              <cy-icon-text iconify-name="ion-hammer" text-size="small">
                {{ langText('equipment detail/recipe/item level')  }}
                <template #value>
                  {{ originEquipment.recipe['item_level'] || '?' }}
                </template>
              </cy-icon-text>
            </div>
            <div class="recipe-attr">
              <cy-icon-text iconify-name="ion-hammer" text-size="small">
                {{ langText('equipment detail/recipe/item difficulty')  }}
                <template #value>
                  {{ originEquipment.recipe['item_difficulty'] || '?' }}
                </template>
              </cy-icon-text>
            </div>
          </div>
          <div class="recipe-materials">
            <template v-if="originEquipment.recipe['materials']['cost']">
              <cy-icon-text iconify-name="la-coins">
                {{ langText('equipment detail/recipe/spina') }}
              </cy-icon-text>
              <span class="value">{{ originEquipment.recipe['materials']['cost'] + 's' }}</span>
            </template>
            <template v-for="m in originEquipment.recipe['materials']">
              <cy-icon-text iconify-name="mdi-cube-outline" :key="m.name + '--name'">
                {{ m.name }}
              </cy-icon-text>
              <span class="value" :key="m.name + '--quantity'">{{ '×' + m.quantity }}</span>
            </template>
          </div>
        </fieldset>
        <fieldset class="obtains column">
          <legend>
            <cy-icon-text iconify-name="bx-bx-search-alt" text-size="small" text-color="purple">
              {{ langText('equipment detail/scope title/obtains') }}
            </cy-icon-text>
          </legend>
          <div class="obtains-list">
            <div v-for="p in obtainsData" class="item" :key="p.iid">
              <span class="type-name">
                <cy-icon-text :iconify-name="p.icon" class="type"
                  text-size="small" text-color="purple">
                  {{ p.type }}
                </cy-icon-text>
                <span>{{ p.name }}</span>
              </span>
              <cy-icon-text v-if="p.dye" iconify-name="ic-outline-palette"
                class="dye" text-size="small">
                {{ p.dye }}
              </cy-icon-text>
              <cy-icon-text v-if="p.map" iconify-name="ic-outline-map"
                class="map" text-size="small">
                {{ p.map }}
              </cy-icon-text>
            </div>
          </div>
        </fieldset>
      </div>
    </cy-transition>
  </div>
</template>
<script>
import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

import vue_showStat from "./show-stat.vue";

export default {
  props: ['equipment'],
  inject: ['langText', 'state', 'findStat', 'modesState'],
  data() {
    return {
      detailVisible: false,
    }
  },
  computed: {
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
    equipmentIcon() {
      const list = [{
        instance: MainWeapon,
        icon: 'mdi-sword'
      }, {
        instance: SubWeapon,
        icon: 'mdi-shield'
      }, {
        instance: SubArmor,
        icon: 'mdi-shield'
      }, {
        instance: BodyArmor,
        icon: 'mdi-tshirt-crew'
      }, {
        instance: AdditionalGear,
        icon: 'cib-redhat'
      }, {
        instance: SpecialGear,
        icon: 'fa-solid:ring'
      }];

      const t = list.find(p => this.equipment instanceof p.instance);
      return t ? t.icon : '';
    },
    obtainsData() {
      const icons = {
        'mobs': 'bx-bx-game',
        'boss': 'bx-bx-game',
        'mini_boss': 'bx-bx-game',
        'quest': 'mdi-script-outline',
        'smith': 'ion-hammer',
        'unknow': 'ri-file-unknow-line',
        'other': 'gg-shape-rhombus',
        'box': 'jam-box',
        'exchange': 'bx-bx-shopping-bag'
      };
      return this.originEquipment.obtains.map((p, i) => {
        const type = this.langText('equipment detail/obtains/' + p.type);
        const icon = icons[p.type];
        const name = p.type !== 'smith' ? p.name : this.langText('equipment detail/production equipment');
        const { map, dye } = p;
        return {
          iid: i,
          type, name, map, dye, icon
        };
      });
    }
  },
  components: {
    'show-stat': vue_showStat
  }
}
</script>
<style lang="less" scoped>
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
  background-color: var(--white);
  z-index: 1;
}
.title {
  display: grid;
  grid-template-columns: 12rem auto;
  width: 100%;

  > .base-value {
    display: flex;
    align-items: center;

    > .base-value--name {
      margin-right: 0.6rem;
    }

    > .stability {
      color: var(--primary-water-blue);
      border-left: 1px solid var(--primary-water-blue-light);
      margin-left: 0.5rem;
      padding-left: 0.5rem;
    }
  }
}

.detail {
  padding: 0.4rem 1rem;
  padding-bottom: 0.8rem;
  padding-left: 1.5rem;
}

fieldset.column {
  padding: 1rem 0.8rem;
  border: 0;
  border-top: 0.1rem solid var(--primary-light);
  padding-top: 0.4rem;

  > legend {
    padding: 0.2rem 0.8rem;
  }
}

fieldset.recipe {
  .recipe-attr {
    padding: 0.4rem 0.8rem;
    border: 1px solid var(--primary-light);
    display: inline-block;
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }

  > .recipe-info {
  }

  > .recipe-materials {
    display: grid;
    grid-template-columns: 10rem 3rem;
    margin-top: 0.4rem;
    padding-left: 0.8rem;

    > .value {
      color: var(--primary-light-4);
    }
  }
}

fieldset.obtains {
  > .obtains-list {
    > .item {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 0.3rem 0.2rem;

      & + .item  {
        border-top: 1px solid var(--primary-light);
      }

      > .type-name {
        display: inline-flex;
        min-width: 12rem;
        align-items: center;
        font-size: 0.9rem;
        flex-shrink: 0;
        > .type {
          margin-right: 0.6rem;
        }
      }
      > .map {
        margin-left: 0.8rem;
        flex-shrink: 0;
      }
      > .dye {
        margin-left: 0.8rem;
        min-width: 6rem;
        flex-shrink: 0;
      }
    }
  }
}
</style>