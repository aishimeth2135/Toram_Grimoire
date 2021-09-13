import store from '@/store';

import LoadingNotifyItem from './LoadingNotifyItem';

type MessageNotifyButtonItem = {
  text: string;
  click: () => void;
  removeMessageAfterClick: boolean;
};

type MessageNotifyOptions = {
  buttons?: MessageNotifyButtonItem[];
  afterHide?: () => void;
};

function MessageNotify(
  message: string,
  icon: string | MessageNotifyOptions = 'bx-bx-message-rounded-dots',
  id: string | null = null,
  options: MessageNotifyOptions = {},
): void {
  if (typeof icon === 'object') {
    options = icon;
    icon = 'bx-bx-message-rounded-dots';
  }
  store.dispatch('notify/createMessage', { message, icon, id, options });
}

function LoadingNotify(message: string) {
  return new LoadingNotifyItem(message);
}

export default MessageNotify;

export { MessageNotify, LoadingNotify };
