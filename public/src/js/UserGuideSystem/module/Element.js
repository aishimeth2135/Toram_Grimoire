class ElementGroup {
    constructor(els){
        this.elements = els;
        this.guideText = null;
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
    constructor(type){
        this.type = type;
        this.elementGroups = [];
    }
    appendElementGroup(els){
        const g = new ElementGroup(els);
        this.elementGroups.push(g);
        return g;
    }
}
UserGuideFrame.TYPE_NORMAL = Symbol();

export {UserGuideFrame, UserGuideText, ElementGroup};