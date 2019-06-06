import GetLang from "../../../main/module/LanguageSystem.js";
import {createSkillAttributeScope, getStackBranchIdKey, simpleCreateHTML, Lang} from "./main.js";
import CY from "../../../main/module/cyteria.js";
import strings from "../strings.js";

const
    SUFFIX_LIST = ['extra', 'poration'],
    EXTRA_FIX_LIST = ['stack'];

function getTargetText(s, _is_place){
    const dict = {
        self: Lang('target type: self'),
        party: !_is_place ? Lang('target type: party') : Lang('target type: party & is place'),
        aura: Lang('target type: aura'),
        target: Lang('target type: target'), none: null
    };
    const res = dict[s];
    return res !== null ? res : res;
}

function lightText(text){
    return '<span class="light">' + text + '</span>';
}

function darkText(text){
    return '<span class="dark">' + text + '</span>';
}

function markText(text){
    return lightText(text);
}

function getPorationHTML(poration_branch){
    const _attr = poration_branch.branchAttributes;
    const dict1 = {
        physical: Lang('physical'), magic: Lang('magic'),
        normal_attack: Lang('normal attack'), none: Lang('damage poration type: none')
    };
    const dict2 = Object.assign({}, dict1, {
        auto: dict1[_attr['damage']],
        none: Lang('effective poration type: none')
    });
    let one = createSkillAttributeScope(null, Lang('damage poration: title'), dict1[_attr['damage']]);
    let two = createSkillAttributeScope(null, Lang('effective poration: title'), dict2[_attr['poration']]);

    return {one, two};
}

function getDamageElementHTML(ele_type){
    const ELEMEMT_DICT = {
        neutral: Lang('element: neutral'),
        fire: Lang('element: fire'),
        water: Lang('element: water'),
        earth: Lang('element: earth'),
        wind: Lang('element: wind'),
        light: Lang('element: light'),
        dark: Lang('element: dark'),
        arrow: Lang('element: arrow'),
        one_hand_sword: Lang('element: one hand sword')
    };
    const t = simpleCreateHTML('div', 'skill_attribute');
    let icon_type = ele_type;
    if ( ele_type == 'arrow' || ele_type == 'one_hand_sword' )
        icon_type = 'multiple';
    t.appendChild(simpleCreateHTML('span', ['_icon', 'element_' + icon_type, 'element_ball']));
    t.appendChild(simpleCreateHTML('span', ['_value', 'element_value'], ELEMEMT_DICT[ele_type]));
    return t;
}

function createContentLine(frg1, frg2, options){
    options =  Object.assign({
        headIcon: true,
        extrafrgs: null
    }, options);
    const t = simpleCreateHTML('div', ['content', 'content_line']);
    const s1 = simpleCreateHTML('div', 'scope1');
    const s2 = simpleCreateHTML('div', 'scope2');
    s1.appendChild(frg1);
    s2.appendChild(frg2);
    if ( options.headIcon )
        t.appendChild(simpleCreateHTML('div', '_icon', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"/></svg>'));
    t.appendChild(s1);
    t.appendChild(s2);
    if ( options.extrafrgs !== void 0 && options.extrafrgs !== null ){
        if ( !Array.isArray(options.extrafrgs) )
            t.appendChild(options.extrafrgs);
        else
            options.extrafrgs.forEach(a => t.appendChild(a));
    }
    return t;
}


function getBranchHTML(branch, data){
    if ( branch.finish )
        return null;
    const ICONS = {
        bodomu: '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1250pt" height="1250pt" viewBox="0 0 1250 1250" preserveAspectRatio="xMidYMid meet"><g transform="translate(0,1250) scale(0.1,-0.1)" fill="#000000" stroke="none"><path d="M1468 11473 c-29 -34 -57 -98 -75 -173 -15 -62 -18 -111 -16 -277 l2 -201 -102 34 c-112 38 -148 42 -168 18 -15 -18 -20 -114 -8 -164 4 -19 15 -100 24 -180 56 -495 128 -757 306 -1113 76 -153 214 -396 234 -412 7 -6 78 -141 158 -300 364 -728 566 -1026 995 -1466 l163 -168 -50 -203 c-137 -556 -160 -746 -168 -1370 l-5 -428 -55 -82 c-70 -108 -155 -259 -203 -361 -96 -210 -132 -392 -146 -743 l-7 -159 27 -32 c67 -80 199 -105 317 -59 37 14 69 22 73 19 3 -3 8 2 12 11 3 9 15 16 25 16 10 0 62 11 115 25 102 27 198 71 252 118 l34 28 62 -133 c35 -73 79 -160 99 -193 l35 -60 -221 -6 c-231 -6 -245 -8 -492 -40 -169 -23 -172 -23 -310 -44 -354 -53 -385 -59 -435 -85 -45 -23 -42 -7 -42 -205 0 -139 -13 -216 -66 -397 -33 -112 -30 -132 28 -159 33 -16 55 -15 368 12 389 32 865 65 1177 79 264 13 1155 6 1345 -9 74 -6 218 -18 320 -26 221 -19 532 -53 920 -101 157 -19 292 -36 300 -36 8 0 107 9 220 21 113 11 230 23 260 26 30 3 150 14 265 24 950 88 1527 101 2285 51 204 -14 768 -65 993 -91 150 -17 181 -18 205 -7 30 15 28 -14 15 253 -5 103 -2 140 21 264 24 132 25 146 11 167 -8 13 -24 24 -34 24 -10 0 -72 13 -137 29 -467 115 -798 166 -1299 201 -88 7 -183 15 -211 18 l-52 7 80 95 c111 131 206 278 295 455 42 82 77 152 79 154 2 2 31 -19 66 -46 152 -120 255 -176 398 -218 52 -15 163 -61 245 -100 173 -84 230 -105 286 -105 73 0 119 41 148 130 10 32 6 47 -43 175 -168 435 -316 713 -586 1103 -127 183 -128 184 -134 332 -2 63 -7 122 -9 130 -3 8 -11 94 -17 190 -10 158 -18 263 -36 445 -3 33 -12 112 -20 175 -9 63 -18 144 -21 180 -3 36 -9 70 -13 75 -4 6 -13 39 -20 75 -16 81 -73 261 -114 360 -30 72 -31 76 -16 107 8 18 50 68 93 111 42 43 77 86 77 94 0 9 25 41 55 72 30 30 55 59 55 63 1 15 196 243 397 465 155 171 503 524 658 669 154 143 526 469 739 649 293 248 381 320 387 320 10 0 119 180 119 197 0 8 5 23 10 34 23 42 -16 69 -124 89 -33 5 -61 12 -63 13 -2 2 17 22 43 43 72 61 142 134 147 154 7 27 -18 56 -51 63 -52 10 -661 67 -822 76 -219 13 -695 5 -870 -14 -571 -62 -1039 -208 -1763 -551 -295 -140 -1053 -539 -1090 -573 -16 -16 -24 -16 -80 -5 -399 82 -658 113 -957 114 -287 2 -542 -22 -1110 -104 l-235 -34 -110 70 c-194 125 -241 156 -658 427 -423 275 -994 659 -1350 908 -230 161 -773 557 -1107 808 -118 89 -225 167 -237 173 -31 17 -68 15 -85 -5z"/></g></svg>',
    }
    function replaceExtraFormulaValue(str){
        const FORMULA_EXTRA_VALUE_LIST = {
            'STR': Lang('skill formula: STR'),
            'DEX': Lang('skill formula: DEX'),
            'INT': Lang('skill formula: INT'),
            'AGI': Lang('skill formula: AGI'),
            'VIT': Lang('skill formula: VIT'),
            'BSTR': Lang('skill formula: BSTR'),
            'BDEX': Lang('skill formula: BDEX'),
            'BINT': Lang('skill formula: BINT'),
            'BAGI': Lang('skill formula: BAGI'),
            'BVIT': Lang('skill formula: BVIT'),
            'shield_refining': Lang('skill formula: shield_refining'),
            'dagger_atk': Lang('skill formula: dagger_atk'),
            'target_def': Lang('skill formula: target_def'),
            'target_level': Lang('skill formula: target_level'),
            'guard_power': Lang('skill formula: guard_power')
        };
        Object.keys(FORMULA_EXTRA_VALUE_LIST).forEach(key => {
            str = str.replace(new RegExp(key, 'g'), FORMULA_EXTRA_VALUE_LIST[key]);
        });
        str = str
            .replace(/\*/g, '×').replace(/SLv/g, SLv).replace(/CLv/g, CLv)
            .replace(/\d+(?:\.\d+)?[\*/]{1}\d+(?:\.\d+)?/g, s => safeEval(s))
            .replace(/(\d+\.\d+)/g, () => parseFloat(RegExp.$1)*100 + '%');
        return str;
    }
    function safeEval(str, dftv){
        try {
            return eval(str);
        }
        catch(e){
            console.warn(e);
            return dftv === void 0 ? '?' : dftv;
        }
    }
    function processText(b, _main='text', text='-1'){
        const _attr = b.branchAttributes;
        let str = _main === null || _attr[_main] === void 0 ? text : _attr[_main];
        if ( !data.showOriginalFormula ){
            str = str.replace(/\$\{([^\}]+)\}([%m]?)/g, (...args) =>
                processValue(args[1], {
                    calc: false, light: true, beforeProcessText: true,
                    pretext: '${', suffixText: '}', tail: args[2]
                })
            );
            str = safeEval("`" + str + "`");
        }
        else {
            // 由於showOriginalFormula。 ${}內的值丟進去會直接回傳結果。
            str = str.replace(/\$\{([^\}]+)\}([%m]?)/g, (...args) =>
                processValue(args[1], {light: true, tail: args[2], separateText: true})
            );
        }
        str = str.replace(/(\w?)\s#([^\s]+)\s(\w?)/g, (...args) => {
            let res = lightText(args[2]);
            if ( args[1] !== '' )
                res = " " + res;
            if ( args[3] !== '' )
                res += " ";
            return res;
        });
        if ( _attr['mark'] !== void 0 ){
            _attr['mark'].split(/\s*,\s*/).forEach(t => {
                str = str.replace(new RegExp(t, 'g'), lightText(t));
            });
        }
        if ( _attr['branch'] !== void 0 ){
            _attr['branch'].split(/\s*,\s*/).forEach(t => {
                str = str.replace(new RegExp(t, 'g'), lightText(t));
            });
        }
        if ( _attr['skill'] !== void 0 ){
            const ctrr = data.skillRoot.controller,
                sr = data.skillRoot;
            _attr['skill'].split(/\s*,\s*/).forEach(t => {
                str = str.replace(new RegExp(t, 'g'), a => {
                    const skill = sr.findSkillByName(a);
                    if ( skill === void 0 )
                        return a;
                    const span = simpleCreateHTML('span', 'skill_from_where_button');
                    span.appendChild(simpleCreateHTML('span', 'skill_name', a));
                    span.setAttribute(strings().data_skillElementNo, ctrr.getSkillElementNoStr(skill));
                    return span.outerHTML;
                });
            });
        }
        if ( _attr['skill_tree'] !== void 0 ){
            _attr['skill_tree'].split(/\s*,\s*/).forEach(t => {
                str = str.replace(new RegExp(t, 'g'), lightText(t));
            });
        }
        return str;
    }
    function processValue(v, setting={}){
        v = v.split(',,');
        setting = Object.assign({
            calc: true, tail: '', head: '', suffixText: '', pretext: '', toPercentage: false,
            checkHasStack: v[0], light: false,
            separateText: v.length > 1 || data.showOriginalFormula,
            beforeProcessText: false
        }, setting);
        
        let res;
        v.forEach((a, i) => {
            if ( i === 0 ){
                if ( !data.showOriginalFormula ){
                    if ( setting.calc ){
                        let t = safeEval(a);
                        if ( setting.toPercentage )
                            t *= 100;
                        if ( t !== void 0 && !Number.isInteger(t) )
                            t = t.toFixed(2);
                        res = t;
                    }
                    else
                        res = a;
                    if ( setting.toPercentage )
                        res += '%';
                }
                else {
                    a = a.replace(/CLv/g, Lang('character level'));
                    a = a.replace(/SLv/g, Lang('skill level'));
                    a = a.replace(/\*/g, '×');
                    a = a.replace(/stack\[(\d+)\]/g, () => stack_name_list[parseInt(RegExp.$1, 10)]);
                    a = a.replace(/stack[\[]{0}/g, () => stack_name_list[0]);
                    res = a;
                }
            }
            else {
                a = replaceExtraFormulaValue(a);
                a = a.charAt(0) !== '-' ? '+' + a : a;
                if ( setting.beforeProcessText )
                    a = "+'" + a.replace(/'/g, "\\'") + "'";
                res += a;
            }
        });

        // pretext與suffixText，會在套用外框之前。
        res = setting.pretext + res;
        res += setting.suffixText;

        //|| ( data.showOriginalFormula && !( v.length === 1 && v[0].match(/^[\d\.]+$/) ) )
        if ( setting.separateText && !res.match(/^[\d\.]+$/) )
            res = '<span class="separate_text">' + res + '</span>';

        // head與tail，會在套用外框之後。
        res = setting.head + res;
        res += setting.tail;
        
        const span = document.createElement('span');
        if ( setting.checkHasStack.includes('stack') )
            span.classList.add('effect_by_stack');
        else if ( setting.light )
            span.classList.add('light');;
        span.innerHTML = res;
        return span.outerHTML;
    }
    function processStat(stat){
        const showData = stat.getShowData();
        const vs = showData.value.split(',,');
        const sign = ( vs.length === 1 && safeEval(vs[0]) < 0 ) ? '' : '+';
        const v = processValue(showData.value, {tail: showData.tail, head: showData.title + sign});
        let res = v;
        if ( sign === '' )
            res = darkText(res);
        const t = createSkillAttributeScope(null, null, res);
        return t;
    }
    function getEffectiveAreaHTML(b){
        // radius, angle, end_position, effective_area, move_distance
        const _attr = b.branchAttributes;
        const is_self = _attr['end_position'] === 'self';

        const caption = simpleCreateHTML('div', 'scope1');
        {
            const a = simpleCreateHTML('div', 'skill_attribute');
            a.appendChild(simpleCreateHTML('span', ['_icon', 'element_ball', 'ball_character']));
            a.appendChild(simpleCreateHTML('span', '_value', Lang('effective area: character position')));
            caption.appendChild(a);
            if ( !is_self ){
                const b = simpleCreateHTML('div', 'skill_attribute');
                b.appendChild(simpleCreateHTML('span', ['_icon', 'element_ball', 'ball_target']));
                b.appendChild(simpleCreateHTML('span', '_value', Lang('effective area: target position')));
                caption.appendChild(b);
            }
        }
        let radius, angle, areaType;
        ['radius', 'angle', 'effective_area', 'move_distance'].forEach(a => {
            if ( _attr[a] ){
                let t, v = _attr[a];
                switch (a){
                    case 'radius':
                        t = Lang('radius');
                        radius = safeEval(v);
                        v = processValue(v, {tail: 'm'});
                        break;
                    case 'angle':
                        t = Lang('sector: angle');
                        angle = safeEval(v);
                        v = processValue(v, {tail: '°'});
                        break;
                    case 'effective_area':
                        areaType = _attr[a];
                        t = Lang('effective area: title');
                        v = {
                            circle: Lang('effective area type: circle'),
                            line: Lang('effective area type: line'),
                            sector: Lang('effective area type: sector')
                        }[v];
                        break;
                    case 'move_distance':
                        t = Lang('move distanve: title');
                        v = processValue(v, {tail: 'm'});
                        break;
                }
                caption.appendChild(createSkillAttributeScope(null, t, v));
            }
        });
        const frg = document.createDocumentFragment();

        const unit = v => v !== void 0 ? 10*v : 10;
        const base_distance = 8, base_distance_long = 12;
        let h, w, ox, oy, endx, endy;
        const pcolor = '#ff5fb7', pcolorl = '#FFD1EA', pcolorl2 = '#feeaf5';
        
        const dis = _attr['move_distance'] === void 0 ? base_distance : base_distance_long;
        switch ( areaType ){
            case 'line': case 'circle': {
                w = !is_self ? unit(radius*2 + dis + 2) : unit(radius*2 + 2);
                h = unit(radius*2 + 2);
                ox = unit(radius + 1),
                oy = h/2,
                endx = !is_self ? ox + unit(base_distance) : ox,
                endy = oy;
                
                switch ( areaType ){
                    case 'circle': {
                        const area = CY.svg.drawCircle(endx, endy, unit(radius), {fill: pcolorl2});
                        frg.appendChild(area);
                        const ocircle = CY.svg.drawCircle(endx, endy, unit(radius), {stroke: pcolorl, fill: 'none'});
                        ocircle.appendChild(CY.svg.createAnimate('stroke', {values: `${pcolorl};${pcolor};${pcolor}`, keyTimes: '0;0.2;1', dur: '2.5s'}));
                        frg.appendChild(ocircle);
                    } break;
                    case 'line': {
                        const _end = ox + unit(dis);
                        const area = CY.svg.drawPath(`M${ox} ${oy-unit(radius)} A${unit(radius)} ${unit(radius)} 0 0 0 ${ox} ${oy+unit(radius)} L${_end} ${oy+unit(radius)} A${unit(radius)} ${unit(radius)} 0 0 0 ${_end} ${endy-unit(radius)} Z`, {fill: pcolorl2});
                        frg.appendChild(area);
                        const ocircle = CY.svg.drawCircle(ox, oy, unit(radius), {stroke: pcolorl, fill: 'none'});
                        ocircle.appendChild(CY.svg.createAnimate('stroke', {id: 'a1', values: `${pcolorl};${pcolor};${pcolor}`, keyTimes: '0;0.2;1', dur: '1s',repeatCount: '1', begin: '0s;a2.end', fill: 'freeze'}));
                        ocircle.appendChild(CY.svg.createAnimate('cx', {id: 'a2', values: `${ox};${_end};${_end}`, keyTimes: '0;0.2;1', dur: '1.5s', repeatCount: '1', begin: 'a1.end'}));
                        frg.appendChild(ocircle);
                    } break;
                }
            } break;
            case 'sector': {
                w = unit(dis + 6);
                h = unit(dis)*Math.sin(angle*Math.PI/180) + unit(2);
                ox = unit(4);
                oy = h/2;
                endx = ox + unit(base_distance);
                endy = oy;

                const start_dis = 0, sector_width = 2;
                radius = 2;

                const area = CY.svg.drawSector(ox, oy, unit(start_dis), unit(dis), angle/2, 360-angle/2, 1, {fill: pcolorl2});
                frg.appendChild(area);
                const osector = CY.svg.drawSector(ox, oy, unit(start_dis), unit(start_dis+1), angle/2, 360-angle/2, 1, {stroke: pcolor});
                osector.appendChild(CY.svg.createAnimate('d', {id: 'a1', to: CY.svg.getSectorD(ox, oy, unit(dis - sector_width), unit(dis), angle/2, 360-angle/2, 1), dur: '0.4s', repeatCount: 1, begin: '0s;a2.end', fill: 'freeze'}));
                osector.appendChild(CY.svg.createAnimate('stroke', {id: 'a2', to: pcolor, dur: '2s', repeatCount: 1, begin: 'a1.end'}));
                frg.appendChild(osector);
            } break;
        }
        const point_radius = 0.5;
        const chara = CY.svg.drawCircle(ox, oy, unit(radius <= point_radius && is_self ? point_radius/2 : point_radius), {fill: pcolor});
        if ( _attr['is_sprint'] === '1' )
            chara.appendChild(CY.svg.createAnimate('cx', {values: `${ox};${ox + unit(dis)};${ox + unit(dis)}`, keyTimes: '0;0.2;1', dur: '1.5s', repeatCount: '1', begin: 'a1.end'}));
        frg.appendChild(chara);
        if ( !is_self ){
            const targetPosition = CY.svg.drawCircle(endx, endy, unit(radius > point_radius ? point_radius : point_radius/2), {fill: '#2196f3'});   
            frg.appendChild(targetPosition);
        }

        const svg = CY.svg.create(w, h);
        svg.appendChild(frg);

        const scope = simpleCreateHTML('div', ['effective_area', 'content', 'hidden']);
        const svg_scope = document.createElement('div');
        svg_scope.appendChild(svg);
        scope.appendChild(svg_scope);
        scope.appendChild(caption);

        return scope;
    }

    const {SLv, CLv} = data;

    const btype = branch.name;
    const suffix = [];

    let attr = branch.branchAttributes;

    let p = branch.findLocation() + 1;
    let c = branch.parent.branchs[p];
    while ( c !== void 0 && SUFFIX_LIST.indexOf(c.name) != -1 ){
        suffix.push(c);
        c = branch.parent.branchs[++p];
    }

    const extra_fix = branch.parent.branchs.filter(b => EXTRA_FIX_LIST.indexOf(b.name) != -1);

    const stack_branch_list = extra_fix.filter(b => b.name == 'stack' && (attr['stack_id'] || '').split(',').indexOf(b.branchAttributes['id']) != -1 );
    const stack_value_list = stack_branch_list.map(stk => safeEval(data.stackValues[getStackBranchIdKey(stk)]));
    const stack_name_list = stack_branch_list.map(stk => data.stackNames[getStackBranchIdKey(stk)] || Lang('branch/stack/base name') + stk.branchAttributes['id']);
    const stack = stack_value_list.length > 1 ? stack_value_list : stack_value_list[0];

    const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
    if ( attr['is_mark'] === '1' && !data.branchDevelopmentMode )
        he.classList.add('is_mark');

    switch (btype){
        case 'stack': {
            const stk = branch;
            const left = simpleCreateHTML('span', 'ctr_button', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>'),
                right = simpleCreateHTML('span', 'ctr_button', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>'),
                mid = simpleCreateHTML('input', 'mid'),
                unit = stk.branchAttributes['unit'] !== void 0 ? simpleCreateHTML('span', 'unit', stk.branchAttributes['unit']) : null;

            const ov = data.stackValues[getStackBranchIdKey(branch)];
            mid.value = ov;
            if ( unit === null ){
                mid.style.width = "2rem";
                mid.style.textAlign = "center";
            }
            else
                mid.style.width = (0.6*String(ov).length + 0.2) + "rem";

            const maxv = parseInt(safeEval(stk.branchAttributes['max']), 10),
                minv = parseInt(safeEval(stk.branchAttributes['min']), 10);
            const ctr_listener = function(event){
                const max = parseInt(mid.getAttribute('data-maxv'), 10);
                const min = parseInt(mid.getAttribute('data-minv'), 10);
                let v = parseInt(mid.value, 10);
                switch ( this.getAttribute('data-ctr') ){
                    case '-': --v; break;
                    case '+': ++v; break;
                }
                if ( v > max )
                    v = max;
                else if ( v < min )
                    v = min;
                v = String(v);
                mid.value = v;
                data.stackValues[getStackBranchIdKey(stk)] = v;
                data.skillRoot.controller.updateSkillHTML();
            };
            left.setAttribute('data-ctr', '-');
            left.addEventListener('click', ctr_listener);

            right.setAttribute('data-ctr', '+');
            right.addEventListener('click', ctr_listener);

            mid.type = "number";
            mid.setAttribute('data-maxv', maxv);
            mid.setAttribute('data-minv', minv);
            mid.addEventListener('change', ctr_listener);
            mid.addEventListener('focus', function(event){
                this.select();
            });

            const scope1 = document.createDocumentFragment();
            if ( attr['name'] !== void 0 ){
                scope1.appendChild(simpleCreateHTML('span', '_main_title', attr['name']));
            }
            scope1.appendChild(simpleCreateHTML('span', '_main_title', processValue(attr['min']) + '~' + ( attr['max'] !== void 0 ? processValue(attr['max']) : '?') + (attr['unit'] !== void 0 ? attr['unit'] : '')));
            // scope1.appendChild(createSkillAttributeScope(null, Lang('branch/stack/min value'), processValue(attr['min'])));
            // if ( attr['max'] !== void 0 )
            //     scope1.appendChild(createSkillAttributeScope(null, Lang('branch/stack/max value'), processValue(attr['max'])));

            const main = document.createDocumentFragment();
            main.appendChild(left);
            main.appendChild(mid);
            if ( unit !== null )
                main.appendChild(unit);
            main.appendChild(right);

            const content = createContentLine(scope1, main, {headIcon: false});

            he.appendChild(content);

            branch.finish = true;
            return he;
        }
        case 'poration': {
            const content = simpleCreateHTML('div', 'content');

            const {one, two} = getPorationHTML(branch);

            content.appendChild(one);
            content.appendChild(two);

            he.appendChild(content);

            branch.finish = true;
            return he;
        }
        case 'damage': {
            // 分支name
            let damage_name = null;
            if ( attr['name'] !== void 0 ){
                damage_name = document.createDocumentFragment();
                damage_name.appendChild(simpleCreateHTML('span', '_icon', ICONS.bodomu));
                damage_name.appendChild(simpleCreateHTML('span', '_name', attr['name']));
            }

            // 標題
            let text = '';
            switch ( attr['title'] ){
                case 'normal': 
                    text = attr['frequency'] == '1' ? Lang('branch/damage/title type: one') : Lang('branch/damage/title type: total'); break;
                case 'each':
                    text = Lang('branch/damage/title type: each'); break;
                case 'normal_attack':
                    text = Lang('branch/damage/title type: normal attack'); break;
            }
            const title = simpleCreateHTML('span', '_main_title', text);

            // 技能常數基底
            const valid_base = createSkillAttributeScope(
                null, null,
                attr['damage_type'] == 'physical' ? Lang('branch/damage/valid base: atk') : Lang('branch/damage/valid base: matk')
            );

            const damage_type = createSkillAttributeScope(
                null, null,
                {physical: Lang('physical'), magic: Lang('magic')}[attr['damage_type']]
            );

            // 技能常數
            const constant = attr['title'] === 'normal_attack' && attr['constant'] === '0'
            ? null
            : createSkillAttributeScope(
                null, 
                Lang('branch/damage/skill constant'),
                processValue(attr['constant'])
            );

            const multiplier = createSkillAttributeScope(
                null,
                Lang('branch/damage/skill multiplier'),
                processValue(attr['multiplier'], {tail: '%'})
            );

            //異常狀態
            let aliment = null;
            if ( attr['aliment_name'] !== void 0 ) {
                const s2 = document.createDocumentFragment();
                s2.appendChild(createSkillAttributeScope(null, null, attr['aliment_name']));
                s2.appendChild(createSkillAttributeScope(null, Lang('branch/damage/chance'), processValue(attr['aliment_chance'] || '0', {tail: '%'})));
                aliment = createContentLine(
                    simpleCreateHTML('span', '_main_title', Lang('branch/damage/aliment')),
                    s2
                );
            }
            
            // 傷害目標類型
            let area_scope = null;
            let target_type = null;
            if ( attr['type'] == 'single' )
                target_type = createSkillAttributeScope(null, null, Lang('branch/damage/target type: single'));
            else {
                target_type = createSkillAttributeScope(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
                    null, Lang('branch/damage/target type: AOE')
                );
                area_scope = getEffectiveAreaHTML(branch);
                target_type.addEventListener('click', () => {
                    area_scope.classList.toggle('hidden');
                });
                target_type.classList.add('show_area');
            }

            // 屬性
            let damage_element = null;
            if ( attr['element'] !== void 0 ){
                damage_element = getDamageElementHTML(attr['element']);
            }
            let damage_isPlace = null;
            if ( attr['is_place'] == '1' ){
                damage_isPlace = createSkillAttributeScope(null, null, Lang('branch/damage/is place'));
            }

            // 傷害次數  週期、頻率
            let damage_frequency = null, damage_judgment = null, damage_cycle = null;
            if ( attr['frequency'] !== '1' || attr['title'] == 'each' ) {
                damage_frequency = simpleCreateHTML(
                    'span', '_main_title',
                    processValue(attr['frequency'], {tail: Lang('branch/damage/frequency: unit')})
                );
                text = attr['judgment'] == 'common' ? Lang('branch/damage/judgment: common') : Lang('branch/damage/judgment: separate')
                damage_judgment = createSkillAttributeScope(
                    null, null, text
                );
                if ( attr['is_place'] == '1' && attr['cycle'] !== void 0 ) {
                    damage_cycle = createSkillAttributeScope(null, null, Lang('branch/damage/cycle: pretext') + processValue(attr['cycle'], {tail: GetLang('global/second')}));
                }
            }
            

            // @poration後綴
            const poration_branch = suffix.find(b => b.name == 'poration');
            let poration_damage = null, poration_poration = null;
            if ( poration_branch !== void 0 ){
                const {one, two} = getPorationHTML(poration_branch);
                poration_damage = one;
                poration_poration = two;
                poration_branch.finish = true;
            }

            // @extra後綴
            const damage_extras = suffix.filter(b => b.name == 'extra');
            const damage_extras_frg = document.createDocumentFragment();
            damage_extras.forEach(ex => {
                const _attr = ex.branchAttributes;
                const s2 = document.createDocumentFragment();

                if ( _attr['aliment_name'] )
                    s2.appendChild(createSkillAttributeScope(null, null, _attr['aliment_name']));
                if ( _attr['aliment_chance'] )
                    s2.appendChild(createSkillAttributeScope(null, Lang('branch/damage/chance'), processValue(_attr['aliment_chance']) + '%'));
                if ( _attr['constant'] ){
                    let t = safeEval(_attr['constant']);
                    const sign = t >= 0 ? '+' : '';
                    let res = Lang('branch/damage/skill constant') + sign + t;
                    if ( t < 0 )
                        res = darkText(res);
                    res = processValue(res, {calc: false, checkHasStack: _attr['constant']});
                    s2.appendChild(createSkillAttributeScope(null, null, res));
                }
                if ( _attr['element'] ){
                    s2.appendChild(getDamageElementHTML(_attr['element']));
                }
                if ( _attr['caption'] ){
                    s2.appendChild(simpleCreateHTML('div', 'text_scope', processText(ex, 'caption')));
                }
                ex.stats.forEach(stat => s2.appendChild(processStat(stat)));
                
                damage_extras_frg.appendChild(createContentLine(simpleCreateHTML(
                        'span', '_main_title',
                        processText(ex, 'condition', Lang('branch/damage/extra/base title'))
                    ),
                    s2
                ));
                ex.finish = true;
            });

            /*** 開始介面配置 ***/
            const top = simpleCreateHTML('div', 'top');
            if ( damage_name !== null )
                top.appendChild(damage_name);
            
            const frg1 = document.createDocumentFragment();
            frg1.appendChild(damage_type);
            if ( damage_isPlace !== null )
                frg1.appendChild(damage_isPlace);
            if ( damage_element !== null )
                frg1.appendChild(damage_element);
            if ( damage_judgment !== null )
                frg1.appendChild(damage_judgment);
            if ( damage_cycle !== null )
                frg1.appendChild(damage_cycle);
            if ( poration_damage !== null )
                frg1.appendChild(poration_damage);
            if ( poration_poration != null )
                frg1.appendChild(poration_poration);

            const frg2 = document.createDocumentFragment();
            frg2.appendChild(valid_base);
            if ( constant !== null )
                frg2.appendChild(constant);
            frg2.appendChild(multiplier);

            const content = simpleCreateHTML('div', 'content');
            const scope1 = simpleCreateHTML('div', 'scope1');

            const line_frg1 = document.createDocumentFragment();
            line_frg1.appendChild(target_type);
            if ( damage_frequency !== null )
                line_frg1.appendChild(damage_frequency);
            line_frg1.appendChild(title);

            const line = createContentLine(line_frg1, frg2, {headIcon: false});

            scope1.appendChild(frg1);
            if ( scope1.childElementCount !== 0 )
                content.appendChild(scope1);
            
            if ( top.childElementCount != 0 )
                he.appendChild(top);
            he.appendChild(content);
            he.appendChild(line);
            if ( aliment !== null )
                he.appendChild(aliment);
            if ( damage_extras_frg.childElementCount > 0 )
                he.appendChild(damage_extras_frg);
            if ( area_scope !== null )
                he.appendChild(area_scope);

            branch.finish = true;
            return he;
        }
        case 'effect': case 'next': case 'passive': {
            let text_name = null;
            if ( attr['name'] !== void 0 ){
                text_name = document.createDocumentFragment();
                text_name.appendChild(simpleCreateHTML('span', '_icon', ICONS.bodomu));
                text_name.appendChild(simpleCreateHTML('span', '_name', attr['name']));
            }
            
            let c = attr['condition'];
            if ( c == 'auto' )
                c = Lang('branch/effect/condition: auto');
            if ( c == 'hit' )
                c = Lang('branch/effect/condition: hit');
            if ( btype == 'next' ){
                if ( attr['frequency'] == '1' )
                    c = Lang('branch/effect/condition: next');
                else {
                    const _t = Lang('branch/effect/condition: next-2');
                    c = `${_t[0]}${attr['frequency']}${_t[1]}`;
                }
            }
            if ( btype == 'passive' )
                c = Lang('branch/effect/condition: passive');

            const condition = c != 'none' ? simpleCreateHTML('span', '_main_title', processText(branch, null, c)) : null;
            let end_condition = null;
            if ( attr['end_condition'] )
                end_condition = simpleCreateHTML('span', '_main_title', attr['end_condition']);
            let duration = null;
            if ( attr['duration'] ){
                let v = processValue(attr['duration']);
                if ( attr['is_place'] === '1' )
                    duration = createSkillAttributeScope(null, Lang('branch/effect/duration'), processValue(attr['duration']), GetLang('global/second'))
                else {
                    const _t = Lang('branch/effect/duration-2');
                    duration = simpleCreateHTML('span', '_main_title', `${_t[0]}${v}${_t[1]}`);
                }
            }
            let isPlace = null;
            if ( attr['is_place'] === '1' ){
                isPlace = createSkillAttributeScope(null, null, Lang('branch/damage/is place'));
            }

            let text = attr['type'] !== void 0 ? getTargetText(attr['type'], attr['is_place'] === '1') : null;
            let target_type = null;
            let area_scope = null;
            
            if ( attr['radius'] === void 0 )
                target_type = text !== null ? createSkillAttributeScope(null, null, text) : null;
            else {
                target_type = createSkillAttributeScope(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
                    null, text
                );
                attr['end_position'] = 'self';
                attr['effective_area'] = 'circle';
                area_scope = getEffectiveAreaHTML(branch);
                target_type.addEventListener('click', () => {
                    area_scope.classList.toggle('hidden');
                });
                target_type.classList.add('show_area');
            }
            
            const extras = suffix.filter(a => a.name == 'extra');
            const extras_frg = document.createDocumentFragment();
            extras.forEach(ex => {
                const _attr = ex.branchAttributes;
                if ( _attr['condition'] === void 0 )
                    _attr['condition'] = Lang('branch/damage/extra/base title');
                const s2 = document.createDocumentFragment();

                if ( _attr['caption'] ){
                    s2.appendChild(simpleCreateHTML('div', 'text_scope', processText(ex, 'caption')));
                }
                ex.stats.forEach(stat => s2.appendChild(processStat(stat)));
                const s1 = document.createDocumentFragment();
                s1.appendChild(simpleCreateHTML('span', '_main_title', processText(ex, 'condition')));
                if ( _attr['target'] !== void 0 ){
                    s1.appendChild(simpleCreateHTML('span', '_main_title', _attr['target']));
                }
                extras_frg.appendChild(createContentLine(s1, s2));
                ex.finish = true;
            });

            const scope1 = document.createDocumentFragment();
            if ( condition !== null )
                scope1.appendChild(condition);

            const frg1 = document.createDocumentFragment();
            if ( isPlace !== null )
                frg1.appendChild(isPlace);
            if ( end_condition !== null )
                frg1.appendChild(end_condition);
            if ( duration !== null )
                frg1.appendChild(duration);
            if ( target_type != null )
                frg1.appendChild(target_type);

            const scope2 = document.createDocumentFragment();
            if ( attr['caption'] )
                scope2.appendChild(simpleCreateHTML('div', 'text_scope', processText(branch, 'caption')));
            else
                branch.stats.forEach(a => scope2.appendChild(processStat(a)));

            const top = simpleCreateHTML('div', 'top');
            if ( text_name !== null )
                top.appendChild(text_name);
            
            if ( top.childElementCount != 0 )
                he.appendChild(top);

            const content_top = simpleCreateHTML('div', 'content');
            if ( isPlace !== null ){
                const s1 = simpleCreateHTML('div', 'scope1');
                s1.appendChild(frg1);
                content_top.appendChild(s1);
            }
            else
                scope1.appendChild(frg1);

            const content = createContentLine(scope1, scope2, {headIcon: false});

            if ( content_top.childElementCount !== 0 )
                he.appendChild(content_top);
            he.appendChild(content);
            if ( extras_frg.childElementCount !== 0 )
                he.appendChild(extras_frg);
            if ( area_scope !== null )
                he.appendChild(area_scope);

            branch.finish = true;
            return he;
        }
        case 'heal': {
            let heal_name = null;
            if ( attr['name'] ){
                heal_name = document.createDocumentFragment();
                heal_name.appendChild(simpleCreateHTML('span', '_icon', ICONS.bodomu));
                heal_name.appendChild(simpleCreateHTML('span', '_name', attr['name']));
            }

            let text = getTargetText(attr['target']);
            const target = text != null ? createSkillAttributeScope(null, null, text) : null;

            const constant = attr['constant'] != '0' ? createSkillAttributeScope(
                null, null, processValue(attr['constant'])
            ) : null;

            let duration = null;
            if ( attr['duration'] !==  void 0 ){
                let v = processValue(attr['duration']);
                duration = createSkillAttributeScope(null, Lang('branch/effect/duration'), processValue(attr['duration']), GetLang('global/second'));
            }

            let frequency = null;
            if ( attr['frequency'] !==  void 0 ) {
                frequency = simpleCreateHTML(
                    'span', '_main_title',
                    processValue(attr['frequency'], {tail: Lang('branch/heal/frequency: unit')})
                );
            }

            let cycle = null;
            if ( attr['cycle'] !==  void 0 ) {
                cycle = createSkillAttributeScope(null, null, Lang('branch/damage/cycle: pretext') + processValue(attr['cycle'], {tail: GetLang('global/second')}));
            }

            const extra_frg = document.createDocumentFragment();
            if ( attr['extra_text'] !==  void 0 ){
                const ta = attr['extra_text'].split(','),
                    va = attr['extra_value'].split(',').map(a => processValue(a, {toPercentage: true}));
                ta.forEach((a, i) => {
                    extra_frg.appendChild(createSkillAttributeScope(null, a, va[i]));
                });;
            }
            const top = simpleCreateHTML('div', 'top');
            if ( heal_name !== null )
                top.appendChild(heal_name);

            if ( top.childElementCount != 0 )
                he.appendChild(top);

            const content = simpleCreateHTML('div', 'content');

            const scope1 = simpleCreateHTML('div', 'scope1');
            scope1.appendChild(target);
            if ( duration !== null )
                scope1.appendChild(duration);
            if ( cycle !== null )
                scope1.appendChild(cycle);

            content.appendChild(scope1);

            he.appendChild(content);

            const frg1 = document.createDocumentFragment();
            frg1.appendChild(simpleCreateHTML(
                'span', '_main_title', {
                    hp: Lang('branch/heal/title: hp'),
                    mp: Lang('branch/heal/title: mp')
                }[attr['type']]
            ));
            if ( frequency !== null )
                frg1.appendChild(frequency);

            const frg2 = document.createDocumentFragment();
            if ( constant !== null )
                frg2.appendChild(constant);
            if ( extra_frg.childElementCount !== 0 )
                frg2.appendChild(extra_frg);
            he.appendChild(createContentLine(frg1, frg2, {headIcon: false}));

            branch.finish = true;
            return he;
        }
        case 'text': case 'tips': {
            let text_name = null;
            if ( attr['name'] ){
                text_name = simpleCreateHTML('span', '_name', attr['name']);
            }

            const main_text = simpleCreateHTML('div', 'text_scope', processText(branch));

            const top = simpleCreateHTML('div', 'top');
            if ( text_name !== null )
                top.appendChild(text_name);

            const content = simpleCreateHTML('div', 'content');
            content.appendChild(main_text);

            if ( top.childElementCount != 0 )
                he.appendChild(top);
            he.appendChild(content);

            branch.finish = true;
            return he;
        }
        case 'list': {
            const lists = [];
            lists.push(branch);
            let p = branch.findLocation() + 1;
            let cur = branch.parent.branchs[p];
            while ( cur !== void 0 && cur.name == btype ){
                lists.push(cur);
                cur = branch.parent.branchs[++p];
            }
            const ul = simpleCreateHTML('ul', '_lists');
            lists.forEach(b => {
                ul.appendChild(simpleCreateHTML('li', null, processText(b)));
                b.finish = true;
            });

            const content = simpleCreateHTML('div', 'content');
            content.appendChild(ul);

            he.appendChild(content);

            branch.finish = true;
            return he;
        }
        case 'reference': {
            let main_text = null;
            if ( attr['text'] )
                main_text = simpleCreateHTML('div', 'text_scope', processText(branch));

            let url_scope = null;
            if ( attr['url'] ){
                url_scope = document.createDocumentFragment();
                let urls = attr['url'].split(',');
                let url_texts = attr['url_text'].split(',');
                urls.forEach((a, i) => {
                    url_scope.appendChild(createSkillAttributeScope(null, null, `<a href="${a}" target="_blank" class="url_text">${url_texts[i]}</a>`));
                });
            }
            if ( main_text !== null)
                he.appendChild(main_text);
            if ( url_scope !== null )
                he.appendChild(createContentLine(simpleCreateHTML('span', '_main_title', Lang('branch/reference/reference url')), url_scope, {headIcon: false}));

            branch.finish = true;
            return he;
        }
    }
    return null;
}

export default getBranchHTML;