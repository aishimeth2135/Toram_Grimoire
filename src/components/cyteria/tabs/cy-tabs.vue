<script lang="ts" setup>
import { computed } from 'vue'

import { useTabsContext } from './setup'

interface Props {
  modelValue: number
  direction?: 'horizontal' | 'vertical'
}
interface Emits {
  (evt: 'update:model-value', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
})
const emit = defineEmits<Emits>()

const tabIndex = computed<number>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:model-value', value)
  },
})

const isHorizontal = computed(() => props.direction === 'horizontal')

const { idBind } = useTabsContext({ isHorizontal, tabIndex })
</script>

<template>
  <div
    v-bind:[idBind.name]="idBind.value"
    class="cy-tabs flex flex-wrap items-center border-b-1 border-primary-10"
  >
    <slot />
  </div>
</template>
