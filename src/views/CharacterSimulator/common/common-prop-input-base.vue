<script lang="ts" setup>
import { type VNodeChild, ref } from 'vue'

import { getPropInputAutoId } from '../character-equipment-details/setup'

interface Props {
  title: string
}
interface Slots {
  default(props: { inputId: string; setInputFocus: (value: boolean) => void }): VNodeChild
}

defineProps<Props>()
defineSlots<Slots>()

const inputId = getPropInputAutoId()
const focus = ref(false)
const setInputFocus = (value: boolean) => {
  focus.value = value
}
</script>

<template>
  <div class="w-full">
    <div class="text-gray-60 px-1.5 text-sm">{{ title }}</div>
    <label
      class="border-primary-20 flex cursor-text border-b px-1.5 py-1 duration-150"
      :class="{ 'border-primary-70': focus }"
      :for="inputId"
    >
      <slot :input-id="inputId" :set-input-focus="setInputFocus" />
    </label>
  </div>
</template>
