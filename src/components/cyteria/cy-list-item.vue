<template>
  <div class="cy--list-item" :class="{ 'selected': selected, 'is-pure': pure }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'CyListItem',
})

interface Props {
  selected?: boolean
  pure?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
  pure: false,
})
</script>

<style lang="postcss" scoped>
.cy--list-item {
  @apply flex cursor-pointer flex-wrap items-center px-3 py-1.5 duration-200;
  border: 1px solid transparent;

  &:hover {
    @apply bg-primary-5;
  }

  &.is-pure {
    @apply cursor-auto;
  }

  &.selected {
    color: var(--app-fuchsia-60);
    border: 1px solid var(--app-primary-30);
    background-color: rgba(var(--app-rgb-primary-10), 0.1);
  }

  &:not(.selected) + .cy--list-item:not(.selected) {
    border-top: 1px solid var(--app-primary-30);
  }
}
</style>
