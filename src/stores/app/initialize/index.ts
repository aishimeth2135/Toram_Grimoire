import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import { DataStoreIds } from '../datas'
import { InitItemStatus, InitializeStatus } from './enums'

interface InitItem {
  id: DataStoreIds
  message: string
  status: InitItemStatus
}

export const useInitializeStore = defineStore('app-initialize', () => {
  const initItems = ref<InitItem[]>([])
  const status = ref<InitializeStatus>(InitializeStatus.ViewLoading)
  const isDeferred = ref(false)
  const retrying = ref(false)
  let retryHandler: (() => Promise<void>) | null = null

  const startInit = (dataStoreIds: DataStoreIds[], deferred: boolean) => {
    status.value = InitializeStatus.ViewLoading
    isDeferred.value = deferred
    retryHandler = null
    initItems.value = dataStoreIds.map(id => ({
      id,
      message: 'app.loading-message.' + id,
      status: InitItemStatus.Loading,
    }))
  }

  const updateInitItemStatus = (id: DataStoreIds, itemStatus: InitItemStatus) => {
    const item = initItems.value.find(initItem => initItem.id === id)
    if (item) {
      item.status = itemStatus
    }
  }

  const finishInitData = () => {
    status.value = InitializeStatus.ViewSuccess
  }

  const startInitLocale = () => {
    status.value = InitializeStatus.LocaleLoading
  }

  const finishInitLocale = () => {
    status.value = InitializeStatus.LocaleSuccess
  }

  const emitInitError = (handler: () => Promise<void>) => {
    retryHandler = handler
    status.value = InitializeStatus.Error
  }

  const retryInit = async () => {
    if (!retryHandler || retrying.value) {
      return
    }
    retrying.value = true
    try {
      await retryHandler()
    } finally {
      retrying.value = false
    }
  }

  const emitInitBeforeFinished = () => {
    retryHandler = null
    status.value = InitializeStatus.BeforeFinished
  }

  const emitInitFinished = () => {
    status.value = InitializeStatus.Finished
    initItems.value = []
    isDeferred.value = false
  }

  const emitInitSkipped = () => {
    retryHandler = null
    status.value = InitializeStatus.Finished
    initItems.value = []
    isDeferred.value = false
  }

  return {
    initItems: readonly(initItems),
    status: readonly(status),
    isDeferred: readonly(isDeferred),
    retrying: readonly(retrying),

    startInit,
    updateInitItemStatus,
    finishInitData,
    startInitLocale,
    finishInitLocale,
    emitInitError,
    retryInit,
    emitInitBeforeFinished,
    emitInitFinished,
    emitInitSkipped,
  }
})
