<template>
  <span class="flex items-center flex-wrap my-2 mx-1">
    <div
      class="flex items-center py-0.5 px-3 border-1 border-solid rounded-3xl w-full duration-300 bg-white"
      :class="{ 'border-light-3': inputFocus, 'border-light': !inputFocus }"
    >
      <cy-icon-text :icon="icon" :icon-src="iconSrc" class="mr-2" />
      <div ref="input-content" class="w-full">
        <slot />
        <input
          v-if="!$slots.default"
          ref="mainInput"
          v-model="innerValue"
          type="text"
          :placeholder="placeholder"
          class="p-0.5 border-0 duration-200 text-base w-full"
          @focus="setInputFocus(true)"
          @blur="setInputFocus(false)"
          @keyup="$emit('keyup', $event)"
        >
      </div>
    </div>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, Ref, ref } from 'vue'

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
    ...IconBaseProps,
  },
  emits: ['update:value', 'keyup'],
  setup(props, { emit, expose  }) {
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
