import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

import character from "./character";
import main from "./main.js";

const store = new Vuex.Store({
  modules: {
    main,
    character
  }
});

export default store;