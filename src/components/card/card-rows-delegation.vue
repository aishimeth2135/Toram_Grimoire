<script lang="ts" setup>
import CardRows from './card-rows.vue'

import { setupCardRowsDelegation } from './setup'

interface Emits {
  (evt: 'row-clicked', rowItem: any): void
}

const emit = defineEmits<Emits>()

const { findTargetRowContext } = setupCardRowsDelegation()

const onClick = (evt: MouseEvent) => {
  const context = findTargetRowContext(evt.target as HTMLElement)
  if (context && !context.disabled.value) {
    emit('row-clicked', context.item.value)
  }
}
</script>

<template>
  <CardRows @click="onClick">
    <slot />
  </CardRows>
</template>
