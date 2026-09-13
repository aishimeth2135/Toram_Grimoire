import { nextTick } from 'vue'

import { useDatasStore } from '@/stores/app/datas'
import { DataStoreIds } from '@/stores/app/datas'
import { useInitializeStore } from '@/stores/app/initialize'
import { InitItemStatus } from '@/stores/app/initialize/enums'
import { useLocaleStore } from '@/stores/app/locale'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import { CommonLogger } from './Logger'

export type PageInitMode = 'blocking' | 'deferred' | 'silent'

export interface PageInitOptions {
  data?: DataStoreIds[]
  locales?: LocaleViewNamespaces[]
  mode?: PageInitMode
}

async function initializeSilently(dataStoreIds: DataStoreIds[]) {
  const datasStore = useDatasStore()
  const results = await datasStore.ensureLoaded(dataStoreIds)
  results.forEach(result => {
    if (!result.success) {
      console.error(result.error)
    }
  })
}

export async function initializePage(options: PageInitOptions = {}) {
  const dataStoreIds = [...new Set(options.data ?? [])]
  const localeNamespaces = [...new Set(options.locales ?? [])]
  const mode = options.mode ?? 'blocking'

  if (mode === 'silent') {
    await initializeSilently(dataStoreIds)
    return
  }

  const initializeStore = useInitializeStore()
  const datasStore = useDatasStore()
  const localeStore = useLocaleStore()

  const hasUnloadedData = dataStoreIds.some(id => !datasStore.checkLoaded(id))
  const hasUnloadedLocale = localeNamespaces.some(
    namespace => !localeStore.i18nLoadedLocaleNamespaces.has(namespace)
  )
  if (
    (!hasUnloadedData && !hasUnloadedLocale && mode === 'deferred') ||
    (dataStoreIds.length === 0 && localeNamespaces.length === 0)
  ) {
    initializeStore.emitInitSkipped()
    await nextTick()
    return
  }

  const initLogger = new CommonLogger('Init')
  const run = async () => {
    initializeStore.startInit(dataStoreIds, mode === 'deferred')
    await nextTick()

    const localeResultPromise = localeStore.ensureLocaleLoaded(localeNamespaces).then(
      () => ({ success: true as const }),
      error => ({ success: false as const, error })
    )
    dataStoreIds.forEach(id => {
      if (datasStore.checkLoaded(id)) {
        initializeStore.updateInitItemStatus(id, InitItemStatus.Success)
        return
      }
      initLogger.addTitle(id).info('Loading...')
    })
    const dataResults = await datasStore.ensureLoaded(dataStoreIds, id => {
      initializeStore.updateInitItemStatus(id, InitItemStatus.Success)
    })
    dataResults.forEach((result, index) => {
      const id = dataStoreIds[index]
      if (result.success) {
        initializeStore.updateInitItemStatus(id, InitItemStatus.Success)
        initLogger.addTitle(id).info('Loading finished.')
      } else {
        console.error(result.error)
        initializeStore.updateInitItemStatus(id, InitItemStatus.Error)
      }
    })
    initializeStore.finishInitData()

    initializeStore.startInitLocale()
    const localeResult = await localeResultPromise
    if (!localeResult.success) {
      console.error(localeResult.error)
    } else {
      initializeStore.finishInitLocale()
    }

    if (dataResults.some(result => !result.success) || !localeResult.success) {
      return false
    }

    initializeStore.emitInitBeforeFinished()
    return true
  }

  if (await run()) {
    return
  }

  await new Promise<void>(resolve => {
    const retry = async () => {
      if (await run()) {
        resolve()
      } else {
        initializeStore.emitInitError(retry)
      }
    }
    initializeStore.emitInitError(retry)
  })
}
