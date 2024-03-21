import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { removeElement } from '@/shared/utils/array'

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
      return appendRegistletBuild(newBuild)
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
