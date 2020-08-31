import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

import character from "./character";

const store = new Vuex.Store({
  modules: {
    character
  }
});

export default store;