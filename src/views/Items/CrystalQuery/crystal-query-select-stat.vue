<template>
  <cy-modal
    :visible="visible"
    :title="t('crystal-query.select-stat.title')"
    @close="emit('close')"
  >
    <div class="mb-3 sticky top-0">
      <cy-title-input
        v-model:value="searchText"
        icon="ic:baseline-search"
      />
    </div>
    <div>
      <cy-list-item
        v-for="option in searchResult"
        :key="option.origin.statId(option.type)"
        :selected="!!selectedStatItem && selectedStatItem.origin === option.origin && selectedStatItem.type === option.type"
        @click="selectStat(option)"
      >
        <cy-icon-text icon="mdi-rhombus-outline">
          {{ option.text }}
        </cy-icon-text>
      </cy-list-item>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { StatTypes } from '@/lib/Character/Stat/enums'

import { StatOptionItem } from './setup'

interface Props {
  visible: boolean;
  selectedStatItem: StatOptionItem | null;
}
interface Emits {
  (evt: 'close'): void;
  (evt: 'update:selected-stat-item', statOptionItem: StatOptionItem): void;
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const statOptions: StatOptionItem[] = []
const statTypes = [StatTypes.Constant, StatTypes.Multiplier]
Grimoire.Character.statList.forEach(stat => {
  if (stat.hidden) {
    return
  }
  statTypes.forEach(type => {
    if (type === StatTypes.Multiplier && !stat.hasMultiplier) {
      return
    }
    statOptions.push({
      origin: stat,
      type,
      text: stat.title(type),
    })
  })
})

const searchText = ref('')

const searchResult = computed(() => {
  const _searchText = searchText.value.toLowerCase()
  return statOptions.filter(option => option.text.toLowerCase().includes(_searchText))
})

const selectStat = (option: StatOptionItem) => {
  emit('update:selected-stat-item', option)
  emit('close')
}
</script>
