import { useLoadingStore } from '@/stores/app/loading'
import { useNotifyStore } from '@/stores/app/notify'

interface MessageNotifyAction {
  label: string
  onClick: () => boolean | void
  dismissOnClick?: boolean
}

interface MessageNotifyOptions {
  icon?: string
  id?: string
  actions?: MessageNotifyAction[]
  onDismiss?: () => void
}

interface MessageNotifyUndoOptions extends Omit<MessageNotifyOptions, 'actions'> {
  label: string
  onUndo: () => boolean | void
}

let notifyStore: ReturnType<typeof useNotifyStore>
function MessageNotify(message: string, options: MessageNotifyOptions = {}): void {
  if (!notifyStore) {
    notifyStore = useNotifyStore()
  }
  notifyStore.createMessage({ message, ...options })
}

MessageNotify.undo = (message: string, options: MessageNotifyUndoOptions): void => {
  const { label, onUndo, ...notifyOptions } = options
  MessageNotify(message, {
    ...notifyOptions,
    actions: [{ label, onClick: onUndo }],
  })
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

export function useNotify() {
  return MessageNotify
}

export function useLoading() {
  return LoadingHandler
}

export type { MessageNotifyAction, MessageNotifyOptions, MessageNotifyUndoOptions }
