import message_store from "@store/show-message.js";

function ShowMessage(message, icon, id=null, options={}) {
  icon = icon || 'bx-bx-message-rounded-dots';
  message_store.dispatch('createMessage', { message, icon, id, options });
}

function ShowLoadingMessage() {
  //
}

function loadingFinished() {
  //
}

export default ShowMessage;

export { ShowMessage, ShowLoadingMessage, loadingFinished };