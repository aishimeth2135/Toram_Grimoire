import type { App } from 'vue'
import VueGtag, { type PageView } from 'vue-gtag'
import type { RouteLocationNormalized, Router } from 'vue-router'

import { AppRouteNames } from '@/router/enums'

export function initGtag(app: App<Element>, router: Router) {
  try {
    // type definition of vue-gtag options is incorrect?
    const options = {
      appName: 'cy-grimoire',
      config: {
        id: 'G-RHS8RFJF8S',
      },
      pageTrackerTemplate: ((to: RouteLocationNormalized) => {
        let toPath = to.path
        if (to.meta.parentPathName) {
          const match = to.matched.find(
            item => item.name === to.meta.parentPathName
          )
          if (match) {
            toPath = match.path
          }
        }
        return {
          page_title: to.name as string,
          page_path: toPath,
        } as PageView
      }) as () => PageView,
      pageTrackerExcludedRoutes: [AppRouteNames.SkillQuery],
    }
    app.use(VueGtag, options, router)
  } catch (err) {
    console.warn('[init-gtag] unknown error.')
    console.log(err)
  }
}
