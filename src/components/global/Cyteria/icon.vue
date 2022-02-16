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

<script lang="ts">
export default {
  name: 'CyIcon',
}
</script>

<script lang="ts" setup>
import { Icon as IconifyIcon } from '@iconify/vue'

interface Props {
  icon?: string;
  src?: 'iconify' | 'custom' | 'image';
}

withDefaults(defineProps<Props>(), {
  icon: 'gg-shape-rhombus',
  src: 'iconify',
})
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
