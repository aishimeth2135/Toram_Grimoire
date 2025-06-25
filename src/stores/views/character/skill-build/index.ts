import { defineStore } from 'pinia'

import Grimoire from '@/shared/Grimoire'

import { SkillBuild } from '@/lib/Character/SkillBuild'

import { useCharacterBindingBuild } from '../setup/useCharacterBindingBuild'

export const useCharacterSkillBuildStore = defineStore('view-character-skill-build', () => {
  const {
    builds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild: setCurrentSkillBuild,
    appendBuild: appendSkillBuild,
    removeBuild: removeSkillBuild,
    resetBuildStore: resetSkillBuildStore,
  } = useCharacterBindingBuild<SkillBuild>()

  const createSkillBuild = () => {
    const newBuild = new SkillBuild(
      Grimoire.i18n.t('skill-simulator.skill-build') + ' ' + (builds.value.length + 1)
    )
    return appendSkillBuild(newBuild, false)
  }

  const saveSkillBuilds = () => {
    return builds.value.map(build => build.save())
  }

  return {
    skillBuilds: builds,
    currentSkillBuildIndex: currentBuildIndex,
    currentSkillBuild: currentBuild,
    setCurrentSkillBuild,
    createSkillBuild,
    appendSkillBuild,
    removeSkillBuild,
    saveSkillBuilds,
    reset: resetSkillBuildStore,
  }
})
