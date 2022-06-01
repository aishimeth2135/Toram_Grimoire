import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import { AppRouteNames } from '@/router/enums'

interface LeftMenuViewButton {
  title: string;
  icon: string;
  pathName: AppRouteNames;
}

export const useLeftMenuStore = defineStore('app-left-menu', () => {
  const viewButtons = ref<LeftMenuViewButton[]>([])
  const visible = ref<boolean>(document.body.clientWidth >= (50 + 16 * 2) * 16)

  const setViewButtons = (buttons: LeftMenuViewButton[]) => {
    viewButtons.value = buttons
  }

  const toggleVisible = (force?: boolean) => {
    visible.value = force ?? !visible.value
  }

  return {
    viewButtons: readonly(viewButtons),
    visible: readonly(visible),
    setViewButtons,
    toggleVisible,
  }
})

export type { LeftMenuViewButton }
