import { PropType } from 'vue'

export const ButtonIconProps = {
  icon: {
    type: String as PropType<string | null>,
  },
  iconSrc: {
    type: String as PropType<'iconify' | 'custom' | 'image'>,
  },
}

type ButtonColors = 'primary' | 'bright' | 'secondary' | 'blue-green' | 'water-blue' | 'purple'  | 'orange' | 'green' | 'gray'

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
