import { type Ref, type WritableComputedRef, computed, ref } from 'vue'

import { type CharacterBindingBuild } from '@/lib/Character/Character'

export function useCharacterBindingBuild<Build extends CharacterBindingBuild>() {
  const builds: Ref<Build[]> = ref([])
  const currentBuildIndex = ref(-1)

  const setCurrentBuild = (idx: number | Build | null) => {
    if (idx === null) {
      currentBuildIndex.value = -1
      return
    }

    if (typeof idx !== 'number') {
      idx = builds.value.indexOf(idx)
    }
    currentBuildIndex.value = idx
  }

  const currentBuild: WritableComputedRef<Build | null> = computed({
    get() {
      return builds.value[currentBuildIndex.value] ?? null
    },
    set(value) {
      setCurrentBuild(value)
    },
  })

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
    if (idx === currentBuildIndex.value) {
      currentBuildIndex.value = nextIdx
    }
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
