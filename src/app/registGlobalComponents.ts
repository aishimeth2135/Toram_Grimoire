import type { App, FunctionalComponent } from 'vue'
import { h, mergeProps } from 'vue'

import vue_CyButton from '@/components/global/Cyteria/button.vue'

export default function(APP: App<Element>) {
  /* ==== [ auto regist global components ] ================= */
  const registComponents = (requireComponent: __WebpackModuleApi.RequireContext, prefix = '', excludes: string[] = []) => {
    requireComponent.keys().forEach(fileName => {
      const componentConfig = requireComponent(fileName)
      const componentName = (fileName.split('/').pop() as string).replace(/\.\w+$/, '')
      if (excludes.includes(componentName)) {
        return
      }
      APP.component(prefix + componentName, componentConfig.default || componentConfig)
    })
  }

  const requireComponent_global = require.context('@/components/global', false, /[a-zA-Z-]+\.vue$/)
  const requireComponent_cy = require.context('@/components/global/Cyteria', false, /[a-zA-Z-]+\.vue$/)

  registComponents(requireComponent_global)
  registComponents(requireComponent_cy, 'cy-')
  /* ========================================================== */

  registButtonAlias(APP)
}

function registButtonAlias(APP: App<Element>) {
  const aliasNames = ['icon', 'line', 'border', 'drop-down', 'check', 'inline', 'switch', 'radio', 'circle']
  aliasNames.map(name => {
    const componentFunction: FunctionalComponent = function(props, context) {
      const attrs = mergeProps({
        type: name,
      }, context.attrs)
      return h(
        vue_CyButton,
        attrs,
        context.slots,
      )
    }
    APP.component('cy-button-' + name, componentFunction)
  })
}
