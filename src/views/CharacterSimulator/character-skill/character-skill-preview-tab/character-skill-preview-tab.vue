<script lang="ts" setup>
import { SkillBuild } from '@/lib/Character/SkillBuild'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import CharacterSkillPreviewItem from './character-skill-preivew-item.vue'

interface Props {
  skillBuild: SkillBuild
}

defineProps<Props>()
</script>

<template>
  <CardRowsWrapper>
    <CardRows>
      <CharacterSkillPreviewItem
        v-for="{ skill, skillLevel } in skillBuild.allSkillLevels"
        :key="skill.skillId"
        :skill="skill"
        :skill-level="skillLevel"
        @update:skill-level="skillBuild.getSkillState(skill).level = $event"
      />
    </CardRows>
  </CardRowsWrapper>
</template>
