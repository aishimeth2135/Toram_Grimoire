<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import type { StatRestriction } from '@/lib/Character/Stat'
import type { BagItemObtain, BagPotion } from '@/lib/Items/BagItem'

import CardRow from '@/components/card/card-row.vue'
import ShowStat from '@/components/common/show-stat.vue'
import ItemQueryDyeDisplay from '@/views/Items/ItemQuery/item-query-dye-display.vue'

import type { PreviewMode, StatOptionItem } from './setup'

interface Props {
  potion: BagPotion
  detailVisibleDefault: boolean
  previewStat: StatOptionItem | null
  previewMode: PreviewMode
}

const props = defineProps<Props>()

const { t } = useI18n()
const detailVisible = ref(false)

const recipeFields = ['item_level', 'item_difficulty', 'potential'] as const

const previewStats = computed<StatRestriction[]>(() => {
  const preview = props.previewStat
  if (!preview) {
    return []
  }

  return props.potion.stats
    .filter(stat => stat.base === preview.origin && stat.type === preview.type)
    .sort((stat1, stat2) => stat2.value - stat1.value)
})

const validObtains = computed<BagItemObtain[]>(() =>
  props.potion.obtains.filter(obtain => obtain.name || obtain.map || obtain.npc)
)

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
    raid: 'gg-shape-rhombus',
  }
  return obtains.map((item, idx) => {
    const type = t('common.Equipment.obtain.' + (item.type ?? 'unknown'))
    const icon = icons[item.type ?? 'unknown'] ?? icons.unknown
    const name = item.name
    const { map = null, dye = null } = item
    return {
      iid: idx,
      isDrop: ['mobs', 'boss', 'mini_boss'].includes(item.type!),
      type,
      name,
      nameSuffix: item.nameSuffix,
      npc: item.npc,
      map,
      dye,
      icon,
    }
  })
}

type ObtainData = ReturnType<typeof obtainsDataConvert>[number]

const obtainsDatas = computed<ObtainData[]>(() => obtainsDataConvert(validObtains.value))

watchEffect(() => {
  detailVisible.value = props.detailVisibleDefault
})
</script>

<template>
  <CardRow :selected="detailVisible">
    <div
      class="z-1 sticky top-0 min-w-max"
      :class="{ 'bg-white': detailVisible }"
      @click="detailVisible = !detailVisible"
    >
      <cy-list-item>
        <div
          class="gap-icon flex w-40 shrink-0 items-center py-0.5"
          :class="detailVisible ? 'text-red-70' : 'text-primary-90'"
        >
          <cy-icon icon="hugeicons:potion" />
          {{ potion.name }}
        </div>
        <div v-if="previewMode === 'default'" class="text-primary-50 text-sm">
          {{ potion.belongCategory.name }}
        </div>
        <div v-else-if="previewStats.length > 0">
          <div v-for="stat in previewStats" :key="stat.statId">
            <ShowStat :stat="stat" :negative-value="stat.value < 0" type="preview" />
          </div>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div
        v-if="detailVisible"
        class="relative max-w-full overscroll-none bg-white pb-3 pl-4 pr-3 pt-2"
      >
        <div class="content-row">
          <div class="flex">
            <div class="gap-icon text-primary-40 inline-flex items-center text-sm">
              <cy-icon
                icon="mdi:checkbox-multiple-blank-circle-outline"
                small
                class="text-primary-40"
              />
              {{ t('potion-query.content-titles.stats') }}
            </div>
          </div>
          <div class="pl-5.5">
            <div v-if="potion.stats.length !== 0" class="pb-3 pt-2">
              <ShowStat
                v-for="stat in potion.stats"
                :key="stat.statId"
                :stat="stat"
                :negative-value="stat.value < 0"
              />
            </div>
            <div v-else-if="potion.healInfo" class="py-2 pb-2.5">
              <span class="text-primary-50 text-sm">
                {{ t('potion-query.heal.' + potion.healInfo.type) }}
              </span>
              <span class="text-primary-70 ml-2">{{ potion.healInfo.amount }}</span>
            </div>
            <div v-else class="text-gray-40 py-3 text-sm">
              {{ t('potion-query.no-any-stat-tips') }}
            </div>
          </div>
        </div>
        <div v-if="potion.recipe">
          <div class="flex">
            <div class="gap-icon text-primary-40 inline-flex items-center text-sm">
              <cy-icon icon="ion-hammer" small class="text-primary-40" />
              {{ t('potion-query.recipe.title') }}
            </div>
          </div>
          <div class="py-3 pl-1.5">
            <div
              v-if="recipeFields.some(field => potion.recipe?.[field] !== undefined)"
              class="pb-3"
            >
              <template v-for="field in recipeFields" :key="field">
                <div v-if="potion.recipe[field] !== undefined" class="row-attr">
                  <span>{{ t('potion-query.recipe.' + field) }}</span>
                  <span class="text-primary-50 ml-2">{{ potion.recipe[field] }}</span>
                </div>
              </template>
            </div>
            <div class="pl-3">
              <div v-if="potion.recipe.cost !== undefined" class="flex items-center">
                <div class="flex w-40">
                  <div class="gap-icon text-primary-90 inline-flex items-center">
                    <cy-icon icon="la-coins" class="text-primary-30" />
                    {{ t('potion-query.recipe.cost') }}
                  </div>
                </div>
                <span class="text-primary-60">
                  {{ potion.recipe['cost'] + 's' }}
                </span>
              </div>
              <div
                v-for="material in potion.recipe['materials']"
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
        <div v-if="!potion.recipe || obtainsDatas.length !== 0">
          <div class="flex">
            <div class="gap-icon text-primary-40 inline-flex items-center text-sm">
              <cy-icon icon="bx-bx-search-alt" small class="text-primary-40" />
              {{ t('potion-query.content-titles.obtains') }}
            </div>
          </div>
          <div class="py-1.5 pl-5">
            <div v-if="obtainsDatas.length !== 0" class="divide-primary-20 -my-1 divide-y">
              <div v-for="data in obtainsDatas" :key="data.iid" class="px-1 pb-2 pt-1.5">
                <div class="flex items-center">
                  <div class="gap-icon text-primary-60 mr-2 inline-flex items-center text-sm">
                    <cy-icon :icon="data.icon" small class="text-primary-30" />
                    {{ data.type }}
                  </div>
                  <span class="text-primary-90">{{ data.name }}</span>
                  <span v-if="data.nameSuffix" class="text-primary-40 ml-1">
                    {{ data.nameSuffix }}
                  </span>
                  <span v-if="data.npc" class="text-primary-90 ml-2">{{ data.npc }}</span>
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
              {{ t('potion-query.no-any-obtain-tips') }}
            </div>
          </div>
        </div>
      </div>
    </cy-transition>
  </CardRow>
</template>

<style scoped>
@reference "@/tailwind.css";

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
