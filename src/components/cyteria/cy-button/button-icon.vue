<template>
  <IconBase v-if="icon" :icon="icon" />
</template>

<script lang="ts" setup>
import IconBase from '../icon/icon-base.vue'

import { IconBaseProps } from '../icon/setup'

interface Props extends IconBaseProps {}

defineProps<Props>()
</script>
