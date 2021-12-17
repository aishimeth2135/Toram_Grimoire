<template>
  <div>
    <SkillEffectItemHistory
      v-for="(historyItem, idx) in skillEffectItem.historys"
      :key="historyItem.date"
      :skill-effect-history-item="historyItem"
      :detail-visible-default="idx === 0"
    />
  </div>
</template>

<script lang="ts" setup>
import { SkillEffectItem } from '@/lib/Skill/SkillComputingContainer';

import SkillEffectItemHistory from './skill-effect-history-item.vue';

interface Props {
  skillEffectItem: SkillEffectItem;
}

defineProps<Props>();
</script>
