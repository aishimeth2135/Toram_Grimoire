import { useNotifyStore } from '@/stores/app/notify';

import LoadingNotifyItem from './LoadingNotifyItem';

interface MessageNotifyButtonItem {
  text: string;
  click: () => void;
  removeMessageAfterClick: boolean;
}

interface MessageNotifyOptions {
  buttons?: MessageNotifyButtonItem[];
  afterHide?: () => void;
}

let notifyStore: ReturnType<typeof useNotifyStore>;

function MessageNotify(
  message: string,
  icon: string | MessageNotifyOptions = 'bx-bx-message-rounded-dots',
  id: string | null = null,
  options: MessageNotifyOptions = {},
): void {
  if (!notifyStore) {
    notifyStore = useNotifyStore();
  }
  if (typeof icon === 'object') {
    options = icon;
    icon = 'bx-bx-message-rounded-dots';
  }
  notifyStore.createMessage({ message, icon, id, options });
}

function LoadingNotify(message: string) {
  return new LoadingNotifyItem(message);
}

export default function () {
  return {
    notify: MessageNotify,
    loading: LoadingNotify,
  };
}

export type { MessageNotifyButtonItem, MessageNotifyOptions };
