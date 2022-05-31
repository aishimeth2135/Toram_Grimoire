<script lang="ts">
import { defineComponent } from 'vue'

import Color from '@/shared/services/Color'

const ColorList = Color.List

function colorValidator(value: string) {
  return value === 'default' || value === '!default' || ColorList.includes(value)
}

const ColorSetProps = {
  textColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  textColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  iconColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  iconColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  borderColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  borderColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  mainColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
}

type PropKeys = keyof typeof ColorSetProps

function getColorSetStyle(src: Record<PropKeys, string>) {
  const props = {} as Record<PropKeys, string>

  (Object.keys(ColorSetProps) as PropKeys[]).forEach(key => {
    props[key] = src[key]
  })

  const defaultProp = (id: string, defaultValue: string) => {
    const [name, type = ''] = id.split('/')
    const key = (name + 'Color' + (type ? (type[0].toUpperCase() + type.slice(1)) : '')) as PropKeys
    if (props[key] === '!default') {
      props[key] = defaultValue
      return
    }
    if (props[key] === 'default') {
      if (props.mainColor !== 'default') {
        const mc = props.mainColor
        props[key] = type === 'hover' || name === 'text' ? mc : Color.lighten(mc)
      } else {
        props[key] = defaultValue
      }
    }
  }

  defaultProp('text', 'dark')
  defaultProp('text/hover', 'light-4')
  defaultProp('icon', 'light-2')
  defaultProp('icon/hover', 'light-4')
  defaultProp('border', 'light')
  defaultProp('border/hover', 'light-3')

  const handleColor = (color: string) => `var(--app-${color})`

  return {
    '--color-set--text-color': handleColor(props.textColor),
    '--color-set--icon-color': handleColor(props.iconColor),
    '--color-set--border-color': handleColor(props.borderColor),
    '--color-set--text-color-hover': handleColor(props.textColorHover),
    '--color-set--icon-color-hover': handleColor(props.iconColorHover),
    '--color-set--border-color-hover': handleColor(props.borderColorHover),
  } as Record<string, string>
}

export { ColorSetProps, getColorSetStyle }

export default defineComponent({
  props: ColorSetProps,
  computed: {
    colorSetStyle() {
      return getColorSetStyle(this)
    },
  },
})
</script>
