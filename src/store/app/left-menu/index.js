const store = {
  namespaced: true,
  state: {
    viewButtons: [],
    visible: document.body.clientWidth >= (50 + 16 + 16) * 16,
  },
  mutations: {
    setViewButtons(state, { viewButtons }){
      state.viewButtons = viewButtons;
    },
    toggleVisible(state, force) {
      state.visible = force ?? !state.visible;
    },
  },
};
export default store;
