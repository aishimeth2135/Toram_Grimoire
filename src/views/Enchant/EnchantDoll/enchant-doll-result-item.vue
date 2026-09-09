<template>
  <div>
    <div
      class="hover:bg-primary-5 flex cursor-pointer items-center py-1.5 pl-1 pr-3 duration-200"
      @click="unfold = !unfold"
    >
      <cy-button-radio :selected="isCurrent" @click.stop="emit('select-result', result)" />
      <div class="gap-icon text-blue-60 ml-4 inline-flex items-center">
        <cy-icon icon="ant-design:star-outlined" class="text-blue-30" />
        {{ getSuccessRateDisplay(result) }}
      </div>
      <div class="gap-icon text-blue-fuchsia-60 ml-4 inline-flex items-center">
        <cy-icon icon="ic:round-numbers" class="text-blue-fuchsia-30" />
        {{ result.operationStepsQuantity }}
      </div>
      <cy-icon
        :icon="unfold ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
        class="ml-auto"
      />
    </div>
    <div v-if="unfold" class="border-primary-30 mx-3 mb-4 mt-0.5 rounded-sm border-2 p-3">
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
