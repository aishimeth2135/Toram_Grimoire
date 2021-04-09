import store from "@store/main";
import LoadingNotifyItem from "./LoadingNotifyItem";

function MessageNotify(message, icon, id=null, options={}) {
  icon = icon || 'bx-bx-message-rounded-dots';
  store.dispatch('notify/createMessage', { message, icon, id, options });
}

function LoadingNotify(message) {
  return new LoadingNotifyItem(message);
}

export default MessageNotify;

export { MessageNotify, LoadingNotify };