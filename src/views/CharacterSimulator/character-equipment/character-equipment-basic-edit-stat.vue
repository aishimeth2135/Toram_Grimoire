<template>
  <cy-modal
    :visible="visible"
    :title="t('character-simulator.equipment-basic-editor.edit-stats.title')"
    title-icon="mdi-rhombus-outline"
    footer
    @close="emit('close')"
  >
    <template #default>
      <div class="sticky top-0">
        <cy-title-input
          v-model:value="editStatsSearchText"
          icon="ic-outline-category"
          class="search-stat-input"
          :placeholder="
            t(
              'character-simulator.equipment-basic-editor.edit-stats.search-placeholder'
            )
          "
        />
      </div>
      <template v-if="statsSearchResult.length !== 0">
        <cy-list-item
          v-for="stat in statsSearchResult"
          :key="stat.origin.statId(stat.type)"
          :selected="statOptionSelected(stat) !== ''"
          @click="toggleStatSelected(stat)"
        >
          <template v-if="statOptionSelected(stat) === '+'">
            <cy-icon-text icon="mdi-rhombus-outline" color="blue">
              {{ stat.text }}
            </cy-icon-text>
            <cy-icon-text
              icon="ic-round-add"
              icon-color="blue-30"
              class="ml-auto"
            />
          </template>
          <template v-else-if="statOptionSelected(stat) === '-'">
            <cy-icon-text icon="mdi-rhombus-outline" color="red">
              {{ stat.text }}
            </cy-icon-text>
            <cy-icon-text
              icon="ic-round-delete"
              icon-color="red-30"
              class="ml-auto"
            />
          </template>
          <cy-icon-text
            v-else-if="statOptionSelected(stat) === '#'"
            icon="mdi-rhombus-outline"
            text-color="fuchsia-60"
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
      <div class="flex w-full items-center justify-end">
        <cy-button-action icon="ic-round-done" @click="submit">
          {{ t('global.confirm') }}
        </cy-button-action>
        <cy-button-action icon="ic-round-close" @click="cancel">
          {{ t('global.cancel') }}
        </cy-button-action>
      </div>
    </template>
    <template #extra-content>
      <div class="space-y-3">
        <div class="border-1 border-primary-30 bg-white p-3">
          <div>
            <cy-icon-text
              icon="carbon:location-current"
              small
              text-color="fuchsia-60"
            >
              {{
                t(
                  'character-simulator.equipment-basic-editor.edit-stats.current-stats'
                )
              }}
            </cy-icon-text>
          </div>
          <div class="mt-2">
            <cy-list-item
              v-for="stat in currentStatOptions"
              :key="stat.origin.statId(stat.type)"
              @click="toggleStatSelected(stat)"
            >
              <cy-button-check
                :selected="!removedStatOptions.includes(stat)"
                color="orange"
                inline
              >
                {{ stat.text }}
              </cy-button-check>
            </cy-list-item>
          </div>
        </div>
        <div
          v-if="appendedStatOptions.length !== 0"
          class="border-1 border-primary-30 bg-white p-3"
        >
          <div>
            <cy-icon-text icon="ic-round-add" small text-color="fuchsia-60">
              {{
                t(
                  'character-simulator.equipment-basic-editor.edit-stats.appended-stats'
                )
              }}
            </cy-icon-text>
          </div>
          <div class="mt-2">
            <cy-list-item
              v-for="stat in appendedStatOptions"
              :key="stat.origin.statId(stat.type)"
              @click="toggleStatSelected(stat)"
            >
              <cy-button-check selected color="blue" inline>{{
                stat.text
              }}</cy-button-check>
            </cy-list-item>
          </div>
        </div>
        <div
          v-if="removedStatOptions.length !== 0"
          class="border-1 border-primary-30 bg-white p-3"
        >
          <div>
            <cy-icon-text icon="ic-round-delete" small text-color="fuchsia-60">
              {{
                t(
                  'character-simulator.equipment-basic-editor.edit-stats.removed-stats'
                )
              }}
            </cy-icon-text>
          </div>
          <div class="mt-2">
            <cy-list-item
              v-for="stat in removedStatOptions"
              :key="stat.origin.statId(stat.type)"
              @click="toggleStatSelected(stat)"
            >
              <cy-button-check selected color="red" inline>{{
                stat.text
              }}</cy-button-check>
            </cy-list-item>
          </div>
        </div>
      </div>
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { Ref, computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatBase, StatRestriction } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'

import Notify from '@/setup/Notify'

interface Props {
  visible: boolean
  equipment: CharacterEquipment | null
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { equipment } = toRefs(props)

const { t } = useI18n()
const { notify } = Notify()

interface StatOption {
  origin: StatBase
  text: string
  type: StatTypes
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
const statsSearchResult = computed(() =>
  statOptions.filter(option => option.text.includes(editStatsSearchText.value))
)

const currentStatOptions = computed(() => {
  if (!equipment.value) {
    return []
  }
  const stats = equipment.value.stats
  return statOptions.filter(option =>
    stats.some(
      stat => stat.baseId === option.origin.baseId && stat.type === option.type
    )
  )
})

const appendedStatOptions: Ref<StatOption[]> = ref([])
const removedStatOptions: Ref<StatOption[]> = ref([])

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

const isElementStat = (id: string) =>
  CharacterEquipment.elementStatIds.includes(id)

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

const realCurrentStatOptions = computed(() => {
  const currnet = currentStatOptions.value.filter(
    option => !removedStatOptions.value.includes(option)
  )
  return [...currnet, ...appendedStatOptions.value]
})

const submit = () => {
  if (!equipment.value) {
    return
  }
  if (
    realCurrentStatOptions.value.filter(_option =>
      isElementStat(_option.origin.baseId)
    ).length > 1
  ) {
    notify(
      t('character-simulator.equipment-basic-editor.only-one-element-stat-tips')
    )
    return
  }
  const stats = equipment.value.stats
  removedStatOptions.value.forEach(option => {
    const stat = equipment.value!.findStat(option.origin.baseId, option.type)!
    const idx = stats.indexOf(stat)
    stats.splice(idx, 1)
  })
  appendedStatOptions.value.forEach(option => {
    const value = option.origin.checkBoolStat() ? 1 : 0
    const stat = StatRestriction.from(
      option.origin.createStat(option.type, value)
    )
    stats.push(stat)
  })
  removedStatOptions.value = []
  appendedStatOptions.value = []
  emit('close')
}
const cancel = () => {
  removedStatOptions.value = []
  appendedStatOptions.value = []
  emit('close')
}
</script>
