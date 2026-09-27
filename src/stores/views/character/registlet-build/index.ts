import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

import { RegistletBuild } from '@/lib/Character/RegistletBuild'

import { CHARACTER_SIMULATOR_BUILD_LIMIT } from '../consts'
import { useCharacterBindingBuild } from '../setup/useCharacterBindingBuild'

export const useCharacterRegistletBuildStore = defineStore('view-character-registlet-build', () => {
  const { t } = useI18n()

  const {
    builds,
    onBuildsChange,
    replaceBuilds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild: setCurrentRegistletBuild,
    appendBuild: appendRegistletBuild,
    removeBuild: removeRegistletBuild,
    resetBuildStore: resetRegistletBuildStore,
  } = useCharacterBindingBuild<RegistletBuild>(
    () => RegistletBuild.create(t('character-simulator.registlet-build.registlet-build') + ' 1'),
    CHARACTER_SIMULATOR_BUILD_LIMIT
  )

  const createRegistletBuild = () => {
    const newBuild = RegistletBuild.create(
      t('character-simulator.registlet-build.registlet-build') +
        ' ' +
        (builds.value.length + 1).toString()
    )
    return appendRegistletBuild(newBuild, { updateIndex: false })
  }

  const removeCurrentRegistletBuild = () => {
    removeRegistletBuild(currentBuild.value)
  }

  const saveRegistletBuilds = () => {
    return builds.value.map(build => build.save())
  }

  return {
    onBuildsChange,
    replaceBuilds,
    registletBuilds: builds,
    currentRegistletBuildIndex: currentBuildIndex,
    currentRegistletBuild: currentBuild,
    setCurrentRegistletBuild,
    createRegistletBuild,
    removeCurrentRegistletBuild,
    removeRegistletBuild,
    appendRegistletBuild,
    saveRegistletBuilds,
    resetRegistletBuildStore,
  }
})
