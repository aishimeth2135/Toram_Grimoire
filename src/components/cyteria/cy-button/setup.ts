import { PropType } from 'vue'

import { IconBaseProps } from '../icon/setup'

export const ButtonIconProps = {
  ...IconBaseProps,
  icon: {
    type: String as PropType<string | null>,
  },
}

type ButtonColors = 'primary' | 'bright' | 'secondary' | 'cyan' | 'blue' | 'fuchsia' | 'violet' | 'red' | 'orange' | 'emerald' | 'gray'

export const ButtonBaseProps = {
  color: {
    type: String as PropType<ButtonColors>,
    default: 'primary',
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  link: {
    type: Boolean,
    default: false,
  },
}

interface ButtonBaseComponent {
  color: ButtonColors;
  selected: boolean;
  disabled: boolean;
  link: boolean;
}

export function getButtonBaseBinds(component: ButtonBaseComponent) {
  return {
    color: component.color,
    selected: component.selected,
    disabled: component.disabled,
    link: component.link,
  }
}
