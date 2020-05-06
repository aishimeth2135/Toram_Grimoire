import Vuex from "vuex";
import Vue from "vue";

import GetLang from "@global-modules/LanguageSystem.js";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    items: []
  },
  mutations: {
    setItems(state, { items }){
      state.items = [{
        title: GetLang('Page Title/base'),
        path: '/'
      }, ...items];
    }
  }
});

export default store;