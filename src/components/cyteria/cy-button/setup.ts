import { PropType, computed } from 'vue'

import { AppColors } from '@/shared/services/Color'

import { IconBaseProps, IconSrc } from '../icon/setup'

export const ButtonIconPropList = {
  ...IconBaseProps,
  icon: {
    type: String as PropType<string | null>,
  },
}

export interface ButtonIconProps {
  icon?: string | null
  iconSrc?: IconSrc
}

type ButtonColors =
  | AppColors.Primary
  | 'bright'
  | 'secondary'
  | AppColors.Cyan
  | AppColors.Blue
  | AppColors.Fuchsia
  | AppColors.Violet
  | AppColors.Red
  | AppColors.Orange
  | AppColors.Emerald
  | AppColors.Gray

export const ButtonBasePropList = {
  color: {
    type: String,
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

export interface ButtonBaseProps {
  color?: string
  selected?: boolean
  disabled?: boolean
  link?: boolean
}

export function useButtonBaseBinding(props: ButtonBaseProps) {
  const buttonBaseBinding = computed(() => {
    return {
      color: props.color,
      selected: props.selected,
      disabled: props.disabled,
      link: props.link,
    }
  })

  return {
    buttonBaseBinding,
  }
}

export function getButtonBaseBinds(props: ButtonBaseProps) {
  return {
    color: props.color,
    selected: props.selected,
    disabled: props.disabled,
    link: props.link,
  }
}
