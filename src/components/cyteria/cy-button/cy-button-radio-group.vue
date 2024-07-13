<script lang="ts" setup>
import CyButtonRadio from './cy-button-radio.vue'

interface RadioOption {
  text: string
  value: any
}

interface Props {
  value: any
  options: RadioOption[]
}

interface Emits {
  (evt: 'update:value', value: any): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectItem = (item: RadioOption) => {
  emit('update:value', item.value)
}
</script>

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
