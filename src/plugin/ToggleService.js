function install(Vue) {
  Vue.mixin({
    beforeCreate() {
      if (this.$options.ToggleService) {
        const strategies = Vue.config.optionMergeStrategies;
        const dataMap = {};
        Object.entries(this.$options.ToggleService).forEach(([key, value]) => {
          const group = {};
          value.forEach(p => {
            if (typeof p === 'string') {
              group[p] = false;
            }
          });
          dataMap[key] = group;
        });

        this.$options.data = strategies.data(this.$options.data, function() {
          return dataMap;
        });
        this.$toggle = toggle;
      }
    }
  });
}

function toggle(id, force) {
  const [group, sub] = id.split('/');
  if (sub) {
    force = force !== undefined ? force : !this[group][sub];
    this[group][sub] = force;
  } else {
    if (force === undefined) {
      console.warn('[toggle service] Toggle the group must pass param: force');
      return;
    }
    Object.keys(this[group]).forEach(k => this[group][k] = force);
  }
}

export default {
  install
};