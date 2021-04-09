export default class LoadingNotifyItem {
  constructor(message) {
    this.message = message;
  }
  finished() {
    return true;
  }
}