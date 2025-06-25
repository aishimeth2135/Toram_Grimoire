<template>
  <div class="cy--list-item" :class="{ 'selected': selected, 'is-pure': pure }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  selected?: boolean
  pure?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
  pure: false,
})
</script>

<style>
@reference "@/tailwind.css";

.cy--list-item {
  display: flex;
  flex-wrap: wrap;
  cursor: pointer;
  align-items: center;
  padding-inline: --spacing(3);
  padding-block: --spacing(1.5);
  border: 1px solid transparent;
  transition-duration: 200ms;

  &:hover {
    background-color: var(--app-primary-5);
  }

  &.is-pure {
    cursor: auto;
  }

  &.selected {
    color: var(--app-fuchsia-60);
    border: 1px solid var(--app-primary-30);
    background-color: --alpha(var(--app-primary-10) / 10%);
  }

  &:not(.selected) + .cy--list-item:not(.selected) {
    border-top: 1px solid var(--app-primary-30);
  }
}
</style>
