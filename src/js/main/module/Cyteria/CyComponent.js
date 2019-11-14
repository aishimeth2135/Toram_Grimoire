const config = {
    'element-attribute-name': 'data-cy-component'
};

export default class CyComponent {
    constructor(set){
        this._name = set.name || "";
        this._create = set.create || function(){};
        this._updata = set.update || function(){};
        this._childComponents = {};
        this._links = {};

        Object.assign(this._childComponents, set.components || {});
        Object.assign(this._links, set.links || {});
    }
    $create(...args){
        const t =  this._create.apply(this, [this, ...args]);
        t.setAttribute(config['data-cy-component'], this.name);
        return t;
    }
    $update(el, ...args){
        if ( el.getAttribute(config['data-cy-component']) !== this.name )
            throw new Error('[argument: element] is not create by this CyComponent');
        return this._update.apply(this, [this, el, ...args]);
    }
    $component(name){
        if ( !this._childComponents[name] )
            throw new Error('Unknow component name: ' + name);
        return this._childComponents[name];
    }
    $link(name, el){
        if ( this.links[name] === void 0 )
            throw new Error("Unknow link name: " + name);
        return this.links[name](this, el);
    }
    appendComponent(name, c){
        if ( this._childComponents[name] )
            throw new Error('This component is already exist. Please try other component name.')
        if ( typeof c != 'object' )
            throw new Error('type of given component is not Object.');
        this._childComponents[name] = c;
        return this;
    }
    appendLink(name, fun){
        if ( this._links[name] )
            throw new Error('This link is already exist. Please try other link name.')
        if ( typeof c != 'function' )
            throw new Error('type of given link is not Function.');
        this._links[name] = c;
        return this;
    }
}