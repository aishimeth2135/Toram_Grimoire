import element from "./element.js";
import Icons from "../SvgIcons.js";

export default class WindowController {
  constructor() {
    this.windows = {};
    this.currentWindows = [];

    const ctrr = this;
    this.listeners = {
      closeWindow(e) {
        ctrr.closeWindow(this.getAttribute('data-window-name'));
      }
    };

    this.init();
  }
  init() {
    this.mainNode = element.simpleCreateHTML('div', ['Cyteria', 'window-container']);
    this.backgroundMask = element.simpleCreateHTML('div', ['Cyteria', 'window-bg-mask', 'hidden']);

    const ctrr = this;
    this.backgroundMask.addEventListener('click', function(e) {
      if (ctrr.currentWindows.length != 0)
        ctrr.closeWindow(ctrr.currentWindows.pop());
      if (ctrr.currentWindows.length == 0)
        this.classList.add('hidden');
    });

    this.mainNode.appendChild(this.backgroundMask);
  }
  getWindowContainer() {
    return this.mainNode;
  }
  getWindow(name) {
    const w = this.windows[name];
    if (w == void 0)
      throw new Error('Window name: ' + name + ' is not exist');
    return w;
  }
  appendWindow(name, config) {
    config = Object.assign({
      extraClassList: [],
      title: '',
      contentDocumentFragment: null
    }, config);

    const simpleCreateHTML = element.simpleCreateHTML;

    if (this.windows[name] !== void 0)
      throw new Error('window name: ' + name + ' is already exist.');

    const el = simpleCreateHTML('div', ['Cyteria', 'window', 'hidden', ...config.extraClassList]);

    const top = simpleCreateHTML('div', 'top');
    top.appendChild(simpleCreateHTML('span', 'title', config.title));
    const close_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button', 'start'], Icons('close'), { 'data-window-name': name });
    close_btn.addEventListener('click', this.listeners.closeWindow);
    top.appendChild(close_btn);

    el.appendChild(top);
    const content = simpleCreateHTML('div', 'content');
    config.contentDocumentFragment && content.appendChild(config.contentDocumentFragment);
    el.appendChild(content);

    this.windows[name] = el;
    this.mainNode.appendChild(el);
    return el;
  }
  closeWindow(name) {
    const w = this.windows[name];
    if (w == void 0)
      throw new Error('Window name: ' + name + ' is not exist');
    w.classList.add('hidden');
    this.currentWindows.splice(this.currentWindows.indexOf(name), 1);
  }
  openWindow(name) {
    const w = this.windows[name];
    if (w == void 0)
      throw new Error('Window name: ' + name + ' is not exist');
    w.classList.remove('hidden');
    this.backgroundMask.classList.remove('hidden');
    // if ( this.currentWindows.indexOf(name) == -1 )
    //     this.currentWindows.push(name);
  }
}