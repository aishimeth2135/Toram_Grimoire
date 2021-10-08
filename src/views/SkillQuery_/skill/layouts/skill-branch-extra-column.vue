<template>
  <fieldset class="extra-column">
    <legend class="flex items-center px-2">
      <cy-icon-text :icon="icon" size="small">
        {{ title }}
      </cy-icon-text>
    </legend>
    <div class="mb-1 flex items-center flex-wrap">
      <slot></slot>
    </div>
  </fieldset>
</template>

<script lang="ts" setup>
interface Prop {
  icon: string;
  title: string;
}

defineProps<Prop>();
</script>

<style lang="postcss">
fieldset.extra-column {
  border: 0;
  border-top-width: 1px;

  @apply pt-1 pb-0.5 mt-1 pl-1.5 border-light-4;
}
</style>
