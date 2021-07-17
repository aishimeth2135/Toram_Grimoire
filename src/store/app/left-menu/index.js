const store = {
  namespaced: true,
  state: {
    viewButtons: [],
  },
  mutations: {
    setViewButtons(state, { viewButtons }){
      state.viewButtons = viewButtons;
    },
  },
};
export default store;
