import { computed, toRefs } from 'vue'
import type { ExtractPropTypes } from 'vue'

import { IconSetProps } from '../setup/icon-set'

const ButtonBaseProps = {
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  ...IconSetProps,
}

function setupButtonBase(props: ExtractPropTypes<typeof ButtonBaseProps>, clickHandler: (evt: MouseEvent) => void) {
  const { selected, disabled, inline } = toRefs(props)

  const baseClassList = computed(() => {
    return {
      'selected': selected.value,
      'disabled': disabled.value,
      'inline': inline.value,
    }
  })

  const click = (event: MouseEvent) => {
    if (disabled.value) {
      return false
    }
    clickHandler(event)
    return true
  }

  return {
    baseClassList,
    click,
  }
}

export { ButtonBaseProps, setupButtonBase }
