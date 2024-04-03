import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'

import { useLeftMenuStore } from '@/stores/app/left-menu'
import { useMainStore } from '@/stores/app/main'
import { NavItem, useNavStore } from '@/stores/app/nav'

import Book from './Book'
import Bubble from './Bubble'
import Character from './Character'
import DamageCalculation from './DamageCalculation'
import Dev from './Dev'
import Enchant from './Enchant'
import Glossary from './Glossary'
import Home from './Home'
import Items from './Items'
import Page404 from './Page404'
import Registlet from './Registlet'
import Skill from './Skill'

export default function createAppRouter() {
  const routes: RouteRecordRaw[] = [
    Home,
    Dev,
    Character,
    Skill,
    Items,
    Enchant,
    Glossary,
    Book,
    Page404,
    Bubble,
    DamageCalculation,
    Registlet,
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  const mainStore = useMainStore()
  const navStore = useNavStore()
  const leftMenuStore = useLeftMenuStore()

  router.beforeEach(() => {
    mainStore.startRouting()
  })

  router.afterEach(to => {
    if (to) {
      {
        // set title and meta tags
        const data = to.matched
          .slice()
          .reverse()
          .find(item => item.meta?.title)
        mainStore.updateTitle(data ? data.meta.title : '')
      }
      {
        document.head
          .querySelectorAll('*[data-vue-router-mata-tag-controlled]')
          .forEach(el => el.remove())
        const data = to.matched
          .slice()
          .reverse()
          .find(item => item.meta && item.meta.metaTags)
        if (data) {
          const metaTags = data.meta.metaTags
          if (metaTags) {
            const els = metaTags.map(def => {
              const el = document.createElement('meta')
              Object.keys(def).forEach(key => el.setAttribute(key, def[key]))
              el.setAttribute('data-vue-router-mata-tag-controlled', '')
              return el
            })
            document.head.append(...els)
          }
        }
      }

      // set nav
      const navItems: NavItem[] = to.matched
        .filter(item => item.meta?.title)
        .map(item => {
          const { name, meta } = item
          if (!name) {
            console.warn('[Router] name of route:', item, 'not found.')
          }
          return {
            title: meta.title as string,
            pathName: (name || 'Home') as string,
          }
        })
      navStore.setItems(navItems)

      // set left menu
      {
        const data = to.matched
          .slice()
          .reverse()
          .find(item => item.meta?.leftMenuViewButtons)
        if (data) {
          leftMenuStore.setViewButtons(data.meta.leftMenuViewButtons!)
        }
      }
    }

    mainStore.endRouting()
  })

  return router
}
