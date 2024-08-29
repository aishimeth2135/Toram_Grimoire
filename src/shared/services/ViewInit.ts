import { nextTick } from 'vue'

import { useDatasStore } from '@/stores/app/datas'
import { DataStoreIds } from '@/stores/app/datas'
import { useInitializeStore } from '@/stores/app/initialize'
import { InitializeStatus } from '@/stores/app/initialize/enums'
import { useLanguageStore } from '@/stores/app/language'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { CommonLogger } from './Logger'

interface ViewInitItem {
  id: DataStoreIds
  promise: Promise<() => Promise<void>>
  message: string
  loaded: boolean
}

export async function ViewInitSlient(...inits: DataStoreIds[]) {
  const datasStore = useDatasStore()
  const initItems = inits.map(id => {
    const loaded = datasStore.checkLoaded(id)
    const promise = loaded
      ? Promise.resolve(() => Promise.resolve())
      : datasStore.prepareDataStore(id)
    return { id, promise, loaded }
  })

  const finishedInitItems = await Promise.all(
    initItems.map(async item => {
      try {
        const init = await item.promise
        return {
          id: item.id,
          init,
        }
      } catch (err) {
        console.error(err)
      }
      return {
        id: item.id,
        init: () => Promise.resolve(),
      }
    })
  )
  await Promise.all(
    finishedInitItems.map(async item => {
      try {
        await item.init()
        datasStore.loadFinished(item.id)
      } catch (err) {
        console.error(err)
      }
    })
  )
}

export async function ViewInit(...inits: DataStoreIds[]) {
  const initializeStore = useInitializeStore()
  const datasStore = useDatasStore()

  initializeStore.initState()
  await nextTick()

  if (inits.length === 0) {
    await initializeStore.startInitLocale()
    initializeStore.skipInit()
    return
  }

  const logger = new CommonLogger('Init')

  const initItems = inits.map(id => {
    const loaded = datasStore.checkLoaded(id)
    const promise = loaded
      ? Promise.resolve(() => Promise.resolve())
      : datasStore.prepareDataStore(id)
    if (!loaded) {
      logger.addTitle(id).info('Loading...')
    }
    const message = 'app.loading-message.' + id
    return { id, promise, message, loaded } as ViewInitItem
  })

  initItems.forEach(item => initializeStore.appendInitItems(item))

  const finishedInitItems = await initializeStore.startInit()
  await Promise.all(
    finishedInitItems.map(async item => {
      await item.init()
      logger.addTitle(item.id).info('Loading finished.')
      datasStore.loadFinished(item.id)
    })
  )

  if (initializeStore.status === InitializeStatus.Error) {
    return
  }

  await initializeStore.startInitLocale()

  await initializeStore.initBeforeFinished()
}

export function PrepareLocaleInit(...namespaces: LocaleViewNamespaces[]) {
  const initializeStore = useInitializeStore()
  const languageStore = useLanguageStore()
  namespaces = namespaces.filter(
    namespace => !languageStore.i18nLoadedLocaleNamespaces.has(namespace)
  )
  initializeStore.appendLoadLocaleNamespace(...namespaces)
}
