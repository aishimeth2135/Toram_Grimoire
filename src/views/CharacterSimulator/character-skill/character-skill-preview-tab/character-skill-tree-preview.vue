<script lang="ts" setup>
import { computed, ref } from 'vue'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { Skill, SkillTree } from '@/lib/Skill/Skill'

import CardRows from '@/components/card/card-rows.vue'
import SkillTreeDiagram from '@/views/SkillQuery/skill-tree-diagram.vue'

import CommonEditModeButton from '../../common/common-edit-mode-button.vue'
import CharacterSkillPreviewItem from './character-skill-preivew-item.vue'

import { useSkillTreeLevelOptions } from './setup'

interface Props {
  skillBuild: SkillBuild
  skillTree: SkillTree
  defaultEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultEditing: false,
})
const { t } = useI18n()

const isEditing = ref(props.defaultEditing)

watch(
  () => props.defaultEditing,
  value => {
    isEditing.value = value
  }
)

interface SkillLevelData {
  skill: Skill
  level: number
}

const displayedSkills = computed(() => {
  const skillBuild = props.skillBuild
  const skillTree = props.skillTree

  const skillLevels: SkillLevelData[] = []
  skillTree.skills.forEach(skill => {
    if (skillBuild.hasSkill(skill)) {
      const level = skillBuild.getSkillLevel(skill)
      if (level > 0) {
        skillLevels.push({
          skill,
          level,
        })
      }
    }
  })
  return skillLevels
})

const { updateSkillLevel } = useSkillTreeLevelOptions()

const getSkillLevel = (skill: Skill) => {
  const { level, starGemLevel } = props.skillBuild.getSkillState(skill)
  return { level, starGemLevel }
}

const handleSkillClick = (skill: Skill) => {
  updateSkillLevel(props.skillBuild, skill)
}
</script>

<template>
  <div>
    <div class="flex items-center px-3 py-0.5 text-sm text-primary-40">
      {{ skillTree.name }}
      <CommonEditModeButton v-model:is-editing="isEditing" class="ml-auto" />
    </div>
    <template v-if="!isEditing">
      <CardRows v-if="displayedSkills.length > 0">
        <CharacterSkillPreviewItem
          v-for="{ skill, level } in displayedSkills"
          :key="skill.skillId"
          :skill="skill"
          :skill-level="level"
          :skill-build="skillBuild"
        />
      </CardRows>
      <div v-else class="px-3 pb-4 pt-1 text-sm text-gray-40">
        {{ t('character-simulator.skill-build.skill-tree-empty-tips') }}
      </div>
    </template>
    <template v-else>
      <div class="w-full overflow-x-auto">
        <SkillTreeDiagram
          :skill-tree="skillTree"
          :get-skill-level="getSkillLevel"
          @skill-click="handleSkillClick"
        />
      </div>
    </template>
  </div>
</template>
