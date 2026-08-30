import { configure } from 'vue-gtag'
import type { RouteLocationNormalized, Router } from 'vue-router'

export function initGtag(router: Router) {
  if (import.meta.env.PROD) {
    configure({
      tagId: 'G-RHS8RFJF8S',
      config: {
        app_name: 'cy-grimoire',
      },
      pageTracker: {
        router,
        useScreenview: true,
        template: (to: RouteLocationNormalized) => ({
          screen_name: to.name as string,
        }),
      },
    })
  }
}
