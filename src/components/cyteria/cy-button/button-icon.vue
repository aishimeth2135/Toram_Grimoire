<template>
  <IconBase v-if="icon !== null" :icon="icon" :src="src" />
</template>

<script lang="ts" setup>
import IconBase from '../icon/icon-base.vue'

interface Props {
  icon?: string | null
  src?: 'iconify' | 'custom' | 'image'
}

withDefaults(defineProps<Props>(), {
  icon: 'gg-shape-rhombus',
  src: 'iconify',
})
</script>
