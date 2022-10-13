<template>
  <div class="flex flex-wrap items-center">
    <cy-icon-text
      :icon="getSkillIconPath(skill)"
      icon-src="image"
      text-color="fuchsia-60"
      class="mr-3"
    >
      {{ skill.name }}
    </cy-icon-text>
    <div class="my-0.5 flex items-center space-x-1 pl-1">
      <div class="text-sm text-primary-30">{{ skill.parent.parent.name }}</div>
      <cy-icon-text icon="ic:round-keyboard-arrow-right" small />
      <div class="text-sm text-primary-30">{{ skill.parent.name }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Skill } from '@/lib/Skill/Skill'
import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'

interface Props {
  skill: Skill
}

defineProps<Props>()
</script>
