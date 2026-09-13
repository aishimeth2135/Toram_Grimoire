import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import { CommonLogger } from '@/shared/services/Logger'

import { DataStoreIds } from '../datas'
import { useLocaleStore } from '../locale'
import { LocaleViewNamespaces } from '../locale/enums'
import { InitItemStatus, InitializeStatus } from './enums'

interface InitItem {
  id: DataStoreIds
  message: string
  promise: Promise<() => Promise<void>>
}

interface InitItemWithStatus extends InitItem {
  status: InitItemStatus
}

export const useInitializeStore = defineStore('app-initialize', () => {
  const initedDataStores = new Set<DataStoreIds>()
  const initItems = ref<InitItemWithStatus[]>([])
  const initLocaleNamespaces = ref<LocaleViewNamespaces[]>([])
  const status = ref<InitializeStatus>(InitializeStatus.ViewLoading)
  const nextIsDeferred = ref(false)

  const appendInitItems = ({ id, message, promise }: InitItem) => {
    initItems.value.push({
      id,
      message,
      promise,
      status: InitItemStatus.Loading,
    })
  }

  const checkSkippable = (dataStoreIds: DataStoreIds[]) => {
    return dataStoreIds.every(id => initedDataStores.has(id))
  }

  const initState = () => {
    status.value = InitializeStatus.ViewLoading
    initItems.value = []
  }

  const clearInitStates = () => {
    nextIsDeferred.value = false
  }

  const emitInitBeforeFinished = () => {
    status.value = InitializeStatus.BeforeFinished
  }

  const emitInitFinished = () => {
    if (status.value !== InitializeStatus.BeforeFinished) {
      CommonLogger.warn('ViewInit', 'Unexpected status in initFinished.')
    }
    status.value = InitializeStatus.Finished
    initItems.value.forEach(item => {
      initedDataStores.add(item.id)
    })
    initItems.value = []
    clearInitStates()
  }

  const emitInitSkipped = () => {
    status.value = InitializeStatus.Finished
    clearInitStates()
  }

  const startInit = async () => {
    const inits = await Promise.all(
      initItems.value.map(async item => {
        try {
          const init = await item.promise
          item.status = InitItemStatus.Success
          return {
            id: item.id,
            init,
          }
        } catch (err) {
          console.error(err)
          item.status = InitItemStatus.Error
        }
        return {
          id: item.id,
          init: () => Promise.resolve(),
        }
      })
    )
    if (initItems.value.every(item => item.status !== InitItemStatus.Error)) {
      status.value = InitializeStatus.ViewSuccess
    } else {
      status.value = InitializeStatus.Error
    }
    return inits
  }

  const appendLoadLocaleNamespace = (...namespaces: LocaleViewNamespaces[]) => {
    initLocaleNamespaces.value.push(...namespaces)
  }

  const languageStore = useLocaleStore()
  const startInitLocale = async () => {
    status.value = InitializeStatus.LocaleLoading
    if (initLocaleNamespaces.value.length > 0) {
      await languageStore.loadLocaleMessages(initLocaleNamespaces.value)
      initLocaleNamespaces.value = []
    }
    status.value = InitializeStatus.LocaleSuccess
  }

  const markNextIsDeferred = () => {
    nextIsDeferred.value = true
  }

  return {
    initItems: readonly(initItems),
    status: readonly(status),
    isDeferred: readonly(nextIsDeferred),

    appendInitItems,
    initState,
    emitInitBeforeFinished,
    emitInitFinished,
    emitInitSkipped,
    startInit,

    appendLoadLocaleNamespace,
    startInitLocale,

    checkSkippable,
    markNextIsDeferred,
  }
})
