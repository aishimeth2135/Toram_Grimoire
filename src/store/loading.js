import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    initItems: [],
    status: 0, // 0: loading, 1: success, 2: finished
    msgItems: []
  },
  mutations: {
    appendInitItems(state, { msg, promise }){
      state.initItems.push({
        msg,
        promise,
        status: 0 // 0: loading, 1: success,  -1: error
      });
    },
    initSucceed(state){
      state.status = 1;
    },
    initFinished(state){
      if ( state.status != 1 )
        throw new Error('error...');
      state.status = 2;
    }
  },
  actions: {
    startInit({ state, commit }){
      // if ( state.initItems.length != 0 )
      //       throw new Error('Something is initializing......');
        return Promise.all(
          state.initItems.map(p => {
            return p.promise
              .then(p => p.status = 1)
              .catch(err => {
                console.error(err);
                p.status = -1;
              });
          })
        ).then(p => commit('initSucceed'));
    },
  }
});

export default store;