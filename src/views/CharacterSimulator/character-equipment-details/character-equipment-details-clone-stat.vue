<script lang="ts" setup>
import { Ref, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggleList } from '@/shared/setup/State'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'

import CardRow from '@/components/card/card-row.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import BrowseEquipmentsMain from '../browse-equipments/browse-equipments-main.vue'
import CommonSelectionIcon from '../common/common-selection-icon.vue'

interface Props {
  targetEquipment: CharacterEquipment
}

interface Emits {
  (evt: 'submit', stats: StatRestriction[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const current: Ref<CharacterEquipment | null> = ref(null)

const allStats: Ref<StatRestriction[]> = ref([])
const currentStats: Ref<StatRestriction[]> = ref([])

const currentPartStats = computed(() => {
  const validStats: StatRestriction[] = []
  const invalidStats: StatRestriction[] = []

  allStats.value.forEach(stat => {
    const valid = !props.targetEquipment.stats.some(_stat => _stat.equals(stat))
    ;(valid ? validStats : invalidStats).push(stat)
  })

  return {
    validStats,
    invalidStats,
  }
})

const { toggleItem, itemSelected } = useToggleList(currentStats)

watch(current, newValue => {
  if (newValue) {
    allStats.value = newValue.stats.slice()
    currentStats.value = currentPartStats.value.validStats.slice()
  } else {
    allStats.value = []
    currentStats.value = []
  }
})

const submit = () => {
  const stats = currentStats.value
    .filter(stat => currentPartStats.value.validStats.includes(stat))
    .map(stat => stat.clonePured())
  emit('submit', stats)
  current.value = null
}
</script>

<template>
  <div class="w-full wd-lg:flex">
    <div class="flex-shrink-0 px-2 pb-6 pt-2 wd-lg:mr-6 wd-lg:w-[20rem]">
      <CardRowsWrapper>
        <CardRows v-if="current">
          <CardRow
            v-for="stat in currentPartStats.validStats"
            :key="stat.statId"
            class="flex cursor-pointer items-center px-4 py-2"
            hover
            @click="toggleItem(stat)"
          >
            <CommonSelectionIcon :selected="itemSelected(stat)" />
            {{ stat.show() }}
          </CardRow>
          <CardRow
            v-for="stat in currentPartStats.invalidStats"
            :key="stat.statId"
            class="flex items-center px-4 py-2 text-gray-60 opacity-50"
          >
            <cy-icon icon="mdi:ban" class="mr-3" />
            {{ stat.show() }}
          </CardRow>
        </CardRows>
        <div v-else class="px-6 py-4 text-sm text-primary-40">
          <div class="mb-2">
            {{
              t(
                'character-simulator.equipment-basic-editor.edit-stats.clone-stats-caption-1'
              )
            }}
          </div>
          <div>
            {{
              t(
                'character-simulator.equipment-basic-editor.edit-stats.clone-stats-caption-2'
              )
            }}
          </div>
        </div>
      </CardRowsWrapper>
      <div class="mt-4 text-right">
        <cy-button-action
          icon="ic:round-done-outline"
          :disabled="currentStats.length === 0"
          @click="submit"
        >
          {{ t('global.confirm') }}
        </cy-button-action>
      </div>
    </div>
    <BrowseEquipmentsMain
      v-model:selected-equipment="current"
      class="flex-grow"
    />
  </div>
</template>
