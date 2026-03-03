<template>
  <CardRow :selected="detailVisible">
    <div
      class="z-1 sticky top-0 min-w-max"
      :class="{ 'bg-white': detailVisible }"
      @click="detailVisible = !detailVisible"
    >
      <cy-list-item>
        <div
          class="flex w-40 shrink-0 items-center py-0.5"
          :class="detailVisible ? 'text-red-70' : 'text-primary-90'"
        >
          <cy-icon :icon="crystal.crystalIconPath" class="mr-1.5" />
          {{ crystal.name }}
        </div>
        <div v-if="previewMode === 'default'" class="text-cyan-60 flex items-center text-sm">
          <template v-if="crystal.origin.enhancer">
            <cy-icon icon="mdi:arrow-up-bold-outline" small class="text-cyan-60 mr-2" />
            <cy-icon :icon="crystal.origin.crystalBaseIconPath" small class="mr-1" />
            {{ crystal.origin.enhancer }}
          </template>
        </div>
        <div v-if="previewMode === 'mode' && previewStats.length > 0">
          <div v-for="stat in previewStats" :key="stat.statId">
            <ShowStat :stat="stat" :negative-value="stat.value < 0" type="preview" />
          </div>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="max-w-full bg-white pb-3 pl-6 pr-4 pt-2">
        <div>
          <ShowStat
            v-for="stat in crystal.stats"
            :key="stat.statId"
            :stat="stat"
            :negative-value="stat.value < 0"
          />
        </div>
        <div v-if="crystal.origin.obtains.length > 0" class="mt-3 flex items-center">
          <cy-icon class="text-stone-40" icon="mdi:treasure-chest-outline" small />
          <span class="text-stone-40 ml-1 text-sm">
            {{ t('crystal-query.obtain-prefix') }}
          </span>
          <span class="text-primary-60 ml-2 text-sm">
            {{ crystal.origin.obtains[0].name }}
          </span>
        </div>
        <div v-if="crystal.origin.enhancer" class="mt-3 flex items-center">
          <cy-icon class="text-cyan-60" icon="mdi:arrow-up-bold-outline" small />
          <span class="ml-1 text-sm text-cyan-50">
            {{ t('crystal-query.enhancer-prefix') }}
          </span>
          <span class="text-cyan-60 ml-2 flex items-center text-sm">
            <cy-icon :icon="crystal.origin.crystalBaseIconPath" small class="mr-1" />
            {{ crystal.origin.enhancer }}
          </span>
        </div>
      </div>
    </cy-transition>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'

import CardRow from '@/components/card/card-row.vue'
import ShowStat from '@/components/common/show-stat.vue'

import type { StatOptionItem } from './setup'

interface Props {
  crystal: EquipmentCrystal
  detailVisibleDefault: boolean
  previewStat: StatOptionItem | null
  previewMode: 'default' | 'mode'
}

const props = defineProps<Props>()

const { t } = useI18n()

const detailVisible = ref(false)

const previewStats = computed(() => {
  if (!props.previewStat) {
    return []
  }
  const preview = props.previewStat
  return props.crystal.stats
    .filter(stat => stat.base === preview.origin && stat.type === preview.type)
    .sort((stat1, stat2) => stat2.value - stat1.value)
})

watch(
  computed(() => props.detailVisibleDefault),
  value => {
    detailVisible.value = value
  },
  { immediate: true }
)
</script>
