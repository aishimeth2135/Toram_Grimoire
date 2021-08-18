const mutations = {
  setItemValue(state, { item, value }) {
    item.value = value;
  },
  setContainerEnabled(state, { container, value }) {
    console.log(container, value);
    container.enabled = value;
  },
  setContainerCurrentItemId(state, { container, value }) {
    container.selectItem(value);
  },
};

export default {
  namespaced: true,
  mutations,
};
