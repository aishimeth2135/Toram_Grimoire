import vue_page404 from "@views/app/page404.vue";
import ViewInit from "@Services/ViewInit.js";

// import GetLang from "@Services/Language";

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