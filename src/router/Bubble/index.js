import init from "./init.js";

const vue_bubble = () => import("@views/other/bubble.vue");

export default {
  path: '/bubble/:iconName/:color?/:number?',
  component: vue_bubble,
  beforeEnter(to, from, next) {
    init().then(() => next());
  },
  meta: {
    title: () => '0.0',
    leftMenuViewButtons: []
  }
};