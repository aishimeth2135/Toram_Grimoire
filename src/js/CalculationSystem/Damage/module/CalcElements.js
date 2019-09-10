

class CalcItemBase {
    constructor(id, text, unit){
        this.id = id;
        this.text = text;
        this.unit = unit;
        this.base = null;
        this.min = null;
        this.max = null;
        this.step = 1;
        this.defaultValue = 0;
    }
    setBase(b){
        this.base = base;
        return this;
    }
    initRange(min, max, step=1){
        this.min = min;
        this.max = max;
        this.step = step;
        return this;
    }
    initDefaultValue(v){
        this.defaultValue = v;
        return this;
    }
}


class Calculation {
    constructor(){
        this.containers = [];
        this.name = '';
        this.status = {
            sets: {
                'str': 0, 'dex': 0, 'int': 0, 'agi': 0, 'vit': 0
            }
        };
    }
    createContainer(id, cat, type){
        const t = new CalcItemContainer(this, id, cat, type);
        this.containers.push(t);
        return t;
    }
    calcResult(config){
        config = Object.assign({
            beforeCalculate: []
        }, config);
        let cst = 0;
        let mul = 1;
        this.containers.forEach(ctner => {
            if ( !ctner.beCalc || !ctner.isValid() )
                return;
            const find = config.beforeCalculate.find(a => a.container == ctner);
            const v = !find ? ctner.beforeCalculate() : (typeof find.value == 'function' ? find.value.call(ctner) : find.value);

            switch (ctner.category){
                case CalcItemContainer.CATEGORY_CONSTANT:
                    cst += v;
                    break;
                case CalcItemContainer.CATEGORY_MULTIPLIER:
                    mul *= v;
                    break;
            }
        });
        return Math.max(cst*mul, 1);
    }
    findItem(id){
        const c = this.findContainer(id);
        return c ? c.getItem(id) : void 0;
    }
    container(index){
        if ( index === void 0 )
            return this.containers;
        return this.containers[index];
    }
    findContainer(item_id){
        return this.containers.find(c => c.items.find(a => a.base.id == item_id));
    }
    checkItemValid(id){
        const t = this.getItem(id);
        return t && t.isValid();
    }
    calculationName(n){
        if ( n )
            this.name = n;
        return this.name;
    }
    userSet(name, v){
        if ( name === void 0 )
            return this.status.sets;
        if ( v !== void 0 )
            this.status.sets[name] = v;
        return this.status.sets[name];
    }
    copyFrom(cal){
        // 
        this.calculationName(cal.calculationName() + '*');

        // sets
        Object.keys(this.userSet()).forEach(k => this.userSet(k, cal.userSet(k)));

        // containers
        this.containers.forEach(p => p.item().forEach(q => q.itemValue(cal.findItem(q.itemId()).itemValue())));

        return this;
    }
}


class CalcItemContainer {
    constructor(parent, id, cat, type){
        this.parent = parent;
        this.id = id;
        this.category = cat;
        this.type = type || CalcItemContainer.TYPE_NORMAL;

        this.items = [];
        this.linked = null;

        this.valid = true;
        this.beToggle = true;
        this.beCalc = true;
        this.beInput = true;

        this.title = '';

        this.status = {
            currentItem: null
        };
    }
    appendItem(){
        const t = new CalcItem(this, ...arguments);
        this.items.push(t);
        return t;
    }
    currentItem(t, notifyLinked=true){
        if ( t ){
            this.status.currentItem = t;
            if ( notifyLinked && this.beLinked() ){
                const i = this.items.indexOf(t);
                this.linkedContainers().forEach(p => p.currentItem(p.item(i), false));
            }
        }
        return this.status.currentItem;
    }
    base(){
        return this.currentItem().base;
    }
    value(id){
        if ( id !== void 0 )
            return this.getItem(id).itemValue();
        if ( this.type == CalcItemContainer.TYPE_NORMAL )
            return this.item(0).itemValue();
        return this.currentItem().itemValue();
    }
    calculatedValue(){
        const v = this.value();
        switch (this.category){
            case CalcItemContainer.CATEGORY_CONSTANT:
                return v;
            case CalcItemContainer.CATEGORY_MULTIPLIER:
                return (100 + v)/100;
        }
    }
    beforeCalculate(){
        return this.calculatedValue();
    }
    setBeforeCalculateFunction(fun){
        if ( typeof fun == 'function' )
            this.beforeCalculate = fun;
        return this;
    }
    /**
     * parent中的其它container，若擁有同樣的Link ID，彼此之間會具有連動性。Link預設值為null。
     * @param {String} t Link ID
     */
    link(v){
        const find = this.belongCalculation().container().find(c => c.beLinked() && c.getLink().linkId() == v);
        this.linked = find ? find.getLink() : new CalcItemContainerLink(v);
        return this;
    }
    getLink(){
        return this.linked;
    }
    linkedContainers(){
        return this.belongCalculation().container().filter(a => a != this && a.getLink() == this.getLink());
    }
    beLinked(){
        return this.getLink() !== null;
    }
    checkCurrentItem(id){
        return this.base().id == id;
    }
    belongCalculation(){
        return this.parent;
    }
    getItem(id){
        return this.items.find(a => a.base.id == id);
    }
    item(index){
        if ( index === void 0 )
            return this.items;
        return this.items[index];
    }
    toggle(notifyLinked=true){
        if ( this.beToggle ){
            this.valid = this.valid ? false : true;
            if ( notifyLinked && this.beLinked() && this.getLink().toggleContainer )
                this.linkedContainers().forEach(p => p.toggle(false));
        }
    }
    isValid(){
        return this.valid;
    }
    closeToggle(){
        this.beToggle = false;
        return this;
    }
    closeCalc(){
        this.beCalc = false;
        return this;
    }
    closeInputValue(){
        this.beInput = false;
        return this;
    }
    openItemToggle(item_id){
        this.getItem(item_id).beToggle = true;
        return this;
    }
    openLinkedToggle(){
        this.linkedToggle = true;
        return this;
    }
    containerTitle(t){
        if ( t || t === '' )
            this.title = t;
        return this.title;
    }
    containerId(){
        return this.id;
    }
}
CalcItemContainer.CATEGORY_CONSTANT = Symbol('Constant');
CalcItemContainer.CATEGORY_MULTIPLIER = Symbol('Multiplier');
CalcItemContainer.CATEGOEY_NONE = Symbol('None');
CalcItemContainer.TYPE_NORMAL = Symbol('Normal');
CalcItemContainer.TYPE_SELECT = Symbol('Select');


class CalcItemContainerLink {
    constructor(id){
        this.id = id;

        this.toggleContainer = false;
    }
    openToggleContainer(){
        this.toggleContainer = true;
        return this;
    }
    linkId(){
        return this.id;
    }
}


class CalcItem {
    constructor(parent, base){
        this.parent = parent;
        this.base = base;
        this.value = base.defaultValue;
        this.valid = true;

        this.beToggle = false;
    }
    belongContainer(){
        return this.parent;
    }
    itemValue(v){
        if ( v || v === 0 ){
            const max = this.base.max, min = this.base.min;
            if ( max !== null && v > max )
                v = max;
            if ( min !== null && v < min )
                v = min;
            this.value = v;
        }
        return this.value;
    }
    toggle(){
        if ( this.beToggle )
            this.valid = this.valid ? false : true;
    }
    isValid(){
        const c = this.belongContainer();
        if ( c.type == CalcItemContainer.TYPE_SELECT && c.currentItem() != this )
            return false;
        return this.valid;
    }
    itemId(){
        return this.base.id;
    }
    itemText(){
        return this.base.text;
    }
    itemUnit(){
        return this.base.unit
    }
}


export {CalcItemBase, Calculation, CalcItemContainer, CalcItem};