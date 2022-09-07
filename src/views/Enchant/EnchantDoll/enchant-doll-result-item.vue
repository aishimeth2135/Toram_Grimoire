<template>
  <div>
    <div
      class="flex items-center py-1 pl-1 pr-3 duration-200 hover:bg-primary-5 cursor-pointer"
      @click="unfold = !unfold"
    >
      <cy-button-radio :selected="isCurrent" @click.stop="emit('select-result', result)" />
      <cy-icon-text icon="ant-design:star-outlined" color="blue" class="ml-4">
        {{ getSuccessRateDisplay(result) }}
      </cy-icon-text>
      <cy-icon-text icon="ic:round-numbers" color="blue-fuchsia-60" class="ml-4">
        {{ result.operationStepsQuantity }}
      </cy-icon-text>
      <cy-button-icon
        :icon="unfold ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
        class="ml-auto"
        @click="unfold = !unfold"
      />
    </div>
    <div v-if="unfold" class="border-1 border-primary-30 rounded p-3 mx-3 mt-0.5 mb-4">
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
  result: EnchantEquipment;
  isCurrent: boolean;
}
interface Emits {
  (evt: 'select-result', result: EnchantEquipment): void;
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const unfold = ref(false)
</script>
