const state = {
  items: []
};
const mutations = {
  /**
   * @callback Confirm
   * @returns {void}
  */
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
   * @property {Confirm} confirm
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
  }
};

export default {
  namespaced: true,
  state,
  mutations
};