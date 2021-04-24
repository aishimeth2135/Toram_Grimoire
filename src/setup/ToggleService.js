import { ref, readonly } from 'vue'

export default function(options) {
  const dataMap = {};
  Object.entries(options).forEach(([key, value]) => {
    const group = {};
    value.forEach(p => {
      if (typeof p === 'string') {
        group[p] = ref(false);
      }
    });
    dataMap[key] = group;
  });

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