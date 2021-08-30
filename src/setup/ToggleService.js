import { ref, readonly, Ref } from 'vue'

/**
 * @callback Toggle
 * @param {string} id
 * @param {?boolean} [force]
 * @param {boolean} [groupForce]
 * @returns {void}
 */
/**
 * @typedef ToggleItemDetail
 * @type {Object}
 * @property {string} name
 * @property {?boolean} default
 */
/**
 * @typedef ToggleItem
 * @type {ToggleItemDetail | string}
 */
/**
 * @param {Object.<string, Array<ToggleItem>>} options
 * @returns {Object.<string, Object.<string, boolean>> & { toggle: Toggle }}
 */
export default function(options) {
  /** @type {Object<string, Object<string, Ref<boolean>>>} */
  const dataMap = {};
  Object.entries(options).forEach(([groupKey, subs]) => {
    const group = {};
    subs.forEach(subItem => {
      if (typeof subItem === 'string') {
        group[subItem] = ref(false);
      } else if (typeof subItem === 'object') {
        const { name, default: defaultValue } = subItem;
        group[name] = ref(defaultValue);
      }
    });
    dataMap[groupKey] = group;
  });

  /** @type {Toggle} */
  const toggle = (id, force, groupForce) => {
    const [group, sub] = id.split('/');
    if (sub) {
      force = typeof force === 'boolean' ? force : !dataMap[group][sub].value;
      dataMap[group][sub].value = force;
      if (groupForce !== undefined) {
        Object.entries(dataMap[group]).forEach(([key, item]) => {
          if (key !== sub) {
            item.value = groupForce;
          }
        });
      }
    } else {
      if (force === undefined) {
        console.warn('[toggle service] Toggle the group must pass param: force');
        return;
      }
      Object.values(dataMap[group]).forEach(item => item.value = force);
    }
  }

  const data = {};
  Object.keys(dataMap).forEach(k => data[k] = readonly(dataMap[k]));

  data.toggle = toggle;

  return data;
}
