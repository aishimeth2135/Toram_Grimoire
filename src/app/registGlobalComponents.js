import vue_CyButton from '@/components/global/Cyteria/button.vue';
import { h, mergeProps } from "vue";

export default function(APP) {
  /* ==== [ auto regist global components ] ================= */
  const registComponents = (requireComponent, prefix = '', excludes = []) => {
    requireComponent.keys().forEach(fileName => {
      const componentConfig = requireComponent(fileName);
      const componentName = fileName.split('/').pop().replace(/\.\w+$/, '');
      if (excludes.includes(componentName)) {
        return;
      }
      APP.component(prefix + componentName, componentConfig.default || componentConfig);
    });
  }

  const requireComponent_global = require.context('@/components/global', false, /[a-zA-Z-]+\.vue$/);
  const requireComponent_cy = require.context('@/components/global/Cyteria', false, /[a-zA-Z-]+\.vue$/);

  registComponents(requireComponent_global);
  registComponents(requireComponent_cy, 'cy-');
  /* ========================================================== */

  registButtonAlias(APP);
}

function registButtonAlias(APP) {
  const aliasNames = ['icon', 'line', 'border', 'drop-down', 'check', 'inline'];
  aliasNames.map(name => {
    const componentFunction = function(props, context) {
      const attrs = mergeProps({
        type: name,
      }, context.attrs);
      return h(
        vue_CyButton,
        attrs,
        context.slots
      );
    };
    APP.component('cy-button-' + name, componentFunction);
  });
}