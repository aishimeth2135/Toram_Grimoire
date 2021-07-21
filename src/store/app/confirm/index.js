const storeState = {
  items: [],
};
const mutations = {
  /**
   * @typedef IconSet
   * @type {object}
   * @property {string} name
   * @property {string} src
   */
  /**
   * @typedef ConfirmItem
   * @type {object}
   * @property {string} message
   * @property {string|IconSet} [icon]
   * @property {function} confirm
   * @property {function} cancel
  */
  /**
  * @param {object} state
  * @param {ConfirmItem} item
  */
  appendItem(state, item) {
    item.icon = item.icon || 'mdi-leaf';
    state.items.push(item);
  },
  shiftItem(state) {
    state.items.shift();
  },
};

export default {
  namespaced: true,
  state: storeState,
  mutations,
};
