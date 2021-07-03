const store = {
  namespaced: true,
  state: {
    initItems: [],
    status: 0, // 0: loading, 1: success, 2: finished
    msgItems: [],
    skipInit: false,
  },
  mutations: {
    appendInitItems(state, { msg, promise }) {
      state.initItems.push({
        msg,
        promise,
        status: 0 // 0: loading, 1: success,  -1: error
      });
    },
    initState(state) {
      state.status = 0;
      state.skipInit = false;
    },
    initSucceed(state) {
      state.status = 1;
    },
    initBeforeFinished(state) {
      if (state.status != 1)
        throw new Error('[ERROR] view init.');
      state.status = 2;
    },
    initFinished(state) {
      if (state.status != 2)
        throw new Error('[ERROR] view init.');
      state.status = 3;
      state.initItems = [];
    },
    skipInit(state) {
      state.skipInit = true;
    },
  },
  actions: {
    async startInit({ state, commit }) {
      commit('initState');
      // if ( state.initItems.length != 0 )
      //       throw new Error('Something is initializing......');
      await Promise.all(
        state.initItems.map(p => {
          return p.promise
            .then(() => p.status = 1)
            .catch(err => {
              console.error(err);
              p.status = -1;
            });
        })
      );
      if (!state.initItems.find(p => p.status == -1)) {
        commit('initSucceed');
      }
    },
  }
};

export default store;