<template>
  <template v-if="src && icon">
    <IconifyIcon
      v-if="src === 'iconify'"
      class="cy--icon"
      :icon="icon"
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
  <IconifyIcon
    v-else
    class="cy--icon"
    icon="gg-shape-rhombus"
  />
</template>

<script>
import { Icon } from '@iconify/vue';

export default {
  components: {
    IconifyIcon: Icon,
  },
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
};
</script>

<style lang="postcss" scoped>
.cy--icon {
  /* --icon-color: var(--primary-light-2); */
  /* --icon-width: 1.2rem; */
  height: var(--icon-width, 1.2rem);
  width: var(--icon-width, 1.2rem);
  color: var(--icon-color, var(--primary-light-2));

  @apply duration-300 flex-shrink-0;
}
</style>
