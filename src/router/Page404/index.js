import vue_page404 from "@/views/app/page404.vue";
import ViewInit from "@services/ViewInit.js";

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
