import { ref, readonly } from 'vue'

/**
 * @callback Toggle
 * @param {string} id
 * @param {boolean} force
 * @returns {void}
 */
/**
 * @typedef ToggleItemDetail
 * @type {Object}
 * @property {string} name
 * @property {boolean} boolean
 */
/**
 * @typedef ToggleItem
 * @type {ToggleItemDetail | string}
 */
/**
 * @param {Object.<string, ToggleItem[]>} options
 * @returns {Object.<string, Object.<string, boolean>> & { toggle: Toggle }}
 */
export default function(options) {
  const dataMap = {};
  Object.entries(options).forEach(([key, value]) => {
    const group = {};
    value.forEach(p => {
      if (typeof p === 'string') {
        group[p] = ref(false);
      } else if (typeof p === 'object') {
        const { name, default: defaultValue } = p;
        group[name] = ref(defaultValue);
      }
    });
    dataMap[key] = group;
  });

  /** @type {Toggle} */
  const toggle = (id, force) => {
    const [group, sub] = id.split('/');
    if (sub) {
      force = force !== undefined ? force : !dataMap[group][sub].value;
      dataMap[group][sub].value = force;
    } else {
      if (force === undefined) {
        console.warn('[toggle service] Toggle the group must pass param: force');
        return;
      }
      Object.keys(dataMap[group]).forEach(k => dataMap[group][k].value = force);
    }
  }

  const data = {};
  Object.keys(dataMap).forEach(k => data[k] = readonly(dataMap[k]));

  data.toggle = toggle;

  return data;
}
