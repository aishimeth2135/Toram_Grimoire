<template>
  <SvgIcon v-if="customIconId" :icon-id="customIconId" />
  <img v-else-if="iconPath" :src="iconPath" />
  <Icon v-else :icon="icon || 'gg-shape-rhombus'" />
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

import SvgIcon from './svg-icon.vue'

import { type IconBaseProps } from './setup'

interface Props extends IconBaseProps {}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
})

const iconPath = computed(() => {
  if (props.icon.includes('.') || props.icon.startsWith('data:image')) {
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
