import { type IconBaseProps } from '../icon/setup'

export type ButtonIconProps = IconBaseProps

export const ButtonTheme = {
  primary: 'theme-primary',
  bright: 'theme-bright',
  secondary: 'theme-secondary',
  cyan: 'theme-cyan',
  blue: 'theme-blue',
  fuchsia: 'theme-fuchsia',
  violet: 'theme-violet',
  red: 'theme-red',
  orange: 'theme-orange',
  emerald: 'theme-emerald',
  gray: 'theme-gray',
} as const

export type ButtonTheme = keyof typeof ButtonTheme

export interface ButtonBaseProps {
  color?: ButtonTheme
  selected?: boolean
  disabled?: boolean
}
