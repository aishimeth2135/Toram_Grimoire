<template>
  <div class="result-item">
    <div class="min-w-max sticky top-0 z-1 bg-white py-0.5">
      <cy-list-item @click="toggle('contents/detail')">
        <div class="flex w-full items-start">
          <cy-icon-text
            class="w-48 flex-shrink-0"
            :icon="
              !equipment.is(EquipmentKinds.Avatar)
                ? equipment.getCategoryImagePath()
                : equipment.categoryIcon
            "
            :icon-src="
              !equipment.is(EquipmentKinds.Avatar) ? 'image' : 'iconify'
            "
            :text-color="contents.detail ? 'orange-60' : 'primary-90'"
            :icon-color="contents.detail ? 'orange-60' : 'primary-30'"
          >
            <span class="inline-flex flex-wrap items-center">
              <span>{{ equipment.name }}</span>
              <cy-icon-text
                v-if="firstObtain && firstObtain.isDrop"
                icon="jam-box"
                icon-color="orange-60"
                class="ml-2"
              />
            </span>
            <span
              v-if="equipment.hasRefining && equipment.refining !== 0"
              class="ml-1 text-blue-60"
            >
              +{{ equipment.refining }}
            </span>
          </cy-icon-text>
          <div
            v-if="
              state.currentMode === SearchModes.Normal ||
              state.currentMode === SearchModes.Dye ||
              state.displayMode === 1
            "
            class="flex items-center space-x-2"
          >
            <template v-if="equipment.is(EquipmentKinds.Weapon)">
              <cy-icon-text icon="mdi-sword" text-color="fuchsia-60">
                ATK
              </cy-icon-text>
              <span>{{ equipment.basicValue }}</span>
              <span class="border-l border-blue-60 pl-2 text-blue-60">
                {{ equipment.stability }}%
              </span>
            </template>
            <template v-else-if="equipment.is(EquipmentKinds.Armor)">
              <cy-icon-text icon="mdi:shield-outline" text-color="fuchsia-60">
                DEF
              </cy-icon-text>
              <span>{{ equipment.basicValue }}</span>
            </template>
            <template v-else-if="originEquipment.unknowCategory">
              <cy-icon-text icon="mdi-ghost" text-color="fuchsia-60">
                {{ originEquipment.unknowCategory }}
              </cy-icon-text>
            </template>
          </div>
          <div
            v-else-if="state.currentMode === SearchModes.Stat"
            class="mt-0.5"
          >
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
          <div
            v-else-if="
              state.currentMode === SearchModes.ItemLevel &&
              originEquipment.recipe
            "
            class="flex items-center"
          >
            <cy-icon-text icon="jam-hammer" text-color="primary-30">
              {{ t('item-query.equipment-detail.recipe.item-level') }}
            </cy-icon-text>
            <span class="ml-2 text-blue-60">{{
              originEquipment.recipe['item_level']
            }}</span>
          </div>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div
        v-if="contents.detail"
        class="overscroll-none max-w-full bg-white pt-2 pb-3 pl-4 pr-3"
      >
        <div class="mb-2 flex items-center space-x-2 pl-2">
          <cy-icon-text
            v-if="originEquipment.unknowCategory"
            icon="mdi-ghost"
            small
            text-color="orange-60"
          >
            {{ originEquipment.unknowCategory }}
          </cy-icon-text>
          <cy-icon-text
            v-else
            :icon="equipment.getCategoryImagePath()"
            icon-src="image"
            text-color="orange-60"
            small
            class="mr-4"
          >
            {{ equipment.categoryText }}
          </cy-icon-text>
          <template v-if="equipment.is(EquipmentKinds.Weapon)">
            <cy-icon-text icon="mdi-sword" small> ATK </cy-icon-text>
            <span class="mr-2 text-sm text-primary-50">{{
              equipment.basicValue
            }}</span>
            <span
              class="border-l border-solid border-blue-30 pl-2 text-sm text-blue-60"
            >
              {{ equipment.stability }}%
            </span>
          </template>
          <template v-else-if="equipment.is(EquipmentKinds.Armor)">
            <cy-icon-text icon="mdi:shield-outline" small> DEF </cy-icon-text>
            <span class="mr-2 text-sm text-primary-50">{{
              equipment.basicValue
            }}</span>
          </template>
        </div>
        <div v-if="originEquipment.extra" class="mb-2 pl-2">
          <cy-icon-text
            v-if="originEquipment.extra['caption']"
            icon="ic-outline-info"
            small
            text-color="primary-50"
          >
            {{ originEquipment.extra['caption'] }}
          </cy-icon-text>
        </div>
        <fieldset class="result-item-row">
          <legend>
            <cy-icon-text
              icon="ic-baseline-format-list-bulleted"
              small
              text-color="fuchsia-60"
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
            <cy-icon-text icon="ion-hammer" small text-color="fuchsia-60">
              {{ t('item-query.equipment-detail.content-titles.recipe') }}
            </cy-icon-text>
          </legend>
          <div v-if="recipeInfoValid" class="pb-1.5 pt-0.5">
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" small>
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-level') }}
                </span>
                <span class="ml-2 text-primary-50">
                  {{ originEquipment.recipe['item_level'] || '?' }}
                </span>
              </cy-icon-text>
            </div>
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" small>
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-difficulty') }}
                </span>
                <span class="ml-2 text-primary-50">
                  {{ originEquipment.recipe['item_difficulty'] || '?' }}
                </span>
              </cy-icon-text>
            </div>
            <div class="recipe-attr">
              <cy-icon-text icon="ion-hammer" small>
                <span>
                  {{ t('item-query.equipment-detail.recipe.base-potential') }}
                </span>
                <span class="ml-2 text-primary-50">
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
              <span class="text-primary-60">{{
                originEquipment.recipe['cost'] + 's'
              }}</span>
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
            <cy-icon-text icon="bx-bx-search-alt" small text-color="fuchsia-60">
              {{ t('item-query.equipment-detail.content-titles.obtains') }}
            </cy-icon-text>
          </legend>
          <div
            v-if="obtainsDatas.length !== 0"
            class="-my-1 divide-y divide-primary-20"
          >
            <div
              v-for="data in obtainsDatas"
              :key="data.iid"
              class="px-1 pt-1.5 pb-2"
            >
              <div class="flex items-center">
                <cy-icon-text
                  :icon="data.icon"
                  class="mr-2"
                  small
                  text-color="blue-60"
                >
                  {{ data.type }}
                </cy-icon-text>
                <span class="text-fuchsia-60">{{ data.name }}</span>
              </div>
              <div v-if="data.dye || data.map" class="mt-1 flex items-center">
                <cy-icon-text
                  v-if="data.dye"
                  icon="ic-outline-palette"
                  class="ml-3 flex-shrink-0"
                  small
                >
                  {{ data.dye }}
                </cy-icon-text>
                <cy-icon-text
                  v-if="data.map"
                  icon="ic-outline-map"
                  class="ml-3 flex-shrink-0"
                  small
                >
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
        class="ml-4 mb-3 border-l-2 border-solid border-primary-30 pl-2"
      >
        <div class="divide-y divide-primary-20">
          <div
            v-for="item in dyeObtains"
            :key="item.iid"
            class="px-1 pt-1.5 pb-2"
          >
            <div class="flex items-center">
              <cy-icon-text
                :icon="item.icon"
                class="mr-2"
                small
                text-color="blue-60"
              >
                {{ item.type }}
              </cy-icon-text>
              <span class="text-fuchsia-60">{{ item.name }}</span>
            </div>
            <div class="mt-1 flex items-center">
              <cy-icon-text
                v-if="item.dye"
                icon="ic-outline-palette"
                class="ml-3 flex-shrink-0"
                small
              >
                {{ item.dye }}
              </cy-icon-text>
              <cy-icon-text
                v-if="item.map"
                icon="ic-outline-map"
                class="ml-3 flex-shrink-0"
                small
              >
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
import { EquipmentKinds } from '@/lib/Character/CharacterEquipment/enums'
import { StatRestriction } from '@/lib/Character/Stat'
import { ItemObtain } from '@/lib/Items/Item'

import ToggleService from '@/setup/ToggleService'

import ShowStat from '@/components/common/show-stat.vue'

import {
  SearchModes,
  findObtainByDye,
  findStat,
  useItemQueryModes,
} from './setup'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { state, modes } = useItemQueryModes()

const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const originEquipment = computed(() => {
  return props.equipment.origin!
})

const obtainsDataConvert = (obtains: ItemObtain[]) => {
  const icons: Record<string, string> = {
    mobs: 'jam-box',
    boss: 'jam-box',
    mini_boss: 'jam-box',
    quest: 'mdi-script-outline',
    smith: 'ion-hammer',
    unknow: 'ri-file-unknow-line',
    other: 'gg-shape-rhombus',
    box: 'mdi-treasure-chest',
    exchange: 'bx-bx-shopping-bag',
    ex_skill: 'gg-shape-rhombus',
  }
  return obtains.map((item, idx) => {
    const type = t('common.Equipment.obtain.' + item.type)
    const icon = icons[item.type!] ?? ''
    const name =
      item.type !== 'smith'
        ? item.name
        : t('item-query.equipment-detail.production-equipment')
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

const obtainsDatas = computed(() =>
  obtainsDataConvert(originEquipment.value.obtains)
)

const firstObtain = computed(() => obtainsDatas.value[0] ?? null)

const previewStats = computed(() => {
  const currentStats = modes[SearchModes.Stat].currentStats
  if (state.currentMode !== SearchModes.Stat || currentStats.length === 0) {
    return null
  }
  return currentStats
    .map(stat => findStat(stat, props.equipment.stats))
    .filter(stat => stat) as StatRestriction[]
})

const dyeObtains = computed(() => {
  const obtain = findObtainByDye(
    modes[SearchModes.Dye].searchText,
    props.equipment
  )
  return obtainsDataConvert(obtain)
})

const recipeInfoValid = computed(() => {
  const recipe = originEquipment.value.recipe!
  return (
    props.equipment.creatable &&
    (recipe['item_level'] || recipe['item_difficulty'])
  )
})
</script>

<style lang="postcss" scoped>
.result-item {
  max-height: 70vh;
  overflow-y: auto;
  & + .result-item {
    border-top: 1px solid var(--app-primary-30);
  }
}

fieldset.result-item-row {
  padding: 1rem 0.8rem;
  border: 0;
  border-top: 0.1rem solid var(--app-orange-60);
  padding-top: 0.4rem;

  & > legend {
    @apply px-3 pt-1;
  }
}

fieldset.recipe {
  & .recipe-attr {
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--app-primary-30);
    display: inline-flex;
    margin-right: 0.3rem;
    margin-bottom: 0.3rem;
  }

  & > .recipe-materials {
    display: grid;
    grid-template-columns: 10rem 3rem;
    padding-left: 0.75rem;
  }
}
</style>
