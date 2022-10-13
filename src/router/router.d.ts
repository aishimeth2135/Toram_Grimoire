import 'vue-router'

import { LeftMenuViewButton } from '@/stores/app/left-menu'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string | null
    leftMenuViewButtons?: LeftMenuViewButton[]
    metaTags?: Record<string, string>[]
    twoColumnsLayout?: boolean

    // parent path name to get pure path without params
    parentPathName?: string
  }
}
