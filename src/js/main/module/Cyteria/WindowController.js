import element from "./element.js";

export default class WindowController {
    constructor(){
        this.windows = {};
        this.currentWindows = [];

        this.listeners = {
            closeWindow(e){
                this.parentNode.parentNode.classList
            }
        };

        this.init();
    }
    init(){
        this.mainNode = simpleCreateHTML('div', ['Cyteria', 'window-container']);
        this.backgroundMask = element.simpleCreateHTML('div', ['Cyteria', 'window-bg-mask']);

        const ctrr = this;
        this.backgroundMask.addEventListener('click', function(e){
            if ( ctrr.currentWindows.length != 0 )
                ctrr.closeWindow(ctrr.currentWindows.pop());
            if ( ctrr.currentWindows.length == 0 )
                this.classList.add('hidden');
        });

        this.mainNode.appendChild(backgroundMask);
    }
    getWindowContainer(){
        return this.mainNode;
    }
    getWindow(name){
        const w = this.windows[name];
        if ( w == void 0 )
            throw new Error('Window name: ' + name + ' is not exist');
        return w;
    }
    appendWindow(name, extra_class){
        const el = element.simpleCreateHTML('div', ['Cyteria', 'window', 'hidden', ...extra_class]);
        if ( this.windows[name] !== void 0 )
            throw new Error('window name: ' + name + ' is already exist.');

        el.appendChild(simpleCreateHTML('div', 'top', '<span class="name"></span>'));
        const btn = element.simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button'], Icons('close'));
        btn.addEventListener('click', this.listeners.closeWindow);
        return btn;

        this.windows[name] = el;
        this.mainNode.appendChild(el);
        return el;
    }
    closeWindow(name){
        const w = this.windows[name];
        if ( w == void 0 )
            throw new Error('Window name: ' + name + ' is not exist');
        w.classList.add('hidden');
        this.currentWindows.splice(this.currentWindows.indexOf(name), 1);
    }
    openWindow(name){
        const w = this.windows[name];
        if ( w == void 0 )
            throw new Error('Window name: ' + name + ' is not exist');
        w.classList.remove('hidden');
        this.backgroundMask.classList.remove('hidden');
        // if ( this.currentWindows.indexOf(name) == -1 )
        //     this.currentWindows.push(name);
    }
}