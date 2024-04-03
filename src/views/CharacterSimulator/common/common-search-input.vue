<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  isHeader?: boolean
  behind?: boolean
}
interface Emits {
  (evt: 'update:model-value', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isHeader: false,
  behind: false,
})
const emit = defineEmits<Emits>()

const innerValue = computed<string>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:model-value', value)
  },
})
</script>

<template>
  <div class="relative flex items-center">
    <div class="absolute left-0 top-0 flex h-full items-center pl-3">
      <cy-icon icon="mdi:search" width="1.375rem" />
    </div>
    <input
      v-model="innerValue"
      type="text"
      class="w-full border-primary-5 bg-primary-5 px-10 py-1.5 duration-150 focus:border-primary-30 focus:bg-white"
      :class="{
        [isHeader ? 'border-b' : 'border']: true,
        [behind ? 'rounded-r-full' : 'rounded-full']: !isHeader,
      }"
      :placeholder="placeholder"
    />
    <div class="absolute right-0 top-0 flex h-full items-center pr-2.5">
      <cy-button-icon
        icon="mdi:close-circle"
        :class="{ invisible: !innerValue }"
        width="1.25rem"
        @click="innerValue = ''"
      />
    </div>
  </div>
</template>
