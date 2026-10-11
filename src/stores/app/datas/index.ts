import { defineStore } from 'pinia'
import { ref } from 'vue'

import { DataStoreIds } from './enums'

export { DataStoreIds } from './enums'

const dataStoreLoaders: Record<DataStoreIds, () => Promise<() => Promise<void>>> = {
  [DataStoreIds.Items]: () => import('./loaders/items').then(module => module.prepareItems()),
  [DataStoreIds.Crystals]: () => import('./loaders/items').then(module => module.prepareCrystals()),
  [DataStoreIds.ItemsPotion]: () =>
    import('./loaders/items').then(module => module.prepareItemsPotion()),
  [DataStoreIds.Stats]: () => import('./loaders/character').then(module => module.prepareStats()),
  [DataStoreIds.CharacterStats]: () =>
    import('./loaders/character').then(module => module.prepareCharacterStats()),
  [DataStoreIds.Glossary]: () =>
    import('./loaders/glossary').then(module => module.prepareGlossary()),
  [DataStoreIds.Skill]: () => import('./loaders/skill').then(module => module.prepareSkill()),
  [DataStoreIds.Food]: () => import('./loaders/food').then(module => module.prepareFood()),
  [DataStoreIds.Enchant]: () => import('./loaders/enchant').then(module => module.prepareEnchant()),
  [DataStoreIds.DamageCalculation]: () =>
    import('./loaders/damage').then(module => module.prepareDamageCalculation()),
  [DataStoreIds.Registlet]: () =>
    import('./loaders/registlet').then(module => module.prepareRegistlet()),
  [DataStoreIds.Quest]: () => import('./loaders/quest').then(module => module.prepareQuest()),
  [DataStoreIds.EquipmentTrait]: () =>
    import('./loaders/equipment-trait').then(module => module.prepareEquipmentTrait()),
}

export const useDatasStore = defineStore('app-datas', () => {
  const loaded = ref<Map<DataStoreIds, boolean>>(new Map())
  const waitLoadedTicks = ref<Map<DataStoreIds, ((value: boolean) => void)[]>>(new Map())
  const loadingPromises = new Map<DataStoreIds, Promise<void>>()

  const checkLoaded = (id: DataStoreIds) => loaded.value.has(id)

  const waitLoaded = (id: DataStoreIds) => {
    if (checkLoaded(id)) {
      return Promise.resolve()
    }
    if (!waitLoadedTicks.value.has(id)) {
      waitLoadedTicks.value.set(id, [])
    }
    return new Promise(resolve => {
      waitLoadedTicks.value.get(id)!.push(resolve)
    })
  }

  const loadFinished = (id: DataStoreIds) => {
    loaded.value.set(id, true)
    waitLoadedTicks.value.get(id)?.forEach(ticks => ticks(true))
    waitLoadedTicks.value.delete(id)
  }

  const ensureLoaded = async (ids: DataStoreIds[], onPrepared?: (id: DataStoreIds) => void) => {
    interface LoadTask {
      id: DataStoreIds
      promise: Promise<void>
      owned: boolean
      resolve?: () => void
      reject?: (reason: unknown) => void
      preparePromise?: Promise<() => Promise<void>>
      init?: () => Promise<void>
      prepareFailed?: boolean
      prepareError?: unknown
    }

    const tasks = ids.map<LoadTask>(id => {
      if (checkLoaded(id)) {
        return { id, promise: Promise.resolve(), owned: false }
      }

      const loadingPromise = loadingPromises.get(id)
      if (loadingPromise) {
        return { id, promise: loadingPromise, owned: false }
      }

      let resolve: () => void
      let reject: (reason: unknown) => void
      const promise = new Promise<void>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise
        reject = rejectPromise
      })
      loadingPromises.set(id, promise)

      return {
        id,
        promise,
        owned: true,
        resolve: resolve!,
        reject: reject!,
        preparePromise: dataStoreLoaders[id]().then(init => {
          onPrepared?.(id)
          return init
        }),
      }
    })

    const resultsPromise = Promise.all(
      tasks.map(async task => {
        try {
          await task.promise
          return { success: true as const }
        } catch (error) {
          return { success: false as const, error }
        }
      })
    )

    await Promise.all(
      tasks.map(async task => {
        if (!task.preparePromise) {
          return
        }
        try {
          task.init = await task.preparePromise
        } catch (error) {
          task.prepareFailed = true
          task.prepareError = error
        }
      })
    )

    const failedPrepareTask = tasks.find(task => task.owned && task.prepareFailed)
    if (failedPrepareTask) {
      tasks.forEach(task => {
        if (!task.owned) {
          return
        }
        task.reject!(failedPrepareTask.prepareError)
        if (loadingPromises.get(task.id) === task.promise) {
          loadingPromises.delete(task.id)
        }
      })
      return resultsPromise
    }

    for (const task of tasks) {
      if (!task.owned) {
        continue
      }

      try {
        await task.init!()
        loadFinished(task.id)
        task.resolve!()
      } catch (error) {
        task.reject!(error)
      } finally {
        if (loadingPromises.get(task.id) === task.promise) {
          loadingPromises.delete(task.id)
        }
      }
    }

    return resultsPromise
  }

  return {
    checkLoaded,
    waitLoaded,
    ensureLoaded,
  }
})
