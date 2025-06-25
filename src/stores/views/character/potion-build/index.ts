import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

import { PotionBuild } from '@/lib/Character/PotionBuild'

import { useCharacterBindingBuild } from '../setup/useCharacterBindingBuild'

export const useCharacterPotionBuildStore = defineStore('view-character-potion-build', () => {
  const { t } = useI18n()

  const {
    builds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild: setCurrentPotionBuild,
    appendBuild: appendPotionBuild,
    removeBuild: removePotionBuild,
    resetBuildStore: resetPotionBuildStore,
  } = useCharacterBindingBuild<PotionBuild>()

  const createPotionBuild = () => {
    const newBuild = new PotionBuild(
      t('character-simulator.potion-build.potion-build') +
        ' ' +
        (builds.value.length + 1).toString()
    )
    return appendPotionBuild(newBuild, false)
  }

  const copyCurrentPotionBuild = () => {
    if (!currentBuild.value) {
      return
    }
    appendPotionBuild(currentBuild.value.clone())
  }

  const savePotionBuilds = () => {
    return builds.value.map(build => build.save())
  }

  return {
    potionBuilds: builds,
    currentPotionBuildIndex: currentBuildIndex,
    currentPotionBuild: currentBuild,
    setCurrentPotionBuild,
    createPotionBuild,
    copyCurrentPotionBuild,
    removePotionBuild,
    appendPotionBuild,
    savePotionBuilds,
    resetPotionBuildStore,
  }
})
