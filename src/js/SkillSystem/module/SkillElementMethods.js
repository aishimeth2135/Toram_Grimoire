function getSkillElementId(sk_el){
    const nos = [];
    while (sk_el.parent){
        nos.push(sk_el.findLocation());
        sk_el = sk_el.parent;
    }
    return nos.reverse().join('-');
}
function selectSkillElement(sr, id){
    return id.split("-").reduce((cur, no, i, ary) => {
        no = parseInt(no, 10);
        switch (i){
            case 0:
                return sr.skillTreeCategorys[no];
            case 1:
                return cur.skillTrees[no];
            case 2:
                return cur.skills[no];
            case 3:
                return cur.branchs[no];
        }
    }, null);
}

export {getSkillElementId, selectSkillElement};