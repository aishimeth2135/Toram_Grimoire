
import { App } from 'vue'
import VueGtag, { PageView } from 'vue-gtag'
import { RouteLocationNormalized, Router } from 'vue-router'

export function initGtag(app: App<Element>, router: Router) {
  try {
    const options = {
      appName: 'cy-grimoire',
      config: {
        id: 'UA-140158974-1',
      },
      pageTrackerTemplate(to: RouteLocationNormalized) {
        let toPath = to.path
        if (to.meta.parentPathName) {
          const match = to.matched.find(item => item.name === to.meta.parentPathName)
          if (match) {
            toPath = match.path
          }
        }
        return {
          page_title: to.name as string,
          page_path: toPath,
        } as PageView
      },
      pageTrackerExcludedRoutes: [
        'SkillQuery',
      ],
    }
    app.use(VueGtag, options, router)
  } catch (err) {
    console.warn('[init-gtag] unknown error.')
    console.log(err)
  }
}
