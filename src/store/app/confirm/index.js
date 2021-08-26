const storeState = {
  items: [],
};
const mutations = {
  /**
   * @typedef IconSet
   * @type {Object}
   * @property {string} name
   * @property {string} src
   */
  /**
   * @typedef ConfirmItem
   * @type {Object}
   * @property {string} message
   * @property {string|IconSet} [icon]
   * @property {Function} confirm
   * @property {Function} cancel
  */
  /**
  * @param {Object} state
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
