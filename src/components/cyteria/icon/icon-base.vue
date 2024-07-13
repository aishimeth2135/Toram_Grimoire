<template>
  <SvgIcon v-if="customIconId" :icon-id="customIconId" />
  <img v-else-if="iconPath" :src="iconPath" />
  <IconifyIcon v-else :icon="icon || 'gg-shape-rhombus'" />
</template>

<script lang="ts" setup>
import { Icon as IconifyIcon } from '@iconify/vue'
import { computed } from 'vue'

import SvgIcon from './svg-icon.vue'

import { IconBaseProps } from './setup'

interface Props extends IconBaseProps {}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
})

const iconPath = computed(() => {
  if (props.icon.includes('.')) {
    return props.icon
  }
  return ''
})

const customIconId = computed(() => {
  if (props.icon.startsWith('@')) {
    return props.icon.slice(1)
  }
  return ''
})
</script>
