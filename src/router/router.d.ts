import 'vue-router'

import { LeftMenuViewButton } from '@/stores/app/left-menu'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    leftMenuViewButtons?: LeftMenuViewButton[]
    metaTags?: Record<string, string>[]
    twoColumnsLayout?: boolean
    wideLayout?: boolean
  }
}
