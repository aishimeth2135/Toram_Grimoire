
class Tag {
    constructor(n){
        this.name = n;
        this.frames = [];
    }
    appendFrame(n, v){
        const t = new Frame(n, v);
        this.frames.push(t);
        return t;
    }
}

class Frame {
    constructor(t, v){
        this.type = t;
        this.value = v;
    }
    appendValue(v){
        if ( !Array.isArray(this.value) )
            this.value = [this.value];
        this.value.push(v);
    }
}

export default Tag;