<template>
  <div class="cy--pagination-wrapper">
    <div
      class="flex w-full items-center justify-center space-x-1 border border-transparent px-4 duration-300"
      :class="{ 'border-primary-50': inputFocus }"
    >
      <cy-button-action
        icon="ic:round-keyboard-double-arrow-left"
        :disabled="maxPage === 0 || inputValue <= 0"
        @click="inputValue = 1"
      />
      <cy-button-action
        icon="ic:round-arrow-back"
        :disabled="maxPage === 0 || inputValue <= 0"
        @click="inputValue -= 1"
      />
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
        :disabled="inputValue >= maxPage"
        @click="inputValue += 1"
      />
      <cy-button-action
        icon="ic:round-keyboard-double-arrow-right"
        :disabled="inputValue >= maxPage"
        @click="inputValue = maxPage"
      />
    </div>
    <div class="text-primary-30 flex items-center space-x-0.5 text-sm">
      <span>{{ value }}</span>
      <cy-icon icon="mdi:slash-forward" small />
      <span>{{ maxPage }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

defineOptions({
  name: 'CyPagination',
})

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

<style>
.cy--pagination-wrapper {
  --input-width: 2.125rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}
.cy--pagination-input {
  outline: 0;
  border: 0;
  width: var(--input-width);
  font-size: 1rem;
  text-align: center;
}
</style>
