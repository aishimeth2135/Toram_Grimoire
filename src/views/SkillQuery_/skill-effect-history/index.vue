<template>
  <div class="pt-2">
    <SkillEffectItemHistory
      v-for="historyItem in skillEffectItem.historys"
      :key="historyItem.date"
      :skill-effect-history-item="historyItem"
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
