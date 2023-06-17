<template>
  <IconifyIcon v-if="src === 'iconify'" :icon="icon" />
  <SvgIcon v-else-if="src === 'custom'" :icon-id="icon" />
  <img v-else-if="src === 'image'" :src="icon" />
  <IconifyIcon v-else icon="gg-shape-rhombus" />
</template>

<script lang="ts" setup>
import { Icon as IconifyIcon } from '@iconify/vue'

import SvgIcon from './svg-icon.vue'

import { IconSrc } from './setup'

interface Props {
  icon?: string
  src?: IconSrc
}

withDefaults(defineProps<Props>(), {
  icon: 'gg-shape-rhombus',
  src: 'iconify',
})
</script>
