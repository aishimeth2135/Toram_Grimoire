import { defineStore } from 'pinia'

import Grimoire from '@/shared/Grimoire'

import { SkillBuild } from '@/lib/Character/SkillBuild'

import { CHARACTER_SIMULATOR_BUILD_LIMIT } from '../consts'
import { useCharacterBindingBuild } from '../setup/useCharacterBindingBuild'

export const useCharacterSkillBuildStore = defineStore('view-character-skill-build', () => {
  const {
    builds,
    onBuildsChange,
    replaceBuilds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild: setCurrentSkillBuild,
    appendBuild: appendSkillBuild,
    removeBuild: removeSkillBuild,
    resetBuildStore: resetSkillBuildStore,
  } = useCharacterBindingBuild<SkillBuild>(
    () => SkillBuild.create(Grimoire.i18n.t('skill-simulator.skill-build') + ' 1'),
    CHARACTER_SIMULATOR_BUILD_LIMIT
  )

  const createSkillBuild = () => {
    const newBuild = SkillBuild.create(
      Grimoire.i18n.t('skill-simulator.skill-build') + ' ' + (builds.value.length + 1)
    )
    return appendSkillBuild(newBuild, { updateIndex: false })
  }

  const saveSkillBuilds = () => {
    return builds.value.map(build => build.save())
  }

  return {
    onBuildsChange,
    replaceBuilds,
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
