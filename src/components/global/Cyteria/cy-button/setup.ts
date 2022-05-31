import { PropType } from 'vue'

export const ButtonIconProps = {
  icon: {
    type: String as PropType<string | null>,
  },
  iconSrc: {
    type: String as PropType<'iconify' | 'custom' | 'image'>,
  },
}
