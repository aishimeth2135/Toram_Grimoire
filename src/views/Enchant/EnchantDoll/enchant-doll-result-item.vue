<template>
  <div>
    <div
      class="flex cursor-pointer items-center py-1.5 pr-3 pl-1 duration-200 hover:bg-primary-5"
      @click="unfold = !unfold"
    >
      <cy-button-radio :selected="isCurrent" @click.stop="emit('select-result', result)" />
      <div class="ml-4 inline-flex items-center gap-icon text-blue-60">
        <cy-icon icon="ant-design:star-outlined" class="text-blue-30" />
        {{ getSuccessRateDisplay(result) }}
      </div>
      <div class="text-blue-fuchsia-60 ml-4 inline-flex items-center gap-icon">
        <cy-icon icon="ic:round-numbers" class="text-blue-fuchsia-30" />
        {{ result.operationStepsQuantity }}
      </div>
      <cy-icon
        :icon="unfold ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
        class="ml-auto"
      />
    </div>
    <div v-if="unfold" class="mx-3 mt-0.5 mb-4 rounded-sm border-2 border-primary-30 p-3">
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
