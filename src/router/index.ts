import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useMainStore } from '@/stores/app/main'
import { useNavStore } from '@/stores/app/nav'
import type { NavItem } from '@/stores/app/nav'
import { useLeftMenuStore } from '@/stores/app/left-menu'

import Bubble from './Bubble'
import DamageCalculation from './Calculation/Damage'
import Character from './Character'
import Enchant from './Enchant'
import Home from './Home'
import Items from './Items'
import Page404 from './Page404'
import Skill from './Skill'

export default function createAppRouter() {
  const routes: RouteRecordRaw[] = [
    Home,
    Character,
    Skill,
    Items,
    Enchant,
    Page404,
    Bubble,
    DamageCalculation,
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  const mainStore = useMainStore()
  const navStore = useNavStore()
  const leftMenuStore = useLeftMenuStore()

  router.beforeEach((to, from) => {
    mainStore.startRouting()

    if (to.name === 'SkillSimulator') {
      if (from.name !== 'CharacterSimulator') {
        mainStore.setRedirectPathName('SkillSimulator')
        return { name: 'CharacterSimulator' }
      }
    }
  })

  router.afterEach((to) => {
    if (to) {
      { // set title and meta tags
        const data = to.matched.slice().reverse().find(p => p.meta?.title)
        mainStore.updateTitle(data ? data.meta.title : '')
      }
      {
        document.head.querySelectorAll('*[data-vue-router-mata-tag-controlled]').forEach(el => el.remove())
        const data = to.matched.slice().reverse().find(p => p.meta && p.meta.metaTags)
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
        const data = to.matched.slice().reverse().find(item => item.meta?.leftMenuViewButtons)
        if (data) {
          const res = data.meta.leftMenuViewButtons!.map(({ title, icon, pathName }) => {
            return {
              title,
              icon: icon,
              pathName,
            }
          })

          leftMenuStore.setViewButtons(res)
        }
      }
    }

    mainStore.endRouting()
  })

  return router
}
