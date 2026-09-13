import type { NavigationGuard, RouteRecordName } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import { initializePage } from '@/shared/services/ViewInit'

export function createCategoryViewInitGuard(categoryRouteName: RouteRecordName) {
  return (locales: LocaleViewNamespaces[], ...data: DataStoreIds[]): NavigationGuard => {
    return (_to, from) => {
      const isCategoryNavigation = from.matched.some(route => route.name === categoryRouteName)
      return initializePage({
        data,
        locales,
        mode: isCategoryNavigation ? 'deferred' : 'blocking',
      })
    }
  }
}
