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

  &:hover, &.selected {
    background-color: rgba(var(--rgb-primary-light), 0.4);
  }

  &.is-pure {
    @apply cursor-auto;
  }

  &.selected {
    color: var(--primary-purple);
    border: 1px solid var(--primary-light-2);
  }

  &:not(.selected) + .cy--list-item:not(.selected) {
    border-top: 1px solid var(--primary-light);
  }
}
</style>
