<template>
  <div class="cy--pagination-wrapper">
    <div
      class="flex w-full items-center justify-center space-x-1 border border-transparent px-4 duration-300"
      :class="{ 'border-primary-50': inputFocus }"
    >
      <cy-button-action
        icon="ic:round-keyboard-double-arrow-left"
        @click="inputValue = 1"
      />
      <cy-button-action icon="ic:round-arrow-back" @click="inputValue -= 1" />
      <input
        v-model.number.lazy="inputValue"
        type="number"
        class="cy--pagination-input"
        @click="selectInput($event)"
        @focus="inputFocus = true"
        @blur="inputFocus = false"
      />
      <cy-button-action
        icon="ic:round-arrow-forward"
        @click="inputValue += 1"
      />
      <cy-button-action
        icon="ic:round-keyboard-double-arrow-right"
        @click="inputValue = maxPage"
      />
    </div>
    <div class="flex items-center space-x-0.5 text-sm text-primary-30">
      <span>{{ value }}</span>
      <cy-icon-text icon="mdi:slash-forward" icon-color="primary-30" small />
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
  value: number
  maxPage: number
}

interface Emits {
  (evt: 'update:value', value: number): void
  (evt: 'changed'): void
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
  ;(evt.target as HTMLInputElement).select()
}
</script>

<style lang="postcss" scoped>
.cy--pagination-wrapper {
  --input-width: 2.125rem;

  @apply flex w-full flex-wrap justify-center;
}
.cy--pagination-input {
  width: var(--input-width);
  border: 0;
  outline: 0;
  text-align: center;
  font-size: 1rem;
}
</style>
