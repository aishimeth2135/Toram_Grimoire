const mutations = {
  setEnabled(state, { container, value }) {
    container.enabled = value;
  },
  setCurrentItemId(state, { container, value }) {
    container.selectItem(value);
  },
  createCustomItem(state, { container, name }) {
    const newItem = container.createCustomItem();
    newItem.name = name;
  },
  removeCustomItem(state, { container, item }) {
    container.removeCustomItem(item);
  },
  setItemValue(state, { item, value }) {
    item.value = value;
  },
  setItemName(state, { item, value }) {
    item.name = value;
  },
};

export default {
  namespaced: true,
  mutations,
};
