import GetLang from "@Services/Language";

const store = {
  namespaced: true,
  state: {
    items: []
  },
  mutations: {
    setItems(state, { items }){
      state.items = [{
        title: GetLang('Page Title/base'),
        path: '/'
      }, ...items];
    }
  }
};
export default store;