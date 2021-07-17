import store from "@/store";
import LoadingNotifyItem from "./LoadingNotifyItem";

function MessageNotify(
  message,
  icon = 'bx-bx-message-rounded-dots',
  id = null,
  options = {},
) {
  store.dispatch('notify/createMessage', { message, icon, id, options });
}

function LoadingNotify(message) {
  return new LoadingNotifyItem(message);
}

export default MessageNotify;

export { MessageNotify, LoadingNotify };
