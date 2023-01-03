import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { PotionBuild } from '@/lib/Character/PotionBuild/PotionBuild'

export const useCharacterPotionBuildStore = defineStore(
  'view-character-potion-build',
  () => {
    const { t } = useI18n()

    const builds: Ref<PotionBuild[]> = ref([])
    const currentBuildIndex = ref(-1)

    const currentBuild: ComputedRef<PotionBuild | null> = computed(
      () => builds.value[currentBuildIndex.value] ?? null
    )

    const setCurrentPotionBuild = (idx: number | PotionBuild) => {
      if (typeof idx !== 'number') {
        idx = builds.value.indexOf(idx)
      }
      currentBuildIndex.value = idx
    }

    const createPotionBuild = () => {
      const newBuild = new PotionBuild(
        t('character-simulator.potion-build.potion-build') +
          ' ' +
          (builds.value.length + 1).toString()
      )
      builds.value.push(newBuild)
      currentBuildIndex.value = builds.value.length - 1
      return newBuild
    }

    const appendPotionBuild = (build: PotionBuild, updateIndex = true) => {
      builds.value.push(build)
      if (updateIndex || currentBuildIndex.value === -1) {
        currentBuildIndex.value = builds.value.length - 1
      }
    }

    const copyCurrentPotionBuild = () => {
      if (!currentBuild.value) {
        return
      }
      appendPotionBuild(currentBuild.value.clone())
    }

    const removeCurrentPotionBuild = () => {
      builds.value.splice(currentBuildIndex.value, 1)
      currentBuildIndex.value = Math.max(0, currentBuildIndex.value - 1)
    }

    const savePotionBuilds = () => {
      return builds.value.map(build => build.save())
    }

    const resetPotionBuildStore = () => {
      builds.value = []
      currentBuildIndex.value = -1
    }

    return {
      potionBuilds: builds,
      currentPotionBuildIndex: currentBuildIndex,
      currentPotionBuild: currentBuild,
      setCurrentPotionBuild,
      createPotionBuild,
      copyCurrentPotionBuild,
      removeCurrentPotionBuild,
      appendPotionBuild,
      savePotionBuilds,
      resetPotionBuildStore,
    }
  }
)
