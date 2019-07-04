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

    const s = st.drawTreeCode || 'S E S E S E S L S E S E S E S L S E S E S E S L S E S E S E S';
    const w = 50, pad = 40, textMargin = 5;

    function tran(v){
        return pad + w/2 + v*w + textMargin;
    }

    const Line = CY.svg.drawLine,
        Circle = CY.svg.drawCircle,
        Text = CY.svg.drawText;

    const frg = document.createDocumentFragment();

    const defs = CY.svg.createEmpty('defs');

    const lock_pettern = CY.svg.createEmpty('pattern', {width: 1, height: 1, id: 'lock'});
    const lock = CY.svg.create(w, w, {x: 13, y: 12});
    lock.innerHTML = '<path fill="var(--primary-light)" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>';
    lock_pettern.appendChild(Circle(w/2, w/2, w/2, {fill: '#FFF', 'stroke-width': 0}));
    lock_pettern.appendChild(lock);

    defs.appendChild(lock_pettern);

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
                    if ( name !== '?' ){
                        if ( name !== '@lock' ){
                            t.appendChild(Text(tran(x), tran(y) - w/2 - textMargin, name, {class: 'skill-name'}));
                            setSkillButton(btn, _skill);
                        }
                        else {
                            btn.classList.add('lock');
                        }
                    }
                    t.appendChild(btn);
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

export {DrawSkillTree};