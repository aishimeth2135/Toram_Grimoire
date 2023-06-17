import { Ref } from 'vue'
import { computed } from 'vue'

import Color from '@/shared/services/Color'

export function normalizeColorString(color: string) {
  if (!color.includes('-') && color !== 'white') {
    return color + '-60'
  }
  return color
}

function normalizeIconColorString(color: string) {
  if (!color.includes('-') && color !== 'white') {
    return color + '-30'
  }
  return color
}

export function useIconColor(
  color: Ref<string | null | undefined>,
  defaultValue: string
) {
  const iconColor = computed(() => {
    if (!color.value) {
      return defaultValue
    }
    return normalizeIconColorString(color.value)
  })

  const iconClass = computed(() => `text-${iconColor.value}`)
  return { iconClass }
}

export function useColorString(
  baseColor: Ref<string | null>,
  srcColor: Ref<undefined | null | string>,
  defaultValue: string,
  lighten?: Ref<boolean>
) {
  return computed(() => {
    let value = srcColor.value
    if (typeof value !== 'string') {
      if (baseColor.value) {
        const color = normalizeColorString(baseColor.value)
        value = lighten?.value ? Color.lighten(color) : color
      } else {
        value = 'default'
      }
    }
    return value === 'default' ? defaultValue : normalizeColorString(value)
  })
}
