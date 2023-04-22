import { storeToRefs } from 'pinia'
import { Ref } from 'vue'

import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { GetSkillLevelHandler } from '@/lib/Skill/drawSkillTree'

type MenuMode = 'skill' | 'star-gem'

interface MenuData {
  levelUnit: number
  mode: MenuMode
}

export function setupSkillBuildStore() {
  const store = useCharacterSkillBuildStore()
  const { currentSkillBuild, skillBuilds } = storeToRefs(store)
  return {
    store,
    skillBuilds: skillBuilds as Ref<SkillBuild[]>,
    currentSkillBuild: currentSkillBuild as Ref<SkillBuild | null>,
  }
}

export function setupSkillLevel() {
  const { currentSkillBuild } = setupSkillBuildStore()
  const getSkillLevel: GetSkillLevelHandler = skill => {
    if (!currentSkillBuild.value) {
      return {
        level: 0,
        starGemLevel: 0,
      }
    }
    const state = currentSkillBuild.value.getSkillState(skill)
    return {
      level: state.level,
      starGemLevel: state.starGemLevel,
    }
  }
  return {
    getSkillLevel,
  }
}

export type { MenuMode, MenuData }
