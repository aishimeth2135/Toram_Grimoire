<template>
  <div class="cy--input-counter-container">
    <div
      class="cy--input-counter border bg-white duration-300 outline-none"
      :class="rootClassList"
      :style="rootStyle"
    >
      <div v-if="$slots['title'] || title" class="inline-flex mr-3">
        <slot name="title">
          <cy-icon-text :icon="titleIcon">
            {{ title }}
          </cy-icon-text>
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
        >
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
        <span v-if="$slots['unit']" class="text-sm ml-1">
          <slot name="unit" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CyInputCounter',
}
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import Color from '@/shared/services/Color'

interface Props {
  value: number;
  range?: (number | null)[];
  step?: number;
  type?: 'normal' | 'line';
  inline?: boolean;
  disabled?: boolean;
  maxButton?: boolean;
  minButton?: boolean;
  mainColor?: string;
  inputWidth?: string | null;
  title?: string;
  titleIcon?: string;
}
interface Emits {
  (evt: 'update:value', value: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  range: () => [null, null],
  step: 1,
  type: 'normal',
  inline: false,
  disabled: false,
  maxButton: false,
  minButton: false,
  mainColor: 'light-2',
  inputWidth: null,
})
const emit = defineEmits<Emits>()

const focus = ref(false)

const mainColorInstance = computed(() => new Color(props.mainColor))

const rootClassList = computed(() => {
  return {
    'line': props.type === 'line',
    'inline': props.inline,
    ['border-' + props.mainColor]: !focus.value,
    'disabled': props.disabled,
    ['border-' + mainColorInstance.value.darken]: !props.inline && focus.value,
    ['ring-' + mainColorInstance.value.darken]: !props.inline && focus.value,
    'ring-1': !props.inline && focus.value,
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
    value = value || 0

    const min = props.range[0],
      max = props.range[1]
    max !== null && (value = Math.min(max, value))
    min !== null && (value = Math.max(min, value))

    emit('update:value', value)
  },
})

const setInputFocus = (value: boolean) => {
  focus.value = value
}
const selectInput = (evt: MouseEvent) => {
  (evt.target as HTMLInputElement).select()
}
const setValue = (value: number) => {
  inputValue.value = value
}
</script>

<style lang="postcss" scoped>
.cy--input-counter-container {
  display: block;
  --input-width: 2.125rem;
}
.cy--input-counter {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 1rem;
  transition: border-color 0.3s;
  position: relative;

  &.inline {
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

  &.line {
    display: flex;
    & > .counter-content {
      margin-left: auto;
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
