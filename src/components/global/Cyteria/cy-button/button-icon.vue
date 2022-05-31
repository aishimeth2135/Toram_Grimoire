<template>
  <IconifyIcon
    v-if="src === 'iconify'"
    :icon="icon"
  />
  <svg-icon
    v-else-if="src === 'custom'"
    :icon-id="icon"
  />
  <image-icon
    v-else-if="src === 'image'"
    :image-path="icon"
  />
  <IconifyIcon
    v-else
    icon="gg-shape-rhombus"
  />
</template>

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
