import { useLoadingStore } from '@/stores/app/loading'
import { useNotifyStore } from '@/stores/app/notify'

interface MessageNotifyButtonItem {
  text: string;
  click: () => void;
  removeMessageAfterClick: boolean;
}

interface MessageNotifyOptions {
  buttons?: MessageNotifyButtonItem[];
  afterHide?: () => void;
}

let notifyStore: ReturnType<typeof useNotifyStore>
function MessageNotify(
  message: string,
  icon: string | MessageNotifyOptions = 'bx-bx-message-rounded-dots',
  id: string | null = null,
  options: MessageNotifyOptions = {},
): void {
  if (!notifyStore) {
    notifyStore = useNotifyStore()
  }
  if (typeof icon === 'object') {
    options = icon
    icon = 'bx-bx-message-rounded-dots'
  }
  notifyStore.createMessage({ message, icon, id, options })
}

let loadingStore: ReturnType<typeof useLoadingStore>
const LoadingHandler = {
  show(text?: string) {
    if (!loadingStore) {
      loadingStore = useLoadingStore()
    }
    loadingStore.show(text)
  },
  hide() {
    if (!loadingStore) {
      loadingStore = useLoadingStore()
    }
    loadingStore.hide()
  },
}

export default function () {
  return {
    notify: MessageNotify,
    loading: LoadingHandler,
  }
}

export type { MessageNotifyButtonItem, MessageNotifyOptions }
