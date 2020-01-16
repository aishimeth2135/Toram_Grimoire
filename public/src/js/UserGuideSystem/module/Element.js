class ElementGroup {
    constructor(parent, id, els){
        this.parent = parent;
        this.id = id;
        this.elements = els;
        this.guideText = null;
    }
    appendElement(el){
        this.elements.push(el);
    }
    setText(pos, text){
        this.guideText = new UserGuideText(pos, text);
        return this.guideText;
    }
}

class UserGuideText {
    constructor(pos, text){
        this.position = pos;
        this.text = text;
    }
}
UserGuideText.POSITION_TOP = Symbol();
UserGuideText.POSITION_BOTTOM = Symbol();
UserGuideText.POSITION_LEFT = Symbol();
UserGuideText.POSITION_RIGHT = Symbol();

class UserGuideFrame {
    constructor(id, type){
        this.id = id;
        this.type = type;
        this.elementGroups = [];
        this.actions = {
            before: null,
            after: null
        };
    }
    appendElementGroup(id, els=[]){
        const g = new ElementGroup(this, id, els);
        this.elementGroups.push(g);
        return g;
    }
    setActionBefore(fun){
        if (typeof fun != 'function') throw new Error('given param 1 must be a function');
        this.actions.before = fun;
    }
    setActionAfter(fun){
        if (typeof fun != 'function') throw new Error('given param 1 must be a function');
        this.actions.before = fun;
    }
}
UserGuideFrame.TYPE_NORMAL = Symbol();

export {UserGuideFrame, UserGuideText, ElementGroup};