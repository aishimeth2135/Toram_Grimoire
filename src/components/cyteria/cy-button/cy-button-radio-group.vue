<template>
  <div>
    <CyButtonRadio
      v-for="item in options"
      :key="item.value"
      :selected="value === item.value"
      @click="selectItem(item)"
    >
      {{ item.text }}
    </CyButtonRadio>
  </div>
</template>

<script lang="ts" setup>
import CyButtonRadio from './cy-button-radio.vue'

interface Props {
  value: any
  options: {
    text: string
    value: any
  }[]
}

interface Emits {
  (evt: 'update:value', value: any): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectItem = (item: { text: string; value: any }) => {
  emit('update:value', item.value)
}
</script>
