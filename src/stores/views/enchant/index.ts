import { defineStore } from 'pinia'
import { Ref, computed, ref } from 'vue'

import { useMainStore } from '@/stores/app/main'

import Grimoire from '@/shared/Grimoire'
import Notify from '@/shared/setup/Notify'
import CY from '@/shared/utils/Cyteria'

import { EnchantBuild, EnchantBuildSaveData } from '@/lib/Enchant/Enchant'

import {
  EnchantStoreConfig,
  enchantConfig,
  updateCharacterMaxLevel,
} from './config'

interface EnchantStoreSaveData {
  builds: EnchantBuildSaveData[]
  index: number
  config: EnchantStoreConfig
}

const SAVE_PRETEXT = 'app--enchant-simulator--vbeta--'

export const useEnchantStore = defineStore('view-enchant', () => {
  const enchantBuilds: Ref<EnchantBuild[]> = ref([])
  const currentBuildIndex = ref(-1)
  const hasInit = ref(false)
  const config = enchantConfig
  let hasFirstLoaded = false
  let saveDisabled = false

  const mainStore = useMainStore()
  if (mainStore.devMode) {
    updateCharacterMaxLevel(900)
  }

  const currentBuild = computed<EnchantBuild | null>(
    () => enchantBuilds.value[currentBuildIndex.value] ?? null
  )

  const resetConfig = (configToSet: EnchantStoreConfig) => {
    config.characterLevel = configToSet.characterLevel
    config.smithLevel = configToSet.smithLevel

    // need migrate
    if (configToSet.materialSkillLevels) {
      config.materialSkillLevels = configToSet.materialSkillLevels.slice()
    }
  }

  const appendBuild = (build: EnchantBuild) => {
    enchantBuilds.value.push(build)
    currentBuildIndex.value += 1
  }

  const removeBuild = (build: EnchantBuild) => {
    const idx = enchantBuilds.value.indexOf(build)
    if (idx !== -1) {
      enchantBuilds.value.splice(idx, 1)
      if (currentBuildIndex.value !== 0) {
        currentBuildIndex.value -= 1
      }
    }
  }

  const copyBuild = (build: EnchantBuild) => {
    const newBuild = build.clone()
    newBuild.name += '*'
    currentBuildIndex.value += 1
    enchantBuilds.value.splice(currentBuildIndex.value, 0, newBuild)
  }

  const setCurrentBuild = (idx: number | EnchantBuild) => {
    if (typeof idx !== 'number') {
      idx = enchantBuilds.value.indexOf(idx)
    }
    currentBuildIndex.value = idx
  }

  const save = (target = 'auto') => {
    if (!CY.storageAvailable('localStorage')) {
      return
    }
    const builds = enchantBuilds.value.map(build => build.save())
    const data: EnchantStoreSaveData = {
      builds,
      index: currentBuildIndex.value,
      config: config,
    }
    window.localStorage.setItem(SAVE_PRETEXT + target, JSON.stringify(data))
  }

  const load = (target = 'auto') => {
    if (!CY.storageAvailable('localStorage')) {
      return
    }
    const origin = {
      builds: enchantBuilds.value,
      index: currentBuildIndex.value,
      config: config,
    }
    try {
      const odata = window.localStorage.getItem(SAVE_PRETEXT + target)
      if (!odata) {
        console.warn('[enchant-simulator] data not found: ' + target)
        return
      }
      const data = JSON.parse(odata) as EnchantStoreSaveData
      enchantBuilds.value = data.builds.map(buildData =>
        EnchantBuild.load(buildData)
      )
      currentBuildIndex.value = data.index

      resetConfig(data.config)

      hasFirstLoaded = true
    } catch (err) {
      console.warn('[enchant-simulator] load failed: ' + target)
      console.log(err)
      enchantBuilds.value = origin.builds
      currentBuildIndex.value = origin.index
      resetConfig(origin.config)
      if (!hasFirstLoaded) {
        saveDisabled = true
        const { notify } = Notify()
        notify(Grimoire.i18n.t('enchant-simulator.tips.first-load-failed-tips'))
      }
    }
  }

  const init = () => {
    if (hasInit.value) {
      return
    }
    load()
    hasInit.value = true
  }

  const exportDollBuild = (build: EnchantBuild) => {
    appendBuild(build)
    save()
  }

  return {
    enchantBuilds,
    currentBuild,
    config,

    appendBuild,
    removeBuild,
    copyBuild,
    setCurrentBuild,
    save,
    init,
    exportDollBuild,
  }
})
