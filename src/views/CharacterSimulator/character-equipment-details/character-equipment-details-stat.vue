<script lang="ts" setup>
import { StatRestriction } from '@/lib/Character/Stat'

interface Props {
  stat: StatRestriction
}

defineProps<Props>()
</script>

<template>
  <div class="py-0.5">
    <div v-if="!stat.isPlain()" class="space-x-2 pt-0.5 text-sm text-primary-40">
      <span v-for="text in stat.restrictionTexts()" :key="text">
        {{ text }}
      </span>
    </div>
    <div class="flex items-center" :class="stat.value > 0 ? 'text-primary-90' : 'text-red-40'">
      {{ `${stat.base.text}${!stat.isBoolStat ? stat.showValue() : ''}` }}
    </div>
  </div>
</template>
