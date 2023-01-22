<template>
  <div class="cy-card-row" :class="{ 'row-selected': selected }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
})
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
}
</style>
