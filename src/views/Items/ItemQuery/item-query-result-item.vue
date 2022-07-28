<template>
  <div class="result-item">
    <div class="sticky top-0 z-1 min-w-max bg-white py-0.5">
      <cy-list-item @click="toggle('contents/detail')">
        <div class="flex items-start w-full">
          <cy-icon-text
            class="w-48 flex-shrink-0"
            :icon="!equipment.is(EquipmentKinds.Avatar) ? equipment.getCategoryImagePath() : equipment.categoryIcon"
            :icon-src="!equipment.is(EquipmentKinds.Avatar) ? 'image' : 'iconify'"
            :text-color="contents.detail ? 'orange' : 'dark'"
            :icon-color="contents.detail ? 'orange' : 'light-2'"
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
            v-if="state.currentMode === SearchModes.Normal ||
              state.currentMode === SearchModes.Dye ||
              state.displayMode === 1"
            class="flex items-center space-x-2"
          >
            <template v-if="equipment.is(EquipmentKinds.Weapon)">
              <cy-icon-text icon="mdi-sword" text-color="purple">
                ATK
              </cy-icon-text>
              <span>{{ equipment.basicValue }}</span>
              <span class="text-water-blue pl-2 border-l border-water-blue">{{ equipment.stability }}%</span>
            </template>
            <template v-else-if="equipment.is(EquipmentKinds.Armor)">
              <cy-icon-text icon="mdi:shield-outline" text-color="purple">
                DEF
              </cy-icon-text>
              <span>{{ equipment.basicValue }}</span>
            </template>
            <template v-else-if="originEquipment.unknowCategory">
              <cy-icon-text icon="mdi-ghost" text-color="purple">
                {{ originEquipment.unknowCategory }}
              </cy-icon-text>
            </template>
          </div>
          <div v-else-if="state.currentMode === SearchModes.Stat" class="mt-0.5">
            <template v-if="previewStats !== null">
              <ShowStat
                v-for="previewStat in previewStats"
                :key="previewStat.statId"
                :stat="previewStat"
                :negative-value="previewStat.value < 0"
                type="preview"
              />
            </template>
          </div>
          <div v-else-if="state.currentMode === SearchModes.ItemLevel && originEquipment.recipe" class="flex items-center">
            <cy-icon-text icon="jam-hammer">
              {{ t('item-query.equipment-detail.recipe.item-level') }}
            </cy-icon-text>
            <span class="ml-2 text-water-blue">{{ originEquipment.recipe['item_level'] }}</span>
          </div>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div v-if="contents.detail" class="pt-2 pb-3 pl-6 pr-4 max-w-full bg-white overscroll-none">
        <div class="mb-2 pl-2 flex items-center space-x-2">
          <cy-icon-text
            v-if="originEquipment.unknowCategory"
            icon="mdi-ghost"
            small
            text-color="orange"
          >
            {{ originEquipment.unknowCategory }}
          </cy-icon-text>
          <cy-icon-text
            v-else
            :icon="equipment.getCategoryImagePath()"
            icon-src="image"
            text-color="orange"
            small
            class="mr-4"
          >
            {{ equipment.categoryText }}
          </cy-icon-text>
          <template v-if="equipment.is(EquipmentKinds.Weapon)">
            <cy-icon-text icon="mdi-sword" small>
              ATK
            </cy-icon-text>
            <span class="text-light-3 text-sm mr-2">{{ equipment.basicValue }}</span>
            <span class="text-water-blue text-sm border-l border-solid border-water-blue-light pl-2">
              {{ equipment.stability }}%
            </span>
          </template>
          <template v-else-if="equipment.is(EquipmentKinds.Armor)">
            <cy-icon-text icon="mdi:shield-outline" small>
              DEF
            </cy-icon-text>
            <span class="text-light-3 text-sm mr-2">{{ equipment.basicValue }}</span>
          </template>
        </div>
        <div v-if="originEquipment.extra" class="mb-2 pl-2">
          <cy-icon-text
            v-if="originEquipment.extra['caption']"
            icon="ic-outline-info"
            small
            text-color="light-3"
          >
            {{ originEquipment.extra['caption'] }}
          </cy-icon-text>
        </div>
        <fieldset class="stats result-item-row">
          <legend>
            <cy-icon-text
              icon="ic-baseline-format-list-bulleted"
              small
              text-color="purple"
            >
              {{ t('item-query.equipment-detail.content-titles.stats') }}
            </cy-icon-text>
          </legend>
          <template v-if="equipment.stats.length !== 0">
            <ShowStat
              v-for="stat in equipment.stats"
              :key="stat.statId"
              :stat="stat"
              :negative-value="stat.value < 0"
            />
          </template>
          <cy-default-tips v-else icon="mdi-ghost">
            {{ t('item-query.equipment-detail.no-any-stat-tips') }}
          </cy-default-tips>
        </fieldset>
        <fieldset v-if="originEquipment.recipe" class="recipe result-item-row">
          <legend>
            <cy-icon-text icon="ion-hammer" small text-color="purple">
              {{ t('item-query.equipment-detail.content-titles.recipe') }}
            </cy-icon-text>
          </legend>
          <div v-if="recipeInfoValid" class="recipe-info">
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" small>
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-level') }}
                </span>
                <span class="ml-2 text-light-3">
                  {{ originEquipment.recipe['item_level'] || '?' }}
                </span>
              </cy-icon-text>
            </div>
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" small>
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-difficulty') }}
                </span>
                <span class="ml-2 text-light-3">
                  {{ originEquipment.recipe['item_difficulty'] || '?' }}
                </span>
              </cy-icon-text>
            </div>
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" small>
                <span>
                  {{ t('item-query.equipment-detail.recipe.base-potential') }}
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
                {{ t('item-query.equipment-detail.recipe.spina') }}
              </cy-icon-text>
              <span class="text-light-4">{{ originEquipment.recipe['cost'] + 's' }}</span>
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
        <fieldset class="result-item-row pt-0">
          <legend>
            <cy-icon-text icon="bx-bx-search-alt" small text-color="purple">
              {{ t('item-query.equipment-detail.content-titles.obtains') }}
            </cy-icon-text>
          </legend>
          <div v-if="obtainsDatas.length !== 0" class="obtains-list">
            <div v-for="data in obtainsDatas" :key="data.iid" class="item">
              <div class="type-name">
                <cy-icon-text :icon="data.icon" class="type" small text-color="water-blue">
                  {{ data.type }}
                </cy-icon-text>
                <span class="text-purple">{{ data.name }}</span>
              </div>
              <div v-if="data.dye || data.map" class="info">
                <cy-icon-text v-if="data.dye" icon="ic-outline-palette" class="dye" small>
                  {{ data.dye }}
                </cy-icon-text>
                <cy-icon-text v-if="data.map" icon="ic-outline-map" class="map" small>
                  {{ data.map }}
                </cy-icon-text>
              </div>
            </div>
          </div>
          <cy-default-tips v-else icon="mdi-ghost">
            {{ t('item-query.equipment-detail.no-any-obtain-tips') }}
          </cy-default-tips>
        </fieldset>
      </div>
      <div
        v-else-if="state.currentMode === SearchModes.Dye"
        class="pl-2 ml-4 border-l-2 border-solid border-light-2 mb-3"
      >
        <div class="obtains-list">
          <div v-for="item in dyeObtains" :key="item.iid" class="item">
            <div class="type-name">
              <cy-icon-text :icon="item.icon" class="type" small text-color="water-blue">
                {{ item.type }}
              </cy-icon-text>
              <span class="text-purple">{{ item.name }}</span>
            </div>
            <div class="info">
              <cy-icon-text v-if="item.dye" icon="ic-outline-palette" class="dye" small>
                {{ item.dye }}
              </cy-icon-text>
              <cy-icon-text v-if="item.map" icon="ic-outline-map" class="map" small>
                {{ item.map }}
              </cy-icon-text>
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { ItemObtain } from '@/lib/Items/Item'
import { StatRestriction } from '@/lib/Character/Stat'
import { EquipmentKinds } from '@/lib/Character/CharacterEquipment/enums'

import ToggleService from '@/setup/ToggleService'

import ShowStat from '@/components/common/show-stat.vue'

import { findObtainByDye, findStat, SearchModes, useItemQueryModes } from './setup'

interface Props {
  equipment: CharacterEquipment;
}


const props = defineProps<Props>()

const {
  state,
  modes,
} = useItemQueryModes()

const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const originEquipment = computed(() => {
  return props.equipment.origin!
})

const obtainsDataConvert = (obtains: ItemObtain[]) => {
  const icons: Record<string, string> = {
    'mobs': 'jam-box',
    'boss': 'jam-box',
    'mini_boss': 'jam-box',
    'quest': 'mdi-script-outline',
    'smith': 'ion-hammer',
    'unknow': 'ri-file-unknow-line',
    'other': 'gg-shape-rhombus',
    'box': 'mdi-treasure-chest',
    'exchange': 'bx-bx-shopping-bag',
    'ex_skill': 'gg-shape-rhombus',
  }
  return obtains.map((item, idx) => {
    const type = t('common.Equipment.obtain.' + item.type)
    const icon = icons[item.type!] ?? ''
    const name = item.type !== 'smith' ? item.name : t('item-query.equipment-detail.production-equipment')
    const { map = null, dye = null } = item
    return {
      iid: idx,
      isDrop: ['mobs', 'boss', 'mini_boss'].includes(item.type!),
      type,
      name,
      map,
      dye,
      icon,
    }
  })
}

const obtainsDatas = computed(() => obtainsDataConvert(originEquipment.value.obtains))

const firstObtain = computed(() => obtainsDatas.value[0] ?? null)

const previewStats = computed(() => {
  const currentStats = modes[SearchModes.Stat].currentStats
  if (state.currentMode !== SearchModes.Stat || currentStats.length === 0) {
    return null
  }
  return currentStats.map(stat => findStat(stat, props.equipment.stats)).filter(stat => stat) as StatRestriction[]
})

const dyeObtains = computed(() => {
  const obtain = findObtainByDye(modes[SearchModes.Dye].searchText, props.equipment)
  return obtainsDataConvert(obtain)
})

const recipeInfoValid = computed(() => {
  const recipe = originEquipment.value.recipe!
  return props.equipment.creatable && (recipe['item_level'] || recipe['item_difficulty'])
})
</script>

<style lang="postcss" scoped>
.result-item {
  max-height: 70vh;
  overflow-y: auto;
  & + .result-item {
    border-top: 1px solid var(--app-light);
  }
}

fieldset.result-item-row {
  padding: 1rem 0.8rem;
  border: 0;
  border-top: 0.1rem solid var(--app-orange);
  padding-top: 0.4rem;

  & > legend {
    padding: 0.2rem 0.8rem;
  }
}

fieldset.recipe {
  & .recipe-attr {
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--app-light);
    display: inline-flex;
    margin-right: 0.3rem;
    margin-bottom: 0.3rem;
  }

  & > .recipe-materials {
    display: grid;
    grid-template-columns: 10rem 3rem;
    margin-top: 0.5rem;
    padding-left: 0.75rem;
  }
}

.obtains-list {
  & > .item {
    padding: 0.4rem 0.3rem;

    & + .item  {
      border-top: 1px solid var(--app-light);
    }

    & > .type-name {
      display: flex;
      align-items: center;

      & > .type {
        margin-right: 0.6rem;
      }
      & > .name {
        color: var(--app-purple);
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
