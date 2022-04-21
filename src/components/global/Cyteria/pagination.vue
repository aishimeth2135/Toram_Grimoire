<template>
  <div class="cy--pagination-wrapper">
    <div
      class="flex items-center justify-center w-full px-4 space-x-1 border border-transparent duration-300"
      :class="{ 'border-light-3': inputFocus }"
    >
      <cy-button-border icon="ic:round-keyboard-double-arrow-left" @click="inputValue = 1" />
      <cy-button-border icon="ic:round-arrow-back" @click="inputValue -= 1" />
      <input
        v-model.number.lazy="inputValue"
        type="number"
        class="cy--pagination-input"
        @click="selectInput($event)"
        @focus="inputFocus = true"
        @blur="inputFocus = false"
      />
      <cy-button-border icon="ic:round-arrow-forward" @click="inputValue += 1" />
      <cy-button-border icon="ic:round-keyboard-double-arrow-right" @click="inputValue = maxPage" />
    </div>
    <div class="flex items-center text-light-2 space-x-0.5 text-sm">
      <span>{{ value }}</span>
      <cy-icon-text icon="mdi:slash-forward" icon-color="light-2" small />
      <span>{{ maxPage }}</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CyPagination',
}
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue'

interface Props {
  value: number;
  maxPage: number;
}

interface Emits {
  (evt: 'update:value', value: number): void;
  (evt: 'changed'): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputFocus = ref(false)

const inputValue = computed<number>({
  get() {
    return props.value
  },
  set(value) {
    emit('update:value', value)
    emit('changed')
  },
})

const selectInput = (evt: MouseEvent) => {
  (evt.target as HTMLInputElement).select()
}
</script>

<style lang="postcss" scoped>
.cy--pagination-wrapper {
  --input-width: 2.125rem;

  @apply flex flex-wrap justify-center w-full;
}
.cy--pagination-input {
  width: var(--input-width);
  border: 0;
  outline: 0;
  text-align: center;
  font-size: 1rem;
}
</style>
