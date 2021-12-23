const store = {
  namespaced: true,
  state: {
    items: [],
  },
  mutations: {
    setItems(state, { items }){
      state.items = [{
        title: 'app.page-title.base',
        path: '/',
      }, ...items];
    },
  },
};
export default store;
