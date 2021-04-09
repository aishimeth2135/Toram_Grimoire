import vue_page404 from "@views/app/page404.vue";
import ViewInit from "@Service/ViewInit.js";

// import GetLang from "@Service/Language";

export default {
  path: '*',
  component: vue_page404,
  beforeEnter(to, from, next) {
    ViewInit().then(next);
  },
  meta: {
    title: () => '404',
    leftMenuViewButtons: []
  }
};