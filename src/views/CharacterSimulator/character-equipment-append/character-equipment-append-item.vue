<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { equipmentOriginalCategoryToType } from '@/lib/Character/CharacterEquipment/utils'
import { StatRestriction } from '@/lib/Character/Stat'
import { BagEquipment } from '@/lib/Items/BagItem'

import CardRow from '@/components/card/card-row.vue'
import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  equipment: BagEquipment
  previewStat: StatRestriction | null
}
interface Emits {
  (evt: 'submit', equipment: BagEquipment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showDetail = ref(false)

const equimentImage = computed(() => {
  const type = equipmentOriginalCategoryToType(props.equipment)
  return CharacterEquipment.getImagePath(type)
})

const { t } = useI18n()
</script>

<template>
  <CardRow class="py-2.5">
    <div class="sticky top-0 z-1 min-w-max pr-3.5">
      <div class="flex items-center">
        <div
          class="mr-3 flex cursor-pointer items-center pl-3.5"
          @click="emit('submit', equipment)"
        >
          <cy-icon icon="ic:round-add" class="mr-3.5" />
          <cy-icon v-if="!equipment.unknowCategory" :icon="equimentImage" />
          <cy-icon v-else icon="eva-star-outline" />
          <div class="ml-2 mr-2.5 w-32 overflow-hidden text-ellipsis whitespace-nowrap">
            {{ equipment.name }}
          </div>
          <div v-if="previewStat" :class="previewStat.value > 0 ? 'text-cyan-70' : 'text-red-40'">
            {{ previewStat.showValue() }}
          </div>
          <div v-else-if="!equipment.unknowCategory" class="flex items-center">
            <cy-icon :icon="equipment.isWeapon() ? 'mdi:sword' : 'mdi:shield-outline'" />
            <span class="ml-1.5 text-primary-80">
              {{ equipment.baseValue }}
            </span>
          </div>
        </div>
        <cy-button-icon
          :icon="showDetail ? 'mdi:chevron-up-circle-outline' : 'mdi:chevron-down-circle-outline'"
          class="ml-auto"
          @click="showDetail = !showDetail"
        />
      </div>
    </div>
    <div
      v-if="showDetail"
      class="overscroll-none shadow-xs bg-orange-20/5 relative mt-2.5 max-w-max py-3 pl-6 pr-4"
    >
      <div class="mb-1 flex items-center text-sm">
        <cy-icon v-if="!equipment.unknowCategory" :icon="equimentImage" small />
        <cy-icon v-else icon="eva-star-outline" small />
        <div class="ml-1.5">
          {{ equipment.name }}
        </div>
      </div>
      <div v-if="equipment.stats.length !== 0">
        <ShowStat
          v-for="stat in equipment.stats"
          :key="stat.statId"
          :stat="stat"
          :negative-value="stat.value < 0"
          class="text-sm"
        />
      </div>
      <div v-else class="text-sm text-gray-40">
        {{ t('item-query.equipment-detail.no-any-stat-tips') }}
      </div>
    </div>
  </CardRow>
</template>
