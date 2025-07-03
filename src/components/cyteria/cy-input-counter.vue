<template>
  <div class="flex">
    <div
      class="cy--input-counter shadow-xs outline-hidden border border-l-2 bg-white duration-300"
      :class="rootClassList"
      :style="rootStyle"
    >
      <div v-if="$slots['title'] || title" class="mr-3 inline-flex items-center text-primary-80">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div class="counter-content">
        <cy-button-icon
          v-if="minButton && range[0] !== null"
          icon="akar-icons:circle-chevron-left"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(range[0]!)"
        />
        <cy-button-icon
          icon="ic-round-remove-circle-outline"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(value - step)"
        />
        <input
          v-model.number.lazy="inputValue"
          type="number"
          @click="selectInput($event)"
          @focus="setInputFocus(true)"
          @blur="setInputFocus(false)"
        />
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(value + step)"
        />
        <cy-button-icon
          v-if="maxButton && range[1] !== null"
          icon="akar-icons:circle-chevron-right"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(range[1]!)"
        />
        <span v-if="$slots['unit'] || unit" class="ml-1 text-sm">
          <slot name="unit">
            {{ unit }}
          </slot>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import Color from '@/shared/services/Color'
import { normalizeInteger } from '@/shared/utils/number'

defineOptions({
  name: 'CyInputCounter',
})

interface Props {
  value: number
  range?: (number | null)[]
  step?: number
  inline?: boolean
  disabled?: boolean
  maxButton?: boolean
  minButton?: boolean
  mainColor?: string
  inputWidth?: string | null
  title?: string
  titleIcon?: string
  unit?: string
}
interface Emits {
  (evt: 'update:value', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  range: () => [null, null],
  step: 1,
  inline: false,
  disabled: false,
  maxButton: false,
  minButton: false,
  mainColor: 'primary-30',
  inputWidth: null,
})
const emit = defineEmits<Emits>()

const focus = ref(false)

const mainColorInstance = computed(() => new Color(props.mainColor))

const rootClassList = computed(() => {
  return {
    inline: props.inline,
    ['border-' + props.mainColor]: !focus.value,
    disabled: props.disabled,
    ['border-' + mainColorInstance.value.darken]: !props.inline && focus.value,
  } as Record<string, boolean>
})

const rootStyle = computed(() => {
  const style = {} as Record<string, any>
  if (props.inputWidth !== null) {
    style['--input-width'] = props.inputWidth
  }
  return style
})

const inputValue = computed<number>({
  get() {
    return props.value
  },
  set(value) {
    if (props.disabled) {
      return
    }
    value = normalizeInteger(value)

    const min = props.range[0],
      max = props.range[1]
    if (max !== null) {
      value = Math.min(max, value)
    }
    if (min !== null) {
      value = Math.max(min, value)
    }

    emit('update:value', value)
  },
})

const setInputFocus = (value: boolean) => {
  focus.value = value
}
const selectInput = (evt: MouseEvent) => {
  ;(evt.target as HTMLInputElement).select()
}
const setValue = (value: number) => {
  inputValue.value = value
}
</script>

<style>
.cy--input-counter {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.75rem 0.25rem 1rem;
  transition: border-color 0.3s;
  position: relative;
  --input-width: 2.125rem;

  &.inline {
    display: inline-flex;
    border: 0;
    padding: 0 0.5rem;
    background-color: transparent;
  }

  & > .counter-content {
    display: inline-flex;
    align-items: center;

    & > input {
      width: var(--input-width);
      border: 0;
      outline: 0;
      text-align: center;
      font-size: 1rem;
    }
  }

  &.disabled {
    opacity: 0.7;

    &::before {
      content: '';
      width: 100%;
      height: 100%;
      cursor: not-allowed;
      z-index: 10;
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
</style>
