<template>
  <span class="mx-1 my-2 flex flex-wrap items-center">
    <div
      class="flex w-full items-center rounded-3xl border-1 border-solid bg-white py-0.5 pl-3 pr-2 duration-300"
      :class="{
        'border-primary-50': inputFocus,
        'border-primary-20': !inputFocus,
      }"
    >
      <cy-icon-text
        :icon="icon"
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

<script lang="ts" setup>
import { type Ref, computed, nextTick, ref } from 'vue'

import { type IconBaseProps } from './icon/setup'

interface Props extends IconBaseProps {
  placeholder?: string
  clearable?: boolean
}
interface Emits {
  (evt: 'keyup', event: KeyboardEvent): void
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  clearable: false,
})
const emit = defineEmits<Emits>()

const inputValue = defineModel<string>('value', { required: true })

const inputFocus = ref(false)
const mainInput: Ref<HTMLInputElement | null> = ref(null)

const innerValue = computed<string>({
  get() {
    return inputValue.value
  },
  set(value) {
    if (value.length > 64) {
      value = value.slice(0, 64)
    }
    inputValue.value = value
  },
})

const setInputFocus = (value: boolean) => {
  inputFocus.value = value
}

defineExpose({
  focus: async () => {
    await nextTick()
    mainInput.value?.focus()
  },
})
</script>
