const store = {
  namespaced: true,
  state: {
    items: [],
  },
  mutations: {
    setItems(state, { items }){
      state.items = [{
        title: 'app.page-title.base',
        pathName: 'Home',
      }, ...items];
    },
  },
};
export default store;
