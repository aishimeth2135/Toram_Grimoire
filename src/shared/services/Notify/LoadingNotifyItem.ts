export default class LoadingNotifyItem {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
  finished() {
    return true;
  }
}
