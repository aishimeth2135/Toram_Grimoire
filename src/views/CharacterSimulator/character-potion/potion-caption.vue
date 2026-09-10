<script lang="ts" setup>
import type { BagPotion } from '@/lib/Items/BagItem'

import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  potion: BagPotion
}

defineProps<Props>()
</script>

<template>
  <div>
    <ShowStat v-for="stat in potion.stats" :key="stat.statId" :stat="stat" />
  </div>
</template>
