import store from '@/store';
import LoadingNotifyItem from './LoadingNotifyItem';

/**
 * @param {string} message
 * @param {string} icon
 * @param {string} id
 * @param {object} options
 */
function MessageNotify(
  message,
  icon = 'bx-bx-message-rounded-dots',
  id = null,
  options = {},
) {
  store.dispatch('notify/createMessage', { message, icon, id, options });
}

/**
 * @param {string} message
 * @returns {LoadingNotifyItem}
 */
function LoadingNotify(message) {
  return new LoadingNotifyItem(message);
}

export default MessageNotify;

export { MessageNotify, LoadingNotify };
