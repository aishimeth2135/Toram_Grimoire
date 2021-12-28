const store = {
  namespaced: true,
  state: {
    initItems: [],
    status: 0, // 0: loading, 1: success, 2: finished
    msgItems: [],
  },
  mutations: {
    appendInitItems(state, { msg, promise }) {
      state.initItems.push({
        msg,
        promise,
        status: 0, // 0: loading, 1: success,  -1: error
      });
    },
    initState(state) {
      state.status = 0;
      state.initItems = [];
    },
    initSucceed(state) {
      state.status = 1;
    },
    initBeforeFinished(state) {
      if (state.status !== 1)
        throw new Error(`[ViewInit] Unknow error. The status should be 1 instead of ${state.status}`);
      state.status = 2;
    },
    initFinished(state) {
      if (state.status !== 2)
        throw new Error(`[ViewInit] Unknow error. The status should be 2 instead of ${state.status}`);
      state.status = 3;
      state.initItems = [];
    },
    skipInit(state) {
      state.status = 3;
    },
  },
  actions: {
    async startInit({ state, commit }) {
      await Promise.all(
        state.initItems.map(item => {
          return item.promise
            .then(() => item.status = 1)
            .catch(err => {
              console.error(err);
              item.status = -1;
            });
        }),
      );
      if (state.initItems.every(item => item.status !== -1)) {
        commit('initSucceed');
      }
    },
  },
};

export default store;
