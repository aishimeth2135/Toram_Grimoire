<script lang="ts" setup>
import CardRows from './card-rows.vue'

import { setupCardRowsDelegation } from './setup'

interface Emits {
  (evt: 'row-clicked', rowItem: any): void
}

const emit = defineEmits<Emits>()

const { findTargetRowItem } = setupCardRowsDelegation()

const onClick = (evt: MouseEvent) => {
  const item = findTargetRowItem(evt.target as HTMLElement)
  if (item) {
    emit('row-clicked', item)
  }
}
</script>

<template>
  <CardRows @click="onClick">
    <slot />
  </CardRows>
</template>
