<template>
  <div>
    <div
      class="flex cursor-pointer items-center py-1.5 pl-1 pr-3 duration-200 hover:bg-primary-5"
      @click="unfold = !unfold"
    >
      <cy-button-radio :selected="isCurrent" @click.stop="emit('select-result', result)" />
      <cy-icon-text icon="ant-design:star-outlined" color="blue" class="ml-4">
        {{ getSuccessRateDisplay(result) }}
      </cy-icon-text>
      <cy-icon-text icon="ic:round-numbers" color="blue-fuchsia-60" class="ml-4">
        {{ result.operationStepsQuantity }}
      </cy-icon-text>
      <cy-icon
        :icon="unfold ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
        class="ml-auto"
      />
    </div>
    <div v-if="unfold" class="mx-3 mb-4 mt-0.5 rounded-sm border-1 border-primary-30 p-3">
      <EnchantResult :equipment="result" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { EnchantEquipment } from '@/lib/Enchant/Enchant'

import EnchantResult from '../EnchantSimulator/enchant-result.vue'

import { getSuccessRateDisplay } from '../EnchantSimulator/utils'

interface Props {
  result: EnchantEquipment
  isCurrent: boolean
}
interface Emits {
  (evt: 'select-result', result: EnchantEquipment): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const unfold = ref(false)
</script>
