<script lang="ts" setup>
interface Props {
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="common-series-button">
    <cy-icon :icon="icon" class="text-current" />
  </div>
</template>

<style scoped>
@reference "@/tailwind.css";

.common-series-button {
  display: inline-flex;
  transition-duration: 150ms;
  cursor: pointer;
  border-width: 2px;
  border-color: currentcolor;
  border-radius: var(--radius-sm);
  background-color: var(--color-white);
  padding-inline: --spacing(2);
  padding-block: --spacing(1.5);
  color: var(--color-primary-20);
}

.common-series-button.button-selected {
  z-index: 1;
  color: var(--color-primary-50);
}

.common-series-button:hover {
  z-index: 1;
  color: var(--color-primary-40);
}

.common-series-button + .common-series-button {
  margin-left: --spacing(-0.5);
}
</style>
