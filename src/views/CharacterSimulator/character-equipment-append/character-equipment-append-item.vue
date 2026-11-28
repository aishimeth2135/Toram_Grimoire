<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { equipmentOriginalCategoryToType } from '@/lib/Character/CharacterEquipment'
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
          <cy-icon v-if="!equipment.unknownCategory" :icon="equimentImage" />
          <cy-icon v-else icon="eva-star-outline" />
          <div class="mr-2.5 ml-2 w-32 truncate">
            {{ equipment.name }}
          </div>
          <div v-if="previewStat" :class="previewStat.value > 0 ? 'text-cyan-70' : 'text-red-40'">
            {{ previewStat.showValue() }}
          </div>
          <div v-else-if="!equipment.unknownCategory" class="flex items-center">
            <cy-icon :icon="equipment.isWeapon() ? 'mdi:sword' : 'mdi:shield-outline'" />
            <span class="text-primary-80 ml-1.5">
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
      class="bg-orange-20/5 relative mt-2.5 max-w-max overscroll-none py-3 pr-4 pl-6 shadow-xs"
    >
      <div class="mb-1 flex items-center text-sm">
        <cy-icon v-if="!equipment.unknownCategory" :icon="equimentImage" small />
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
      <div v-else class="text-gray-40 text-sm">
        {{ t('item-query.equipment-detail.no-any-stat-tips') }}
      </div>
    </div>
  </CardRow>
</template>
