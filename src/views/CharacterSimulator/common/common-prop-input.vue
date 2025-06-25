<script lang="ts" setup>
import { ref } from 'vue'

import { getPropInputAutoId } from '../character-equipment-details/setup'

interface Props {
  title: string
}

defineProps<Props>()

const innerValue = defineModel<string>('value', { required: true })

const inputElement = ref<HTMLInputElement | null>(null)
const inputId = getPropInputAutoId()
const focus = ref(false)
const setInputFocus = (value: boolean) => {
  focus.value = value
  if (value) {
    inputElement.value?.select()
  }
}
</script>

<template>
  <div class="w-full pt-1 max-w-[15rem]">
    <div class="px-1.5 text-sm text-stone-60">{{ title }}</div>
    <label class="mt-0.5 flex cursor-text border-b border-primary-20 px-1.5 py-1 duration-150"
      :class="{ 'border-primary-70': focus }" :for="inputId">
      <div class="w-full" @click.stop>
        <input :id="inputId" ref="inputElement" v-model="innerValue" type="text"
          class="w-full bg-transparent text-primary-70" @focus="setInputFocus(true)" @blur="setInputFocus(false)" />
      </div>
    </label>
  </div>
</template>
