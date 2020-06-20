import Grimoire from "@Grimoire";
import vue_bubble from "@views/other/bubble.vue";

import init from "./init.js";

export default {
  path: '/bubble/:iconName/:color?/:number?',
  component: vue_bubble,
  beforeEnter(to, from, next) {
    init().then(p => next());
  },
  meta: {
    title: () => '0.0',
    leftMenuViewButtons: []
  }
};