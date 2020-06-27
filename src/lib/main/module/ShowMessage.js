import message_store from "@store/show-message.js";

function ShowMessage(message, icon='bx-bx-message-rounded-dots', id=null) {
  message_store.dispatch('createMessage', { message, icon, id });
}

function ShowLoadingMessage() {
  //
}

function loadingFinished() {
  //
}

export default ShowMessage;

export { ShowMessage, ShowLoadingMessage, loadingFinished };