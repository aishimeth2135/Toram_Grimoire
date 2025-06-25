<template>
  <IconBase v-if="icon" :icon="icon" class="fill-current" />
</template>

<script lang="ts" setup>
import IconBase from '../icon/icon-base.vue'

import { type IconBaseProps } from '../icon/setup'

type Props = IconBaseProps

defineProps<Props>()
</script>
