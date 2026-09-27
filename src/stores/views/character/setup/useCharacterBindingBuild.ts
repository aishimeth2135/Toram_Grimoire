import { type Ref, computed, ref, shallowRef } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { useNotify } from '@/shared/composables/Notify'

import { type CharacterBindingBuild } from '@/lib/Character/Character'

interface AppendBuildOptions {
  updateIndex?: boolean
  source?: 'load'
}

export function useCharacterBindingBuild<Build extends CharacterBindingBuild>(
  createDefaultBuild: () => Build,
  buildLimit?: number
) {
  const notify = useNotify()
  const initialBuild = createDefaultBuild()
  const items: Ref<Build[]> = ref([])
  items.value = [initialBuild]
  const selected = shallowRef<Build>(items.value[0] ?? initialBuild)
  const changeHandlers: (() => void)[] = []

  const setCurrentBuild = (value: number | Build | null) => {
    const build =
      typeof value === 'number'
        ? items.value[value]
        : items.value.find(item => item.id === value?.id)
    selected.value = build ?? items.value[0] ?? selected.value
  }

  const replaceBuilds = (values: Build[]) => {
    const fallback = values[0] ?? createDefaultBuild()
    items.value = values.length > 0 ? [...values] : [fallback]
    setCurrentBuild(selected.value)
    changeHandlers.forEach(handler => handler())
  }

  // Structural changes go through the setter; build objects retain their reactive identity.
  const builds = computed<Build[]>({
    get: () => [...items.value],
    set: replaceBuilds,
  })
  const currentBuild = computed<Build>({
    get: () => selected.value,
    set: setCurrentBuild,
  })
  const currentBuildIndex = computed<number>({
    get: () => items.value.findIndex(item => item.id === selected.value.id),
    set: setCurrentBuild,
  })

  const appendBuild = (build: Build, options: AppendBuildOptions = {}) => {
    const { updateIndex = true, source } = options
    if (source !== 'load' && buildLimit !== undefined && items.value.length >= buildLimit) {
      notify(Grimoire.i18n.t('character-simulator.build-limit-reached', { num: buildLimit }))
      return null
    }

    items.value.push(build)
    if (updateIndex) {
      setCurrentBuild(build)
    }
    return items.value.find(item => item.id === build.id) ?? build
  }

  const removeBuild = (build: Build) => {
    const idx = items.value.findIndex(item => item.id === build.id)
    if (idx < 0) {
      return currentBuildIndex.value
    }
    if (items.value.length === 1) {
      notify(Grimoire.i18n.t('character-simulator.build-common.at-least-one-build-tips'))
      return 0
    }

    const nextItems = items.value.filter(item => item.id !== build.id)
    const nextIdx = Math.min(idx, nextItems.length - 1)
    const replacement = nextItems[nextIdx]
    if (selected.value.id === build.id && replacement) {
      selected.value = replacement
    }
    replaceBuilds(nextItems)
    return nextIdx
  }

  return {
    builds,
    currentBuildIndex,
    currentBuild,
    setCurrentBuild,
    appendBuild,
    removeBuild,
    replaceBuilds,
    resetBuildStore: () => replaceBuilds([]),
    onBuildsChange: (handler: () => void) => changeHandlers.push(handler),
  }
}
