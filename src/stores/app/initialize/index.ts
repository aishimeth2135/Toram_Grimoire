import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import { DataStoreIds } from '../datas/enums'
import { useLanguageStore } from '../language'
import { LocaleViewNamespaces } from '../language/enums'
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
  const initItems = ref<InitItemWithStatus[]>([])
  const initLocaleNamespaces = ref<LocaleViewNamespaces[]>([])
  const status = ref<InitializeStatus>(InitializeStatus.ViewLoading)

  const appendInitItems = ({ id, message, promise }: InitItem) => {
    initItems.value.push({
      id,
      message,
      promise,
      status: InitItemStatus.Loading,
    })
  }

  const initState = () => {
    status.value = InitializeStatus.ViewLoading
    initItems.value = []
  }

  const initBeforeFinished = async () => {
    status.value = InitializeStatus.BeforeFinished
  }

  const initFinished = () => {
    if (status.value !== InitializeStatus.BeforeFinished) {
      throw new Error(
        `[ViewInit] Unknow error. The status should be 101 instead of ${status.value}`
      )
    }
    status.value = InitializeStatus.Finished
    initItems.value = []
  }

  const skipInit = () => {
    status.value = InitializeStatus.Finished
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

  const languageStore = useLanguageStore()
  const startInitLocale = async () => {
    status.value = InitializeStatus.LocaleLoading
    if (initLocaleNamespaces.value.length > 0) {
      await languageStore.loadLocaleMessages(initLocaleNamespaces.value)
      initLocaleNamespaces.value = []
    }
    status.value = InitializeStatus.LocaleSuccess
  }

  return {
    initItems: readonly(initItems),
    status: readonly(status),

    appendInitItems,
    initState,
    initBeforeFinished,
    initFinished,
    skipInit,
    startInit,

    appendLoadLocaleNamespace,
    startInitLocale,
  }
})
