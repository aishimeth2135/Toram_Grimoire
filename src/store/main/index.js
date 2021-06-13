const store = {
  namespaced: true,
  state: {
    redirectPath: null,
    version: '4.1.7',
    serviceWorker: {
      instance: null,
      hasUpdate: false
    }
  },
  mutations: {
    setRedirectPath(state, path) {
      state.redirectPath = path;
    },
    clearRedirectPath(state) {
      state.redirectPath = null;
    },
    serviceWorkerHasUpdate(state, payload) {
      state.serviceWorker.instance = payload;
      state.serviceWorker.hasUpdate = true;
    },
  },
};

export default store;