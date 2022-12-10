<template>
  <span class="my-2 mx-1 flex flex-wrap items-center">
    <div
      class="flex w-full items-center rounded-3xl border-1 border-solid bg-white py-0.5 pl-3 pr-2 duration-300"
      :class="{
        'border-primary-50': inputFocus,
        'border-primary-20': !inputFocus,
      }"
    >
      <cy-icon-text
        :icon="icon"
        :icon-src="iconSrc"
        class="mr-2"
        :icon-color="inputFocus ? 'primary-50' : 'primary-20'"
      />
      <div class="w-full">
        <slot />
        <input
          v-if="!$slots.default"
          ref="mainInput"
          v-model="innerValue"
          type="text"
          :placeholder="placeholder"
          class="w-full border-0 p-0.5 duration-200"
          @focus="setInputFocus(true)"
          @blur="setInputFocus(false)"
          @keyup="$emit('keyup', $event)"
        />
      </div>
      <cy-button-icon
        v-if="clearable && innerValue !== ''"
        icon="mdi:close-circle"
        @click="innerValue = ''"
      />
    </div>
  </span>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, nextTick, ref } from 'vue'

import { IconBaseProps } from './icon/setup'

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    ...IconBaseProps,
  },
  emits: ['update:value', 'keyup'],
  setup(props, { emit, expose }) {
    const inputFocus = ref(false)
    const mainInput: Ref<HTMLInputElement | null> = ref(null)

    const innerValue = computed<string>({
      get() {
        return props.value
      },
      set(value) {
        if (value.length > 64) {
          value = value.slice(0, 64)
        }
        emit('update:value', value)
      },
    })

    const setInputFocus = (value: boolean) => {
      inputFocus.value = value
    }

    expose({
      focus: async () => {
        await nextTick()
        mainInput.value?.focus()
      },
    })

    return { inputFocus, innerValue, setInputFocus, mainInput }
  },
})
</script>
