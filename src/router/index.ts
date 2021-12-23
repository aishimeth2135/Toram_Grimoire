import { trackRouter } from 'vue-gtag-next';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import store from '@/store';

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
      const data = to.matched.slice().reverse().find(p => p.meta?.title);
      store.dispatch('main/updateTitle', data ? data.meta.title : '');
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
        .filter(item => item.meta?.title)
        .map(item => {
          const { title, path } = item.meta;
          return {
            title,
            path: path,
          };
        }),
    });

    // set left menu
    {
      const data = to.matched.slice().reverse().find(item => item.meta?.leftMenuViewButtons);
      if (data) {
        const res = data.meta.leftMenuViewButtons!.map(({ title, icon, path }) => {
          return {
            title,
            icon: icon,
            path: data.path + path,
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
