<template>
  <div class="flex flex-wrap items-center">
    <cy-icon :icon="getSkillIconPath(skill)" class="mr-1.5" />
    <span class="text-fuchsia-60 mr-3">
      {{ skill.name }}
    </span>
    <div class="my-0.5 flex items-center space-x-1 pl-1">
      <div class="text-primary-30 text-sm">{{ skill.parent.parent.name }}</div>
      <cy-icon icon="ic:round-keyboard-arrow-right" small />
      <div class="text-primary-30 text-sm">{{ skill.parent.name }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Skill } from '@/lib/Skill/Skill'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

interface Props {
  skill: Skill
}

defineProps<Props>()
</script>
