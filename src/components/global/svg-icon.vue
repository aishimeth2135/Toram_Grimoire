<script>
import { h, mergeProps } from 'vue'

import Icons from '@/shared/services/SvgIcons'

function SvgIcon(props, context) {
  const tmp = document.createElement('template')
  tmp.innerHTML = Icons(props.iconId)
  const svgEl = tmp.content.firstChild
  const tmpAttrs = {}
  Array.from(svgEl.attributes).forEach(item => {
    tmpAttrs[item.name] = item.value
  })
  const attrs = mergeProps(tmpAttrs, context.attrs)
  return h('svg', {
    ...attrs,
    innerHTML: svgEl.innerHTML,
  })
}
SvgIcon.props = {
  'iconId': {
    type: String,
    default: '',
  },
}

export default SvgIcon
</script>
