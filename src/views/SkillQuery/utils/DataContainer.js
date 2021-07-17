import { isNumberString } from "@utils/string";

class DataContainer {
  constructor(o, branch, key) {
    this.branch = branch;
    this.key = key;
    this.origin = o;
    this._value = o;
    this._result = o;
  }
  set(v) {
    this._value = v;
    this._result = v;
  }
  handle(_handle) {
    this.set(_handle(this._value));
  }
  handleResult(_handle) {
    this._result = _handle(this._result);
  }
  isNumberValue() {
    return isNumberString(this._value);
  }
  value() {
    return this._value;
  }
  result() {
    return this._result;
  }
}

export default DataContainer;
