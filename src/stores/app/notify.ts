import { defineStore } from 'pinia'
import { readonly, Ref, ref } from 'vue'

import { MessageNotifyButtonItem, MessageNotifyOptions } from '@/setup/Notify'

interface NotifyMessageItem {
  icon: string;
  message: string;
  id: string | null;
  options: {
    buttons?: MessageNotifyButtonItemWithId[];
    afterHide?: () => void;
  };
  counter: number;
  removeTime: number;
  iid: number;
}

interface MessageNotifyButtonItemWithId extends MessageNotifyButtonItem {
  iid: number;
}

export const useNotifyStore = defineStore('app-notify', () => {
  const messages: Ref<NotifyMessageItem[]> = ref([])
  const idCounter = ref(0)

  const appendMessage = (msg: NotifyMessageItem) => {
    messages.value.push(msg)
  }

  const removeMessage = (msg: NotifyMessageItem) => {
    const msgs = messages.value
    const idx = msgs.indexOf(msg)
    if (idx !== -1) {
      msgs.splice(idx, 1)
    }
  }

  const createMessage = ({ icon, message, id, options }: { icon: string; message: string; id: string | null; options: MessageNotifyOptions }) => {
    const find = id !== null ? messages.value.find(item => item.id !== null && item.id === id) : null
    if (!find) {
      const newOptions = {
        buttons: options.buttons ? (options.buttons.map((item, iid) => ({ iid, ...item })) as MessageNotifyButtonItemWithId[]) : undefined,
        afterHide: options.afterHide,
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
          clearInterval(timer)
        }
      }, 1000)

      appendMessage(msg)
    }
    else {
      find.counter += 1
      find.removeTime += 2
    }
  }

  return {
    messages: readonly(messages) as Ref<readonly NotifyMessageItem[]>,
    createMessage,
    removeMessage,
  }
})

export type { NotifyMessageItem, MessageNotifyButtonItemWithId }
