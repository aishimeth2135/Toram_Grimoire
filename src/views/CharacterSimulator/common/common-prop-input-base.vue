<script lang="ts" setup>
import { type VNode, ref } from 'vue'

import { getPropInputAutoId } from '../character-equipment-details/setup'

interface Props {
  title: string
}
interface Slots {
  default(props: { inputId: string; setInputFocus: (value: boolean) => void }): VNode[]
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
    <div class="px-1.5 text-sm text-stone-60">{{ title }}</div>
    <label
      class="flex cursor-text border-b border-primary-20 px-1.5 py-1 duration-150"
      :class="{ 'border-primary-70': focus }"
      :for="inputId"
    >
      <slot :input-id="inputId" :set-input-focus="setInputFocus" />
    </label>
  </div>
</template>
