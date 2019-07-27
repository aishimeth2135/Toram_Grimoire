import CY from "../../main/module/cyteria.js";
import strings from "./strings.js";

function DrawSkillTree(st, ctrr){
    function listener(event){
        const s = ctrr.selectSkillElement(this.getAttribute(strings().data_skillElementNo));
        if ( ctrr.status.currentSkill === s )
            return;
        const cur = this.parentNode.querySelector('.cur');
        if ( cur )
            cur.classList.remove('cur');
        this.classList.add('cur');

        ctrr.clearSkillRecord();

        ctrr.initCurrentSkill(s);
        ctrr.updateSkillHTML();
    }
    function setSkillButton(node, skill){
        node.addEventListener('click', listener);
        node.setAttribute(strings().data_skillElementNo, ctrr.getSkillElementNoStr(skill));
    }

    const skillIconPathRoot = '../src/picture/skill_icons/stc_' + st.parent.no + '/st_' + st.no + '/';

    const s = st.drawTreeCode || 'S E S E S E S L S E S E S E S L S E S E S E S L S E S E S E S';
    
    const drawData = GetDrawData();
    const w = drawData.gridWidth,
        pad = drawData.svgPadding,
        textMargin = drawData.textMargin,
        iconPad = drawData.iconPadding;

    function tran(v){
        return pad + w/2 + v*w + textMargin;
    }

    const Line = CY.svg.drawLine,
        Circle = CY.svg.drawCircle,
        Text = CY.svg.drawText;

    const frg = document.createDocumentFragment();

    const defs = CY.svg.createEmpty('defs');
    frg.appendChild(defs);

    let x = 0, y = 0, maxw = 0, cnt = 0;

    s.toUpperCase()
    .replace(/([A-Z])(\d+)/g, (m, w, d) => Array(parseInt(d, 10)).fill(w).join(' '))
    .split(' ')
    .forEach(p => {
        if ( cnt == st.skills.length )
            return;
        const c = p.charAt(0);
        switch (c){
            case 'L':
                if ( x > maxw )
                    maxw = x;
                x = 0;
                ++y;
                break;
            case 'E':
                ++x;
                break;
            case 'D': case 'S': {
                p.slice(1).split('').forEach(t => {
                    let line;
                    if ( t === 'R' )
                        line = Line(tran(x), tran(y), tran(x+1), tran(y));
                    if ( t === 'B' )
                        line = Line(tran(x), tran(y), tran(x), tran(y+1));
                    frg.appendChild(line);
                });
                let t;
                if ( c === 'D' )
                    t = Circle(tran(x), tran(y), 2, {class: 'dot'});
                if ( c === 'S' ){
                    t = document.createDocumentFragment();
                    const _skill = st.skills.find(a => a.drawOrder === cnt);
                    const name = _skill.name || '?';
                    const btn = Circle(tran(x), tran(y), w/2, {class: 'skill-circle'});
                    t.appendChild(btn);
                    if ( name !== '?' ){
                        if ( name !== '@lock' ){
                            t.appendChild(Text(tran(x), tran(y) - w/2 - textMargin, name, {class: 'skill-name'}));
                            setSkillButton(btn, _skill);
                            const patid = 'si_' + _skill.no;
                            const pat = CY.svg.createEmpty('pattern', {id: patid, width: w, height: w});
                            pat.appendChild(Circle(w/2, w/2, w/2, {fill: 'url(#skill-icon-bg)', 'stroke-width': 0}));
                            //pat.appendChild(Circle(w/2, w/2, w/2, {fill: 'url(#skill-icon-bg-l2)', 'stroke-width': 0}));
                            pat.appendChild(CY.svg.drawImage(skillIconPathRoot + patid + '.png', iconPad, iconPad, w-iconPad*2, w-iconPad*2));
                            defs.appendChild(pat);
                            btn.style.fill = 'url(#' + patid + ')';
                        }
                        else {
                            btn.classList.add('lock');
                        }
                    }
                    ++cnt;
                }
                frg.appendChild(t);
                ++x;
            } break;
            case 'H':
                frg.appendChild(Line(tran(x), tran(y), tran(x+1), tran(y)));
                ++x;
                break;
            case 'V':
                frg.appendChild(Line(tran(x), tran(y), tran(x), tran(y+1)));
                ++x;
                break;
        }
    });

    const he = CY.svg.create(tran(maxw) - w/2 + pad, tran(y) + w/2 + pad + textMargin, {'xmlns:xlink': 'http://www.w3.org/1999/xlink'});
    he.appendChild(frg);

    return he;
}

function GetDrawData(){
    return {
        gridWidth: 56,
        svgPadding: 40,
        textMargin: 5,
        iconPadding: 4
    };
}

// function simpleDrawSkillTree(s){
//     const w = 50, pad = 20;

//     function tran(v){
//         return pad + w/2 + v*w;
//     }

//     const Line = CY.svg.drawLine, Circle = CY.svg.drawCircle;

//     const frg = document.createDocumentFragment();

//     let x = 0, y = 0, maxw = 0, cnt = 0;

//     s.toUpperCase()
//     .replace(/([A-Z])(\d+)/g, (m, w, d) => Array(parseInt(d, 10)).fill(w).join(' '))
//     .split(' ')
//     .forEach(p => {
//         const c = p.charAt(0);
//         switch (c){
//             case 'L':
//                 if ( x > maxw )
//                     maxw = x;
//                 x = 0;
//                 ++y;
//                 break;
//             case 'E':
//                 ++x;
//                 break;
//             case 'D': case 'S': {
//                 p.slice(1).split('').forEach(t => {
//                     let line;
//                     if ( t === 'R' )
//                         line = Line(tran(x), tran(y), tran(x+1), tran(y));
//                     if ( t === 'B' )
//                         line = Line(tran(x), tran(y), tran(x), tran(y+1));
//                     frg.appendChild(line);
//                 });
//                 let t;
//                 if ( c === 'D' )
//                     t = Circle(tran(x), tran(y), 2, {class: 'dot'});
//                 if ( c === 'S' )
//                     t = Circle(tran(x), tran(y), w/2, {class: 'skill-circle'});
//                 frg.appendChild(t);
//                 ++x;
//             } break;
//             case 'H':
//                 frg.appendChild(Line(tran(x), tran(y), tran(x+1), tran(y)));
//                 ++x;
//                 break;
//             case 'V':
//                 frg.appendChild(Line(tran(x), tran(y), tran(x), tran(y+1)));
//                 ++x;
//                 break;
//         }
//     });

//     const he = CY.svg.create(tran(maxw) - w/2 + pad, tran(y) + w/2 + pad);
//     he.appendChild(frg);

//     return he;
// }

export {DrawSkillTree, GetDrawData};