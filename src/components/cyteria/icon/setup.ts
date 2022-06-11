import { PropType } from 'vue'

export type IconSrc = 'iconify' | 'custom' | 'image'

export const IconBaseProps = {
  icon: {
    type: String,
  },
  iconSrc: {
    type: String as PropType<IconSrc>,
  },
}
