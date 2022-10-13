<template>
  <div>
    <div
      class="min-w-max sticky top-0 z-1"
      :class="{ 'bg-white': detailVisible }"
      @click="detailVisible = !detailVisible"
    >
      <cy-list-item>
        <div class="flex w-40 flex-shrink-0 py-0.5">
          <cy-icon-text
            :icon="crystal.crystalIconPath"
            icon-src="image"
            :text-color="detailVisible ? 'orange-60' : 'primary-90'"
          >
            {{ crystal.name }}
          </cy-icon-text>
        </div>
        <div
          v-if="previewMode === 'default'"
          class="flex items-center space-x-2"
        >
          <template v-if="crystal.origin.enhancer">
            <cy-icon-text icon="mdi:arrow-up-bold-outline" small color="cyan">
              {{ crystal.origin.enhancer }}
            </cy-icon-text>
            <cy-icon-text
              v-if="crystal.origin.enhancer"
              :icon="crystal.origin.crystalBaseIconPath"
              icon-src="image"
              ize="small"
            />
          </template>
        </div>
        <div v-if="previewMode === 'mode' && previewStats.length > 0">
          <div v-for="stat in previewStats" :key="stat.statId">
            <ShowStat
              :stat="stat"
              :negative-value="stat.value < 0"
              type="preview"
            />
          </div>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="max-w-full bg-white pt-2 pb-3 pl-6 pr-4">
        <div>
          <ShowStat
            v-for="stat in crystal.stats"
            :key="stat.statId"
            :stat="stat"
            :negative-value="stat.value < 0"
          />
        </div>
        <div v-if="crystal.origin.enhancer" class="mt-3 flex items-center">
          <cy-icon-text
            icon="mdi:arrow-up-bold-outline"
            small
            icon-color="cyan-60"
            text-color="primary-30"
          >
            {{ t('crystal-query.enhancer-pretext') }}
          </cy-icon-text>
          <span class="ml-0.5 text-sm text-cyan-60">{{
            crystal.origin.enhancer
          }}</span>
        </div>
      </div>
    </cy-transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'

import ShowStat from '@/components/common/show-stat.vue'

import { StatOptionItem } from './setup'

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
