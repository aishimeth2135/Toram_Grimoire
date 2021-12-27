import Grimoire from '@/shared/Grimoire';

const store = {
  namespaced: true,
  state: {
    redirectPathName: null,
    version: '4.3.4',
    serviceWorker: {
      instance: null,
      hasUpdate: false,
    },
    documentTitleId: '',
  },
  mutations: {
    setRedirectPathName(state, path) {
      state.redirectPathName = path;
    },
    clearRedirectPathName(state) {
      state.redirectPathName = null;
    },
    serviceWorkerHasUpdate(state, payload) {
      state.serviceWorker.instance = payload;
      state.serviceWorker.hasUpdate = true;
    },
    setTitleId(state, titleId = null) {
      if (titleId !== null) {
        state.documentTitleId = titleId;
      }
    },
  },
  actions: {
    updateTitle({ state, commit, rootState }, titleId = null) {
      commit('setTitleId', titleId);
      if (!rootState.language.i18nMessageLoaded) {
        return;
      }
      let title = Grimoire.i18n.t('app.page-title.base');
      if (state.documentTitleId) {
        title += '｜' + Grimoire.i18n.t(state.documentTitleId);
      }
      window.document.title = title;
    },
  },
};

export default store;
