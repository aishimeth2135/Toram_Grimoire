export default class CyComponent {
    constructor(set){
        this._create = set.create || function(){};
        this._updata = set.update || function(){};
        this._childComponents = {};
        this._links = {};

        Object.assign(this._childComponents, set.components || {});
        Object.assign(this._links, set.links || {});
    }
    $create(data){
        return this._creation.apply(this, [data, this]);
    }
    $update(el, from, data){
        return this._update.apply(this, [el, from, data, this]);
    }
    $component(name){
        if ( !this._childComponents[name] )
            throw new Error('Unknow component name: ' + name);
        return this._childComponents[name];
    }
    $link(name, el){
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