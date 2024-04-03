<template>
  <div
    class="cy-card-row"
    :class="{ 'row-selected': selected, 'row-hover': hover }"
    :[idBind.name]="idBind.value"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useCardRowContext } from './setup'

interface Props {
  selected?: boolean
  hover?: boolean
  item?: any
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  hover: false,
})

const context = {
  item: computed(() => props.item),
}

const { idBind } = useCardRowContext(context)
</script>

<style lang="postcss" scoped>
div.cy-card-row {
  @apply bg-white;

  &.row-selected + div.cy-card-row {
    border-top: 1px solid var(--app-primary-30);
  }

  & + div.cy-card-row.row-selected {
    border-top: 1px solid var(--app-primary-30);
  }

  &.row-hover:hover {
    @apply bg-primary-5 duration-150;
  }
}
</style>
