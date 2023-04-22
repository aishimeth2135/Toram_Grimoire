<template>
  <CardRow :selected="contents.detail">
    <div class="sticky top-0 z-1 min-w-max">
      <div
        class="flex cursor-pointer items-center px-3.5 py-2.5 duration-150 hover:bg-primary-5"
        :class="{ 'bg-white': contents.detail }"
        @click="toggle('contents/detail')"
      >
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
            :text-color="contents.detail ? 'primary-70' : 'primary-90'"
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
              <cy-icon-text icon="mdi-sword" text-color="primary-30">
                ATK
              </cy-icon-text>
              <span class="text-primary-70">{{ equipment.basicValue }}</span>
              <span class="border-l border-blue-50 pl-2 text-blue-50">
                {{ equipment.stability }}%
              </span>
            </template>
            <template v-else-if="equipment.is(EquipmentKinds.Armor)">
              <cy-icon-text icon="mdi:shield-outline" text-color="primary-30">
                DEF
              </cy-icon-text>
              <span class="text-primary-70">{{ equipment.basicValue }}</span>
            </template>
            <template v-else-if="originEquipment.unknowCategory">
              <cy-icon-text icon="mdi-ghost" text-color="primary-30">
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
            <span class="ml-2 text-blue-60">
              {{ originEquipment.recipe['item_level'] }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <cy-transition>
      <div
        v-if="contents.detail"
        class="overscroll-none relative max-w-full bg-white pb-3 pl-4 pr-3 pt-2"
      >
        <div v-if="originEquipment.extra" class="mb-2">
          <cy-icon-text
            v-if="originEquipment.extra['caption']"
            icon="ic-outline-info"
            small
            text-color="red-50"
          >
            {{ originEquipment.extra['caption'] }}
          </cy-icon-text>
        </div>
        <div class="content-row">
          <div class="flex">
            <cy-icon-text
              color="primary-40"
              single-color
              small
              icon="mdi:checkbox-multiple-blank-circle-outline"
            >
              {{ t('item-query.equipment-detail.content-titles.stats') }}
            </cy-icon-text>
          </div>
          <div class="py-3 pl-5">
            <div class="row-attr">
              <span>
                {{ t('item-query.equipment-detail.equipment-type') }}
              </span>
              <span class="ml-2 flex items-center">
                <cy-icon-text
                  v-if="originEquipment.unknowCategory"
                  icon="mdi-ghost"
                  small
                />
                <cy-icon-text
                  v-else
                  :icon="equipment.getCategoryImagePath()"
                  icon-src="image"
                  small
                />
                <span class="ml-1 text-primary-50">
                  {{ originEquipment.unknowCategory || equipment.categoryText }}
                </span>
              </span>
            </div>
            <template v-if="equipment.is(EquipmentKinds.Weapon)">
              <div class="row-attr">
                <span>ATK</span>
                <span class="ml-2 text-primary-50">
                  {{ equipment.basicValue }}
                </span>
              </div>
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.stability') }}
                </span>
                <span class="ml-2 text-blue-50">
                  {{ equipment.stability }}%
                </span>
              </div>
            </template>
            <template v-else-if="equipment.is(EquipmentKinds.Armor)">
              <div class="row-attr">
                <span>DEF</span>
                <span class="ml-2 text-primary-50">
                  {{ equipment.basicValue }}
                </span>
              </div>
            </template>
            <div class="py-3">
              <template v-if="equipment.stats.length !== 0">
                <ShowStat
                  v-for="stat in equipment.stats"
                  :key="stat.statId"
                  :stat="stat"
                  :negative-value="stat.value < 0"
                />
              </template>
              <div v-else class="text-sm text-gray-40">
                {{ t('item-query.equipment-detail.no-any-stat-tips') }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="originEquipment.recipe">
          <div class="flex">
            <cy-icon-text
              icon="ion-hammer"
              small
              color="primary-40"
              single-color
            >
              {{ t('item-query.equipment-detail.content-titles.recipe') }}
            </cy-icon-text>
          </div>
          <div class="py-3 pl-5">
            <div
              v-if="
                originEquipment.recipe['item_level'] ||
                originEquipment.recipe['item_difficulty']
              "
              class="pb-3"
            >
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-level') }}
                </span>
                <span class="ml-2 text-primary-50">
                  {{ originEquipment.recipe['item_level'] || '?' }}
                </span>
              </div>
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-difficulty') }}
                </span>
                <span class="ml-2 text-primary-50">
                  {{ originEquipment.recipe['item_difficulty'] || '?' }}
                </span>
              </div>
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.recipe.base-potential') }}
                </span>
                <span class="ml-2 text-primary-50">
                  {{ originEquipment.recipe['potential'] || '?' }}
                </span>
              </div>
            </div>
            <div class="pb-3 pl-3">
              <div
                v-if="originEquipment.recipe['cost']"
                class="flex items-center"
              >
                <div class="flex w-40">
                  <cy-icon-text icon="la-coins">
                    {{ t('item-query.equipment-detail.recipe.spina') }}
                  </cy-icon-text>
                </div>
                <span class="text-primary-60">
                  {{ originEquipment.recipe['cost'] + 's' }}
                </span>
              </div>
              <div
                v-for="material in originEquipment.recipe['materials']"
                :key="material.name"
                class="flex items-center"
              >
                <div class="flex w-40">
                  <cy-icon-text icon="mdi-cube-outline">
                    {{ material.name }}
                  </cy-icon-text>
                </div>
                <span class="text-primary-60">
                  {{ '×' + material.quantity }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="flex">
            <cy-icon-text
              icon="bx-bx-search-alt"
              small
              color="primary-40"
              single-color
            >
              {{ t('item-query.equipment-detail.content-titles.obtains') }}
            </cy-icon-text>
          </div>
          <div class="py-1.5 pl-5">
            <div
              v-if="obtainsDatas.length !== 0"
              class="-my-1 divide-y divide-primary-20"
            >
              <div
                v-for="data in obtainsDatas"
                :key="data.iid"
                class="px-1 pb-2 pt-1.5"
              >
                <div class="flex items-center">
                  <cy-icon-text
                    :icon="data.icon"
                    class="mr-2"
                    small
                    text-color="primary-60"
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
                    color="gray-50"
                    small
                  >
                    {{ data.map }}
                  </cy-icon-text>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-40">
              {{ t('item-query.equipment-detail.no-any-obtain-tips') }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="state.currentMode === SearchModes.Dye"
        class="mb-3 ml-4 border-l-2 border-solid border-primary-30 pl-2"
      >
        <div class="divide-y divide-primary-20">
          <div
            v-for="item in dyeObtains"
            :key="item.iid"
            class="px-1 pb-2 pt-1.5"
          >
            <div class="flex items-center">
              <cy-icon-text
                :icon="item.icon"
                class="mr-2"
                small
                text-color="primary-60"
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
                color="gray-50"
                small
              >
                {{ item.map }}
              </cy-icon-text>
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentKinds } from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'
import { BagItemObtain } from '@/lib/Items/BagItem'

import ToggleService from '@/setup/ToggleService'

import CardRow from '@/components/card/card-row.vue'
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

const obtainsDataConvert = (obtains: BagItemObtain[]) => {
  const icons: Record<string, string> = {
    mobs: 'jam-box',
    boss: 'jam-box',
    mini_boss: 'jam-box',
    quest: 'mdi-script-outline',
    smith: 'ion-hammer',
    unknown: 'ri-file-unknown-line',
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
</script>

<style lang="postcss" scoped>
.result-item {
  max-height: 70vh;
  overflow-y: auto;
}

.row-attr {
  @apply mb-1 mr-2.5 inline-flex border-1 border-primary-20 px-3 py-1 text-sm;

  & > span:first-child {
    @apply text-gray-50;
  }
}
</style>
