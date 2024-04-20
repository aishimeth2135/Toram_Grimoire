import { ref } from 'vue'

import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { Skill } from '@/lib/Skill/Skill'

export const enum SkillLevelMode {
  Level,
  StarGem,
}

export const useSkillTreeLevelOptions = defineViewState(
  ViewNames.CharacterSimulator,
  () => {
    const skillLevelIncreaseSign = ref(1)
    const skillLevelIncreaseStep = ref(5)
    const skillLevelIncreaseMode = ref(SkillLevelMode.Level)

    const updateSkillLevel = (skillBuild: SkillBuild, skill: Skill) => {
      const value = skillLevelIncreaseSign.value * skillLevelIncreaseStep.value
      if (skillLevelIncreaseMode.value === SkillLevelMode.Level) {
        skillBuild.increaseSkillLevel(skill, value)
      } else {
        skillBuild.increaseStarGemLevel(skill, value)
      }
    }

    return {
      skillLevelIncreaseMode,
      skillLevelIncreaseSign,
      skillLevelIncreaseStep,
      updateSkillLevel,
    }
  }
)
