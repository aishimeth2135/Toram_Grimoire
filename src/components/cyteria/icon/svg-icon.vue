<template>
  <Render />
</template>

<script lang="tsx" setup>
import { mergeProps, useAttrs } from 'vue'

import Icons from '@/shared/services/SvgIcons'

interface Props {
  iconId?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconId: '',
})

const attrs = useAttrs()

const Render = () => {
  const tmp = document.createElement('template')
  tmp.innerHTML = Icons(props.iconId)
  const svgEl = tmp.content.firstChild as HTMLElement
  const tmpAttrs: Record<string, string> = {}
  Array.from(svgEl.attributes).forEach(item => {
    tmpAttrs[item.name] = item.value
  })
  const newAttrs = mergeProps(tmpAttrs, attrs)
  return <svg {...newAttrs} v-html={svgEl.innerHTML}></svg>
}
</script>
