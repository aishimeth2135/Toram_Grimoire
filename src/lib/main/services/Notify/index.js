import store from '@/store';
import LoadingNotifyItem from './LoadingNotifyItem';

/**
 * @callback MessageNotifyComplete
 * @param {string} message
 * @param {string} [icon]
 * @param {string} [id]
 * @param {object} [options]
 */
/**
 * @callback MessageNotifyOptionsOnly
 * @param {string} message
 * @param {object} [options]
 */

/**
 * @type {MessageNotifyComplete | MessageNotifyOptionsOnly}
 */
function MessageNotify(
  message,
  icon = 'bx-bx-message-rounded-dots',
  id = null,
  options = {},
) {
  if (typeof icon === 'object') {
    options = icon;
    icon = 'bx-bx-message-rounded-dots';
  }
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
