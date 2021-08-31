<template>
  <template v-if="src && icon">
    <iconify-icon
      v-if="src === 'iconify'"
      class="cy--icon"
      :name="icon"
    />
    <svg-icon
      v-else-if="src === 'custom'"
      class="cy--icon"
      :icon-id="icon"
    />
    <image-icon
      v-else-if="src === 'image'"
      class="cy--icon"
      :image-path="icon"
    />
  </template>
  <iconify-icon
    v-else
    class="cy--icon"
    name="gg-shape-rhombus"
  />
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: 'gg-shape-rhombus',
    },
    src: {
      type: String,
      default: 'iconify',
      validation: v => ['iconify', 'custom', 'image'].includes(v),
    },
  },
}
</script>

<style lang="postcss" scoped>
.cy--icon {
  /* --icon-color: var(--primary-light-2); */
  /* --icon-width: 1.2rem; */
  height: var(--icon-width, var(--primary-light-2));
  width: var(--icon-width, 1.2rem);
  color: var(--icon-color, 1.2rem);

  @apply duration-300 flex-shrink-0;
}
</style>
