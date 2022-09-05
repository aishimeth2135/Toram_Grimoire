<template>
  <div class="cy--list-item" :class="{ 'selected': selected, 'is-pure': pure }">
    <slot />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CyListItem',
}
</script>

<script lang="ts" setup>
interface Props {
  selected?: boolean;
  pure?: boolean;
}

withDefaults(defineProps<Props>(), {
  selected: false,
  pure: false,
})
</script>

<style lang="postcss" scoped>
.cy--list-item {
  @apply flex items-center flex-wrap cursor-pointer py-1.5 px-3 duration-200;
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(var(--rgb-app-light), 0.2);
  }

  &.is-pure {
    @apply cursor-auto;
  }

  &.selected {
    color: var(--app-fuchsia-60);
    border: 1px solid var(--app-primary-30);
    background-color: rgba(var(--rgb-app-light), 0.1);
  }

  &:not(.selected) + .cy--list-item:not(.selected) {
    border-top: 1px solid var(--app-primary-30);
  }
}
</style>
