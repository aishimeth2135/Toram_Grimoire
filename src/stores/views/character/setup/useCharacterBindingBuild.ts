import { computed } from 'vue'
import { ComputedRef } from 'vue'
import { ref } from 'vue'
import { Ref } from 'vue'

import { CharacterBindingBuild } from '@/lib/Character/Character'

export function useCharacterBindingBuild<
  Build extends CharacterBindingBuild
>() {
  const builds: Ref<Build[]> = ref([])
  const currentBuildIndex = ref(-1)

  const currentBuild: ComputedRef<Build | null> = computed(
    () => builds.value[currentBuildIndex.value] ?? null
  )

  const setCurrentBuild = (idx: number | Build) => {
    if (typeof idx !== 'number') {
      idx = builds.value.indexOf(idx)
    }
    currentBuildIndex.value = idx
  }

  const appendBuild = (build: Build, updateIndex = true) => {
    builds.value.push(build)
    if (updateIndex || currentBuildIndex.value === -1) {
      currentBuildIndex.value = builds.value.length - 1
    }
    return build
  }

  const removeBuild = (build: Build) => {
    const idx = builds.value.findIndex(item => item.id === build.id)
    if (idx > -1) {
      builds.value.splice(idx, 1)
    }
    const nextIdx = Math.min(idx, builds.value.length - 1)
    currentBuildIndex.value = nextIdx
    return nextIdx
  }

  const resetBuildStore = () => {
    builds.value = []
    currentBuildIndex.value = -1
  }

  return {
    builds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild,
    appendBuild,
    removeBuild,
    resetBuildStore,
  }
}
