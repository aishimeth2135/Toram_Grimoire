import { toRefs, computed } from 'vue'
import type { ExtractPropTypes } from 'vue'

import Color from '@/shared/services/Color'

const ColorList = Color.List

const colorValidator = (value: string) => {
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

function getColorSetStyles(src: ExtractPropTypes<typeof ColorSetProps>) {
  const {
    textColor,
    textColorHover,
    iconColor,
    iconColorHover,
    borderColor,
    borderColorHover,
    mainColor,
  } = toRefs(src)

  const colorPropWithDefault = (value: string, id: string, defaultValue: string) => {
    const [name, type = ''] = id.split('/')
    if (value === '!default') {
      return defaultValue
    }
    if (value === 'default') {
      if (mainColor.value !== 'default') {
        const mc = mainColor.value
        return type === 'hover' || name === 'text' ? mc : Color.lighten(mc)
      } else {
        return defaultValue
      }
    }
    return value
  }

  const handle = (key: string, color: string, colorHover: string) => {
    return {
      [`--color-set--${key}-color`]: `var(--primary-${color})`,
      [`--color-set--${key}-color-hover`]: `var(--primary-${colorHover})`,
    } as Record<string, string>
  }

  return {
    ...handle(
      'text',
      colorPropWithDefault(textColor.value, 'text', 'dark'),
      colorPropWithDefault(textColorHover.value, 'text/hover', 'light-4'),
    ),
    ...handle(
      'icon',
      colorPropWithDefault(iconColor.value, 'icon', 'light-2'),
      colorPropWithDefault(iconColorHover.value, 'icon/hover', 'light-4'),
    ),
    ...handle(
      'border',
      colorPropWithDefault(borderColor.value, 'border', 'light'),
      colorPropWithDefault(borderColorHover.value, 'border/hover', 'light-3'),
    ),
  }
}

function setupColorSetStyles(src: ExtractPropTypes<typeof ColorSetProps>) {
  const colorSetStyles = computed(() => {
    return getColorSetStyles(src)
  })

  return {
    colorSetStyles,
  }
}

export { ColorSetProps, getColorSetStyles, setupColorSetStyles }
