import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { RegistletBuild } from '@/lib/Character/RegistletBuild/RegistletBuild'

export const useCharacterRegistletBuildStore = defineStore(
  'view-character-registlet-build',
  () => {
    const { t } = useI18n()

    const builds: Ref<RegistletBuild[]> = ref([])
    const currentBuildIndex = ref(-1)

    const currentBuild: ComputedRef<RegistletBuild | null> = computed(
      () => builds.value[currentBuildIndex.value] ?? null
    )

    const setCurrentRegistletBuild = (idx: number | RegistletBuild) => {
      if (typeof idx !== 'number') {
        idx = builds.value.indexOf(idx)
      }
      currentBuildIndex.value = idx
    }

    const createRegistletBuild = () => {
      const newBuild = new RegistletBuild(
        t('character-simulator.registlet-build.registlet-build') +
          ' ' +
          (builds.value.length + 1).toString()
      )
      builds.value.push(newBuild)
      currentBuildIndex.value = builds.value.length - 1
      return newBuild
    }

    const appendRegistletBuild = (
      build: RegistletBuild,
      updateIndex = true
    ) => {
      builds.value.push(build)
      if (updateIndex || currentBuildIndex.value === -1) {
        currentBuildIndex.value = builds.value.length - 1
      }
    }

    const copyCurrentRegistletBuild = () => {
      if (!currentBuild.value) {
        return
      }
      appendRegistletBuild(currentBuild.value.clone())
    }

    const removeCurrentRegistletBuild = () => {
      builds.value.splice(currentBuildIndex.value, 1)
      currentBuildIndex.value = Math.max(0, currentBuildIndex.value - 1)
    }

    const saveRegistletBuilds = () => {
      return builds.value.map(build => build.save())
    }

    const resetRegistletBuildStore = () => {
      builds.value = []
      currentBuildIndex.value = -1
    }

    return {
      registletBuilds: builds,
      currentRegistletBuildIndex: currentBuildIndex,
      currentRegistletBuild: currentBuild,
      setCurrentRegistletBuild,
      createRegistletBuild,
      copyCurrentRegistletBuild,
      removeCurrentRegistletBuild,
      appendRegistletBuild,
      saveRegistletBuilds,
      resetRegistletBuildStore,
    }
  }
)
