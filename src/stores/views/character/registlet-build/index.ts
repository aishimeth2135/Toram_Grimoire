import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

import { RegistletBuild } from '@/lib/Character/RegistletBuild'

import { useCharacterBindingBuild } from '../setup/useCharacterBindingBuild'

export const useCharacterRegistletBuildStore = defineStore(
  'view-character-registlet-build',
  () => {
    const { t } = useI18n()

    const {
      builds,
      currentBuildIndex,
      currentBuild,
      setCurrentBuild: setCurrentRegistletBuild,
      appendBuild: appendRegistletBuild,
      removeBuild: removeRegistletBuild,
      resetBuildStore: resetRegistletBuildStore,
    } = useCharacterBindingBuild<RegistletBuild>()

    const createRegistletBuild = () => {
      const newBuild = new RegistletBuild(
        t('character-simulator.registlet-build.registlet-build') +
          ' ' +
          (builds.value.length + 1).toString()
      )
      return appendRegistletBuild(newBuild, false)
    }

    const removeCurrentRegistletBuild = () => {
      builds.value.splice(currentBuildIndex.value, 1)
      currentBuildIndex.value = Math.max(0, currentBuildIndex.value - 1)
    }

    const saveRegistletBuilds = () => {
      return builds.value.map(build => build.save())
    }

    return {
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
  }
)
