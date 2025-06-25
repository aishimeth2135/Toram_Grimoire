<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import { normalizeInteger, toInt } from '@/shared/utils/number'

import { getPropInputAutoId } from '../character-equipment-details/setup'

interface Props {
  title: string
  value: number
  unit?: string
  range?: string | (number | null)[]
}
interface Emits {
  (evt: 'update:value', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputElement: Ref<HTMLInputElement | null> = ref(null)
const inputId = getPropInputAutoId()
const focus = ref(false)
const setInputFocus = (value: boolean) => {
  focus.value = value
  if (value) {
    inputElement.value?.select()
  }
}

const parsedRange = computed(() => {
  if (!props.range) {
    return {
      min: null,
      max: null,
    }
  }
  const range = typeof props.range === 'string' ? props.range.split('~') : props.range
  const [min, max] = range.map(item => {
    if (typeof item === 'number') {
      return item
    }
    return item ? toInt(item) : null
  })
  return {
    min,
    max,
  }
})

const innerValue = computed<number>({
  get() {
    return props.value
  },
  set(newValue) {
    let value = newValue
    let num = normalizeInteger(value)
    const { min, max } = parsedRange.value
    if (min !== null) {
      num = Math.max(min, num)
    }
    if (max !== null) {
      num = Math.min(max, num)
    }
    value = num

    emit('update:value', value)
  },
})

const incValue = (value: number) => {
  innerValue.value += value
}
</script>

<template>
  <div class="w-full pt-1 max-w-[8rem]">
    <div class="px-1.5 text-sm text-stone-60">{{ title }}</div>
    <label class="mt-0.5 flex cursor-text border-b border-primary-20 px-1.5 py-1 duration-150"
      :class="{ 'border-primary-70': focus }" :for="inputId">
      <div class="relative min-w-4" @click.stop>
        <div class="invisible h-6">{{ innerValue }}</div>
        <input :id="inputId" ref="inputElement" v-model="innerValue" type="number"
          class="absolute left-0 top-0 w-full bg-transparent text-primary-70" @focus="setInputFocus(true)"
          @blur="setInputFocus(false)" />
      </div>
      <div v-if="unit" class="pl-1 pr-2 text-primary-40">{{ unit }}</div>
      <div class="ml-auto flex shrink-0 items-center space-x-1">
        <cy-button-icon icon="ic-round-remove-circle-outline" @click="incValue(-1)" />
        <cy-button-icon icon="ic-round-add-circle-outline" @click="incValue(1)" />
      </div>
    </label>
  </div>
</template>
