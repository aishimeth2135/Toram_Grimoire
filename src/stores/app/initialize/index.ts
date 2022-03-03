import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import { useLanguageStore } from '../language'
import { LocaleViewNamespaces } from '../language/enums'
import { InitializeStatus, InitItemStatus } from './enums'

interface InitItem {
  msg: string;
  promise: Promise<void>;
  status: InitItemStatus;
}

export const useInitializeStore = defineStore('app-initialize', () => {
  const initItems = ref<InitItem[]>([])
  const initLocaleNamespaces = ref<LocaleViewNamespaces[]>([])
  const status = ref<InitializeStatus>(InitializeStatus.ViewLoading)

  const appendInitItems = ({ msg, promise }: { msg: string; promise: Promise<any> }) => {
    initItems.value.push({
      msg,
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
      throw new Error(`[ViewInit] Unknow error. The status should be 101 instead of ${status.value}`)
    }
    status.value = InitializeStatus.Finished
    initItems.value = []
  }

  const skipInit = () => {
    status.value = InitializeStatus.Finished
  }

  const startInit = async () => {
    await Promise.all(
      initItems.value.map(async (item) => {
        try {
          await item.promise
          item.status = InitItemStatus.Success
        } catch (err) {
          console.error(err)
          item.status = InitItemStatus.Error
        }
      }),
    )
    if (initItems.value.every(item => item.status !== InitItemStatus.Error)) {
      status.value = InitializeStatus.ViewSuccess
    } else {
      status.value = InitializeStatus.Error
    }
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
