import type { App } from 'vue'
import VueGtag, { type PageView } from 'vue-gtag'
import type { RouteLocationNormalized, Router } from 'vue-router'

export function initGtag(app: App<Element>, router: Router) {
  if (import.meta.env.MODE === 'development') {
    return
  }

  try {
    // type definition of vue-gtag options is incorrect?
    const options = {
      appName: 'cy-grimoire',
      config: {
        id: 'G-RHS8RFJF8S',
      },
      pageTrackerTemplate: ((to: RouteLocationNormalized) => {
        let toPath = to.path
        const rootRoute = to.matched.find(item => !!item.meta.leftMenuViewButtons)
        if (rootRoute) {
          toPath = rootRoute.path
        }
        return {
          page_title: to.name as string,
          page_path: toPath,
        } as PageView
      }) as () => PageView,
    }
    app.use(VueGtag, options, router)
  } catch (err) {
    console.warn('[init-gtag] unknown error.')
    console.log(err)
  }
}
