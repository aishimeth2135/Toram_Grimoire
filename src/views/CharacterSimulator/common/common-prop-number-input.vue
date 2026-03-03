<script lang="ts" setup>
import { computed } from 'vue'

import { normalizeInteger, toInt } from '@/shared/utils/number'

import CommonPropInputBase from './common-prop-input-base.vue'

interface Props {
  title: string
  unit?: string
  range?: string | (number | null)[]
  maxButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxButton: false,
})

const _innerValue = defineModel<number>('value', { required: true })

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
    return _innerValue.value
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

    _innerValue.value = value
  },
})

const incValue = (value: number) => {
  innerValue.value += value
}

const toMax = () => {
  if (props.maxButton && parsedRange.value.max !== null) {
    innerValue.value = parsedRange.value.max
  }
}
</script>

<template>
  <CommonPropInputBase
    :title="title"
    :class="maxButton ? 'max-w-[10rem]' : 'max-w-[8rem]'"
    v-slot="{ inputId, setInputFocus }"
  >
    <div class="relative min-w-4" @click.stop>
      <div class="invisible h-6">{{ innerValue }}</div>
      <input
        :id="inputId"
        ref="inputElement"
        v-model="innerValue"
        type="number"
        class="text-primary-70 absolute left-0 top-0 w-full bg-transparent"
        @focus="setInputFocus(true)"
        @blur="setInputFocus(false)"
      />
    </div>
    <div v-if="unit" class="text-primary-40 pl-1 pr-2">{{ unit }}</div>
    <div class="ml-auto flex shrink-0 items-center">
      <cy-button-icon icon="ic-round-remove-circle-outline" @click="incValue(-1)" />
      <cy-button-icon icon="ic-round-add-circle-outline" @click="incValue(1)" />
      <cy-button-icon
        v-if="maxButton"
        icon="mdi:chevron-right-circle-outline"
        color="blue"
        @click="toMax"
      />
    </div>
  </CommonPropInputBase>
</template>
