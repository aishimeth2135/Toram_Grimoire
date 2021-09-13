import ViewInit from '@/shared/services/ViewInit';

import vue_page404 from '@/views/app/page404.vue';

// import GetLang from "@services/Language";

export default {
  path: '/:pathMatch(.*)*',
  component: vue_page404,
  beforeEnter(to, from, next) {
    ViewInit().then(next);
  },
  meta: {
    title: () => '404',
    leftMenuViewButtons: [],
  },
};
