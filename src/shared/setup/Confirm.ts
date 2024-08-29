import { type ConfirmItemParam, useConfirmStore } from '@/stores/app/confirm'

const _confirm = (item: string | ConfirmItemParam) => {
  const confirmStore = useConfirmStore()
  const realItem: ConfirmItemParam =
    typeof item === 'string'
      ? {
          message: item,
        }
      : item

  const emptyFun = () => {}
  const oldConfirm = realItem.confirm || emptyFun
  const oldCancel = realItem.cancel || emptyFun
  return new Promise<boolean>(resolve => {
    const resItem = {
      message: realItem.message,
      icon: realItem.icon,
      confirm: () => {
        oldConfirm()
        resolve(true)
      },
      cancel: () => {
        oldCancel()
        resolve(false)
      },
    }
    confirmStore.appendItem(resItem)
  })
}

export default function () {
  return {
    confirm: _confirm,
  }
}
