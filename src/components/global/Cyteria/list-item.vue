<template>
  <div class="cy--list-item" :class="{ 'selected': selected }">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'CyListItem',
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="postcss" scoped>
.cy--list-item {
  @apply flex items-center flex-wrap cursor-pointer py-1.5 px-3 duration-200;
  border: 1px solid transparent;

  &:hover, &.selected {
    background-color: rgba(var(--rgb-primary-light), 0.4);
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
