import store from '@/store';
import LoadingNotifyItem from './LoadingNotifyItem';

/**
 * @typedef MessageNotifyButtonItem
 * @type {Object}
 * @property {string} text - display text of button
 * @property {function(): void} click
 * @property {boolean} removeMessageAfterClick
 */
/**
 * @typedef MessageNotifyOptions
 * @type {Object}
 * @property {Array<MessageNotifyButtonItem>} buttons
 * @property {function(): void} afterHide - will be triggered after massage hidden
 */

/**
 * @param {string} message
 * @param {string | MessageNotifyOptions} [icon] - icon or options
 * @param {?string} [id]
 * @param {MessageNotifyOptions} [options]
 * @returns {void}
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
