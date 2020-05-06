import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    viewButtons: []
  },
  mutations: {
    setViewButtons(state, { viewButtons }){
      state.viewButtons = viewButtons;
      console.log(state.viewButtons);
    }
  }
});

export default store;