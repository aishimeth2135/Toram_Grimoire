import { trackRouter } from 'vue-gtag-next';
import { createRouter, createWebHistory, RouteMeta } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import store from '@/store';

import GetLang from '@/shared/services/Language';

import Bubble from './Bubble';
import DamageCalculation from './Calculation/Damage';
import Character from './Character';
import Enchant from './Enchant';
import Home from './Home';
import Items from './Items';
import Page404 from './Page404';
import Skill from './Skill';


const routes: RouteRecordRaw[] = [
  Home,
  Character,
  Skill,
  Items,
  Enchant,
  Page404,
  Bubble,
  DamageCalculation,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

trackRouter(router);

router.beforeEach((to, from) => {
  if (to) {
    { // set title and meta tags
      const data = to.matched.slice().reverse().find(p => p.meta && p.meta.title);
      if (data) {
        const title = data.meta.title;
        document.title = GetLang('Page Title/base') + '｜' + (typeof title === 'function' ? title() : title);
      } else {
        document.title = GetLang('Page Title/base');
      }
    }
    {
      document.head.querySelectorAll('*[data-vue-router-mata-tag-controlled]').forEach(el => el.remove());
      const data = to.matched.slice().reverse().find(p => p.meta && p.meta.metaTags);
      if (data) {
        const metaTags = data.meta.metaTags;
        if (metaTags) {
          const els = metaTags.map(def => {
            const el = document.createElement('meta');
            Object.keys(def).forEach(key => el.setAttribute(key, def[key]));
            el.setAttribute('data-vue-router-mata-tag-controlled', '');
            return el;
          });
          document.head.append(...els);
        }
      }
    }

    // set nav
    store.commit('nav/setItems', {
      items: to.matched
        .filter(p => p.meta && p.meta.title)
        .map(p => {
          const title = p.meta.title;
          return {
            title: typeof title === 'function' ? title() : title,
            path: p.path,
          };
        }),
    });

    // set left menu
    {
      const data = to.matched.slice().reverse().find(p => p.meta && p.meta.leftMenuViewButtons);
      if (data) {
        const res = (data.meta.leftMenuViewButtons as NonNullable<RouteMeta['leftMenuViewButtons']>).map(p => {
          return {
            title: typeof p.title === 'function' ? p.title() : p.title,
            icon: p.icon,
            path: data.path + p.path,
          };
        });

        store.commit('left-menu/setViewButtons', { viewButtons: res });
      }
    }
  }

  if (to.path === '/character/skill') {
    if (from.path !== '/character') {
      store.commit('main/setRedirectPath', '/character/skill');
      return '/character';
    }
  }
});

export default router;
