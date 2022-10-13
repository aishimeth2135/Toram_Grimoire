import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import { IconSrc } from '@/components/cyteria/icon/setup'

interface ConfirmItemParam {
  message: string
  icon?: string | { name: string; src: IconSrc }
  confirm?: () => void
  cancel?: () => void
}

interface ConfirmItem extends ConfirmItemParam {
  icon: string | { name: string; src: IconSrc }
}

export const useConfirmStore = defineStore('app-confirm', () => {
  const items = ref<ConfirmItem[]>([])

  const appendItem = (item: ConfirmItemParam) => {
    item.icon = item.icon ?? 'ic:round-help-outline'
    items.value.push(item as ConfirmItem)
  }

  const nextItem = () => {
    items.value.shift()
  }

  return {
    confirmItems: readonly(items),
    appendItem,
    nextItem,
  }
})

export type { ConfirmItem, ConfirmItemParam }
