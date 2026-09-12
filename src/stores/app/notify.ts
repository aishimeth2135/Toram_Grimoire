import { defineStore } from 'pinia'
import { type Ref, readonly, ref } from 'vue'

import type { MessageNotifyAction, MessageNotifyOptions } from '@/shared/setup/Notify'

interface NotifyMessageItem {
  icon: string
  message: string
  id: string | null
  options: {
    actions?: MessageNotifyActionWithId[]
    onDismiss?: () => void
  }
  counter: number
  removeTime: number
  iid: number
}

interface MessageNotifyActionWithId extends MessageNotifyAction {
  iid: number
}

export const useNotifyStore = defineStore('app-notify', () => {
  const messages: Ref<NotifyMessageItem[]> = ref([])
  const idCounter = ref(0)
  const timers = new Map<number, ReturnType<typeof setInterval>>()

  const appendMessage = (msg: NotifyMessageItem) => {
    messages.value.push(msg)
  }

  const removeMessage = (msg: NotifyMessageItem) => {
    const msgs = messages.value
    const idx = msgs.indexOf(msg)
    if (idx !== -1) {
      msgs.splice(idx, 1)
      clearInterval(timers.get(msg.iid))
      timers.delete(msg.iid)
      msg.options.onDismiss?.()
    }
  }

  const createMessage = ({
    message,
    icon = 'bx-bx-message-rounded-dots',
    id = null,
    actions,
    onDismiss,
  }: Omit<MessageNotifyOptions, 'id'> & { message: string; id?: string | null }) => {
    const find =
      id !== null ? messages.value.find(item => item.id !== null && item.id === id) : null
    if (!find) {
      const newOptions = {
        actions: actions
          ? (actions.map((item, iid) => ({
              iid,
              ...item,
            })) as MessageNotifyActionWithId[])
          : undefined,
        onDismiss,
      }
      const msg: NotifyMessageItem = {
        icon,
        message,
        id,
        options: newOptions,
        counter: 1,
        removeTime: 4,
        iid: idCounter.value,
      }
      idCounter.value += 1
      const timer = setInterval(() => {
        msg.removeTime -= 1
        if (msg.removeTime <= 0) {
          removeMessage(msg)
        }
      }, 1000)
      timers.set(msg.iid, timer)

      appendMessage(msg)
    } else {
      find.counter += 1
      find.removeTime = Math.min(find.removeTime + 1, 8)
    }
  }

  return {
    messages: readonly(messages) as Ref<readonly NotifyMessageItem[]>,
    createMessage,
    removeMessage,
  }
})

export type { NotifyMessageItem, MessageNotifyActionWithId }
