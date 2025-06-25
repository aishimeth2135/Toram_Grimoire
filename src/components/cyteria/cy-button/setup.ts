import { computed } from 'vue'

// import { AppColors } from '@/shared/services/Color'
import { type IconBaseProps } from '../icon/setup'

export type ButtonIconProps = IconBaseProps

// type ButtonColors =
//   | AppColors.Primary
//   | 'bright'
//   | 'secondary'
//   | AppColors.Cyan
//   | AppColors.Blue
//   | AppColors.Fuchsia
//   | AppColors.Violet
//   | AppColors.Red
//   | AppColors.Orange
//   | AppColors.Emerald
//   | AppColors.Gray

export interface ButtonBaseProps {
  color?: string
  selected?: boolean
  disabled?: boolean
  link?: boolean
}

export function useButtonBaseBinds(props: ButtonBaseProps) {
  return computed(() => {
    return {
      color: props.color,
      selected: props.selected,
      disabled: props.disabled,
      link: props.link,
    }
  })
}
