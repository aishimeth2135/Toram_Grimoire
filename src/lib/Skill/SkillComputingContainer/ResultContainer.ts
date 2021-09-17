export default class {
  value: string;

  private _result: string;

  constructor(value: string) {
    this.value = value;
    this._result = value.toString();
  }

  get result() {
    return this._result;
  }

  handle(handler: (value: string) => string) {
    this._result = handler(this._result);
  }
}
