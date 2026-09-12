<template>
  <CardRow :selected="detailVisible">
    <div class="z-1 sticky top-0 min-w-max">
      <div
        class="hover:bg-primary-5 flex cursor-pointer items-center px-3.5 py-2.5 duration-150"
        :class="{ 'bg-white': detailVisible }"
        @click="toggleDetailVisible"
      >
        <div class="flex w-full items-start">
          <div class="mr-2 flex w-48 shrink-0 leading-5">
            <cy-icon
              :icon="
                !equipment.is(EquipmentKinds.Avatar)
                  ? equipment.getCategoryImagePath()
                  : equipment.categoryIcon
              "
            />
            <div class="ml-2">
              {{ equipment.name }}
              <cy-icon
                v-if="firstObtain && firstObtain.isDrop"
                icon="jam-box"
                class="text-orange-60 ml-2"
              />
            </div>
          </div>
          <div
            v-if="
              state.currentMode === 'normal' ||
              state.currentMode === 'dye' ||
              state.displayMode === 'current-mode'
            "
            class="flex items-center space-x-2 text-sm"
          >
            <template v-if="equipment.is(EquipmentKinds.Weapon)">
              <cy-icon icon="mdi-sword" small />
              <span class="text-primary-70">{{ equipment.basicValue }}</span>
              <div class="border-gray-20 h-4 border-l"></div>
              <span class="text-blue-50"> {{ equipment.stability }}% </span>
            </template>
            <template v-else-if="equipment.is(EquipmentKinds.Armor)">
              <cy-icon icon="mdi:shield-outline" small />
              <span class="text-primary-70">{{ equipment.basicValue }}</span>
            </template>
            <template v-else-if="originEquipment.unknowCategory">
              <div class="gap-icon text-primary-30 inline-flex items-center">
                <cy-icon icon="mdi-ghost" class="text-primary-30" small />
                {{ originEquipment.unknowCategory }}
              </div>
            </template>
          </div>
          <div v-else-if="state.currentMode === 'stat'">
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
            v-else-if="state.currentMode === 'item-level' && originEquipment.recipe"
            class="flex items-center text-sm"
          >
            <div class="gap-icon text-primary-30 inline-flex items-center">
              <cy-icon icon="jam-hammer" class="text-primary-30" small />
              {{ t('item-query.equipment-detail.recipe.item-level') }}
            </div>
            <span class="text-blue-60 ml-2">
              {{ originEquipment.recipe['item_level'] }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <cy-transition>
      <div
        v-if="detailVisible"
        class="relative max-w-full overscroll-none bg-white pb-3 pl-4 pr-3 pt-2"
      >
        <div v-if="originEquipment.extra" class="mb-2">
          <div
            v-if="originEquipment.extra['caption']"
            class="gap-icon inline-flex items-center text-sm text-red-50"
          >
            <cy-icon icon="ic-outline-info" small class="text-primary-30" />
            {{ originEquipment.extra['caption'] }}
          </div>
        </div>
        <div class="content-row">
          <div class="flex">
            <div class="gap-icon text-primary-40 inline-flex items-center text-sm">
              <cy-icon
                icon="mdi:checkbox-multiple-blank-circle-outline"
                small
                class="text-primary-40"
              />
              {{ t('item-query.equipment-detail.content-titles.stats') }}
            </div>
          </div>
          <div class="py-3 pl-5">
            <div class="row-attr">
              <span>
                {{ t('item-query.equipment-detail.equipment-type') }}
              </span>
              <span class="ml-2 flex items-center">
                <cy-icon
                  :icon="
                    !originEquipment.unknowCategory ? equipment.getCategoryImagePath() : 'mdi-ghost'
                  "
                  small
                />
                <span class="text-primary-50 ml-1">
                  {{ originEquipment.unknowCategory || equipment.typeText }}
                </span>
              </span>
            </div>
            <template v-if="equipment.is(EquipmentKinds.Weapon)">
              <div class="row-attr">
                <span>ATK</span>
                <span class="text-primary-50 ml-2">
                  {{ equipment.basicValue }}
                </span>
              </div>
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.stability') }}
                </span>
                <span class="ml-2 text-blue-50"> {{ equipment.stability }}% </span>
              </div>
            </template>
            <template v-else-if="equipment.is(EquipmentKinds.Armor)">
              <div class="row-attr">
                <span>DEF</span>
                <span class="text-primary-50 ml-2">
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
              <div v-else class="text-gray-40 text-sm">
                {{ t('item-query.equipment-detail.no-any-stat-tips') }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="originEquipment.recipe">
          <div class="flex">
            <div class="gap-icon text-primary-40 inline-flex items-center text-sm">
              <cy-icon icon="ion-hammer" small class="text-primary-40" />
              {{ t('item-query.equipment-detail.content-titles.recipe') }}
            </div>
          </div>
          <div class="py-3 pl-1.5">
            <div
              v-if="
                originEquipment.recipe['item_level'] || originEquipment.recipe['item_difficulty']
              "
              class="pb-3"
            >
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-level') }}
                </span>
                <span class="text-primary-50 ml-2">
                  {{ originEquipment.recipe['item_level'] || '?' }}
                </span>
              </div>
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.recipe.item-difficulty') }}
                </span>
                <span class="text-primary-50 ml-2">
                  {{ originEquipment.recipe['item_difficulty'] || '?' }}
                </span>
              </div>
              <div class="row-attr">
                <span>
                  {{ t('item-query.equipment-detail.recipe.base-potential') }}
                </span>
                <span class="text-primary-50 ml-2">
                  {{ originEquipment.recipe['potential'] || '?' }}
                </span>
              </div>
            </div>
            <div class="pb-3 pl-3">
              <div v-if="originEquipment.recipe['cost']" class="flex items-center">
                <div class="flex w-40">
                  <div class="gap-icon text-primary-90 inline-flex items-center">
                    <cy-icon icon="la-coins" class="text-primary-30" />
                    {{ t('item-query.equipment-detail.recipe.spina') }}
                  </div>
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
                  <div class="gap-icon text-primary-90 inline-flex items-center">
                    <cy-icon icon="mdi-cube-outline" class="text-primary-30" />
                    {{ material.name }}
                  </div>
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
            <div class="gap-icon text-primary-40 inline-flex items-center text-sm">
              <cy-icon icon="bx-bx-search-alt" small class="text-primary-40" />
              {{ t('item-query.equipment-detail.content-titles.obtains') }}
            </div>
          </div>
          <div class="py-1.5 pl-4">
            <div v-if="obtainsDatas.length !== 0" class="divide-primary-20 -my-1 divide-y">
              <div v-for="data in obtainsDatas" :key="data.iid" class="px-1 pb-2 pt-1.5">
                <div class="flex items-center">
                  <div class="gap-icon text-primary-60 mr-2 inline-flex items-center text-sm">
                    <cy-icon :icon="data.icon" small class="text-primary-30" />
                    {{ data.type }}
                  </div>
                  <span class="text-primary-90">{{ data.name }}</span>
                </div>
                <div v-if="data.dye || data.map" class="mt-1 flex items-center">
                  <ItemQueryDyeDisplay v-if="data.dye" :dye="data.dye" />
                  <div
                    v-if="data.map"
                    class="gap-icon ml-3 inline-flex shrink-0 items-center text-sm text-gray-50"
                  >
                    <cy-icon icon="ic-outline-map" small class="text-gray-20" />
                    {{ data.map }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-40 text-sm">
              {{ t('item-query.equipment-detail.no-any-obtain-tips') }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="state.currentMode === 'dye'"
        class="border-primary-60 ml-5.5 mb-2 border-l pl-2"
      >
        <div class="divide-primary-20 divide-y">
          <div v-for="item in dyeObtains" :key="item.iid" class="px-1 pb-2 pt-1.5">
            <div class="flex items-center">
              <div class="gap-icon text-primary-60 mr-2 inline-flex items-center text-sm">
                <cy-icon :icon="item.icon" small class="text-primary-30" />
                {{ item.type }}
              </div>
              <span class="text-primary-90">{{ item.name }}</span>
            </div>
            <div class="mt-1 flex items-center">
              <ItemQueryDyeDisplay v-if="item.dye" :dye="item.dye" />
              <div
                v-if="item.map"
                class="text-gray-60 ml-3 inline-flex shrink-0 items-center gap-1 text-sm"
              >
                <cy-icon icon="ic-outline-map" small class="text-gray-40" />
                {{ item.map }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggle } from '@/shared/setup/State'

import { CharacterEquipment, EquipmentKinds } from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'
import { type BagItemObtain } from '@/lib/Items/BagItem'

import CardRow from '@/components/card/card-row.vue'
import ShowStat from '@/components/common/show-stat.vue'

import ItemQueryDyeDisplay from './item-query-dye-display.vue'

import { useDyeSearchMode } from './modes/dye'
import { useStatSearchMode } from './modes/stat'
import { findObtainByDye, findStat, useItemQueryState } from './setup'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { state } = useItemQueryState()
const statMode = useStatSearchMode()
const dyeMode = useDyeSearchMode()

const { t } = useI18n()

const detailVisible = ref(false)
const toggleDetailVisible = useToggle(detailVisible)

const originEquipment = computed(() => props.equipment.origin!)

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
      item.type !== 'smith' ? item.name : t('item-query.equipment-detail.production-equipment')
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
  const currentStats = statMode.state.currentStats
  if (state.currentMode !== 'stat' || currentStats.length === 0) {
    return null
  }
  return currentStats
    .map(stat => findStat(stat, props.equipment.stats))
    .filter(stat => stat) as StatRestriction[]
})

const dyeObtains = computed(() => {
  const obtain = findObtainByDye(dyeMode.state.searchText, props.equipment)
  return obtainsDataConvert(obtain)
})
</script>

<style scoped>
@reference "@/tailwind.css";

.result-item {
  max-height: 70vh;
  overflow-y: auto;
}

.row-attr {
  display: inline-flex;
  margin-right: --spacing(2.5);
  margin-bottom: --spacing(1);
  border-width: 2px;
  border-color: var(--color-primary-20);
  padding-inline: --spacing(3);
  padding-block: --spacing(1);
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);

  & > span:first-child {
    color: var(--color-gray-50);
  }
}
</style>
