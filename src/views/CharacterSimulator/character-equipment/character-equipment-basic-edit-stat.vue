<template>
  <cy-modal :visible="!!equipment" @close="emit('close')">
    <template #title>
      <cy-icon-text icon="mdi-rhombus-outline">
        {{ t('character-simulator.equipment-basic-editor.edit-stats.title') }}
      </cy-icon-text>
    </template>
    <template #default>
      <cy-title-input
        v-model:value="editStatsSearchText"
        icon="ic-outline-category"
        class="search-stat-input"
        :placeholder="t('character-simulator.equipment-basic-editor.edit-stats.search-placeholder')"
      />
      <template v-if="statsSearchResult.length !== 0">
        <cy-list-item
          v-for="stat in statsSearchResult"
          :key="stat.origin.statId(stat.type)"
          :selected="statOptionSelected(stat) !== ''"
          @click="toggleStatSelected(stat)"
        >
          <template v-if="statOptionSelected(stat) === '+'">
            <cy-icon-text icon="mdi-rhombus-outline" main-color="water-blue">
              {{ stat.text }}
            </cy-icon-text>
            <cy-icon-text
              icon="ic-round-add"
              icon-color="water-blue-light"
              class="ml-auto"
            />
          </template>
          <template v-else-if="statOptionSelected(stat) === '-'">
            <cy-icon-text icon="mdi-rhombus-outline" main-color="red">
              {{ stat.text }}
            </cy-icon-text>
            <cy-icon-text
              icon="ic-round-delete"
              icon-color="red-light"
              class="ml-auto"
            />
          </template>
          <cy-icon-text
            v-else-if="statOptionSelected(stat) === '#'"
            icon="mdi-rhombus-outline"
            text-color="purple"
          >
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text v-else icon="mdi-rhombus-outline">
            {{ stat.text }}
          </cy-icon-text>
        </cy-list-item>
      </template>
      <cy-default-tips v-else icon="potum" icon-src="custom">
        {{ t('character-simulator.main-tips.no-result') }}
      </cy-default-tips>
    </template>
    <template #footer>
      <div class="flex items-center justify-end">
        <cy-button-border icon="ic-round-done" @click="submit">
          {{ t('global.confirm') }}
        </cy-button-border>
        <cy-button-border icon="ic-round-close" @click="cancel">
          {{ t('global.cancel') }}
        </cy-button-border>
      </div>
    </template>
    <template #extra-content>
      <div class="space-y-3">
        <div class="p-4 bg-white border-1 border-light-2">
          <div>
            <cy-icon-text icon="ic-round-add" size="small" text-color="purple">
              {{ t('character-simulator.equipment-basic-editor.edit-stats.appended-stats') }}
            </cy-icon-text>
          </div>
          <div class="mt-2">
            <cy-list-item v-for="stat in currentStatOptions" :key="stat.origin.statId(stat.type)">
              <cy-icon-text>{{ stat.text }}</cy-icon-text>
            </cy-list-item>
          </div>
        </div>
        <div v-if="appendedStatOptions.length !== 0" class="p-4 bg-white border-1 border-light-2">
          <div>
            <cy-icon-text icon="ic-round-add" size="small" text-color="purple">
              {{ t('character-simulator.equipment-basic-editor.edit-stats.appended-stats') }}
            </cy-icon-text>
          </div>
          <div class="mt-2">
            <cy-list-item v-for="stat in appendedStatOptions" :key="stat.origin.statId(stat.type)">
              <cy-button-check selected main-color="water-blue">{{ stat.text }}</cy-button-check>
            </cy-list-item>
          </div>
        </div>
        <div v-if="removedStatOptions.length !== 0" class="p-4 bg-white border-1 border-light-2">
          <div>
            <cy-icon-text icon="ic-round-add" size="small" text-color="purple">
              {{ t('character-simulator.equipment-basic-editor.edit-stats.removed-stats') }}
            </cy-icon-text>
          </div>
          <div class="mt-2">
            <cy-list-item v-for="stat in removedStatOptions" :key="stat.origin.statId(stat.type)">
              <cy-button-check selected main-color="red">{{ stat.text }}</cy-button-check>
            </cy-list-item>
          </div>
        </div>
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { StatBase } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat/enums'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment | null;
}
interface Emits {
  (evt: 'close'): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

interface StatOption {
  origin: StatBase;
  text: string;
  type: StatTypes;
}
const statOptions = (() => {
  const stats: StatOption[] = []
  const statTypes = [StatTypes.Constant, StatTypes.Multiplier]
  Grimoire.Character.statList
    .filter(stat => !stat.hidden)
    .forEach(stat => {
      statTypes
        .filter(type => !(type === StatTypes.Multiplier && !stat.hasMultiplier))
        .forEach(type => {
          stats.push({
            origin: stat,
            text: stat.title(type),
            type,
          })
        })
    })
  return stats
})()

const editStatsSearchText = ref('')
const statsSearchResult = computed(() => statOptions.filter(option => option.text.includes(editStatsSearchText.value)))

const currentStatOptions = computed(() => {
  if (!props.equipment) {
    return []
  }
  const stats = props.equipment.stats
  return statOptions.filter(option => stats
    .some(stat => stat.baseName === option.origin.baseName && stat.type === option.type))
})

const appendedStatOptions = ref<StatOption[]>([])
const removedStatOptions = ref<StatOption[]>([])

const statOptionSelected = (option: StatOption) => {
  if (appendedStatOptions.value.includes(option)) {
    return '+'
  }
  if (removedStatOptions.value.includes(option)) {
    return '-'
  }
  if (currentStatOptions.value.includes(option)) {
    return '#'
  }
  return ''
}

const toggleStatSelected = (option: StatOption) => {
  let idx = appendedStatOptions.value.indexOf(option)
  if (idx > -1) {
    appendedStatOptions.value.splice(idx, 1)
    return
  }
  idx = removedStatOptions.value.indexOf(option)
  if (idx > -1) {
    removedStatOptions.value.splice(idx, 1)
    return
  }
  idx = currentStatOptions.value.indexOf(option)
  if (idx > -1) {
    removedStatOptions.value.push(option)
  } else {
    appendedStatOptions.value.push(option)
  }
}

const submit = () => {}
const cancel = () => {}
</script>
