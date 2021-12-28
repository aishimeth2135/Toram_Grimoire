<template>
  <div class="flex items-center flex-wrap">
    <cy-icon-text
      :icon="getSkillIconPath(skill)"
      icon-src="image"
      text-color="purple"
      class="mr-3"
    >
      {{ skill.name }}
    </cy-icon-text>
    <div class="flex items-center space-x-1 pl-1 my-0.5">
      <div class="text-sm text-light-2">{{ skill.parent.parent.name }}</div>
      <cy-icon-text icon="ic:round-keyboard-arrow-right" size="small" />
      <div class="text-sm text-light-2">{{ skill.parent.name }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Skill } from '@/lib/Skill/Skill';
import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree';

interface Props {
  skill: Skill;
}

defineProps<Props>();
</script>
