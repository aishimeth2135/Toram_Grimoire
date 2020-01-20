/**
 * get index id of SkillElement
 * @param  {SkillElement} sk_el
 * @return {String}
 */
function getSkillElementId(sk_el){
    const indexs = [];
    while (sk_el.parent){
        indexs.push(sk_el.findLocation());
        sk_el = sk_el.parent;
    }
    return indexs.reverse().join('-');
}
/**
 * select SkillElement by index id
 * @param  {SkillRoot} sr
 * @param  {String} id
 * @return {SkillElement}
 */
function selectSkillElement(sr, id){
    return id.split("-").map(a => parseInt(a, 10))
    .reduce((cur, id, i, ary) => {
        switch (i){
            case 0:
                return sr.skillTreeCategorys[id];
            case 1:
                return cur.skillTrees[id];
            case 2:
                return cur.skills[id];
            case 3:
                return cur.branchs[id];
        }
    }, null);
}

export {getSkillElementId, selectSkillElement};