import CY from "../../main/module/cyteria.js";

function DrawSkillTree(st, config){
    config = Object.assign({
        setSkillButton: (el, skill) => {}
    }, config);

    const setSkillButton = config.setSkillButton;

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
                            setSkillButton(btn, _skill, Object.assign({
                                cx: x,
                                cy: y,
                                lengthTransformFunction: tran,
                                documentFragment: t
                            }, drawData));
                            const patid = `s_${st.parent.no}-${st.no}-${_skill.no}`;
                            const pat = CY.svg.createEmpty('pattern', {id: patid, width: 1, height: 1});
                            pat.appendChild(Circle(w/2, w/2, w/2, {fill: 'url(#skill-icon-bg)', 'stroke-width': 0}));
                            pat.appendChild(CY.svg.drawImage(`${skillIconPathRoot}si_${_skill.no}.png`, iconPad, iconPad, w-iconPad*2, w-iconPad*2));
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
    he.classList.add('Cyteria', 'entrance', 'fade-in');
    he.appendChild(frg);

    he.classList.add('DrawSkillTree--main');

    return he;
}

function GetDrawData(){
    return {
        gridWidth: 50,
        svgPadding: 40,
        textMargin: 5,
        iconPadding: 4
    };
}

function createDrawSkillTreeDefs(){
    const defs = CY.svg.createEmpty('defs');

    const w = GetDrawData().gridWidth,
        Circle = CY.svg.drawCircle;

    // @lock
    const lock_pettern = CY.svg.createEmpty('pattern', {width: 1, height: 1, id: 'skill-icon-lock'});
    const lock = CY.svg.create(w, w, {x: (w-24)/2, y: (w-24)/2});
    lock.innerHTML = '<path fill="var(--primary-light)" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>';
    lock_pettern.appendChild(Circle(w/2, w/2, w/2, {fill: 'var(--white)', 'stroke-width': 0}));
    lock_pettern.appendChild(lock);

    defs.appendChild(lock_pettern);

    // background
    const skillIconBg = CY.svg.createLinearGradient('skill-icon-bg',
        '.5', '0', '.5', '1', [
            {offset: '0%', 'stop-color': 'white'},
            {offset: '50%', 'stop-color': '#FFD1EA'},
            {offset: '100%', 'stop-color': '#f7a8d3'}
        ]
    );

    defs.appendChild(skillIconBg);

    return defs;
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

export {DrawSkillTree, createDrawSkillTreeDefs};