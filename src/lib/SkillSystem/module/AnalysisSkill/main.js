import GetLang from "../../../main/module/LanguageSystem.js";
import CY from "../../../main/module/cyteria.js";
import {SkillEffect} from "../SkillElements.js";

const simpleCreateHTML = CY.element.simpleCreateHTML;

function createSkillAttributeScope(icon, t, v, tail){
    const a = simpleCreateHTML('div', 'skill-attribute');

    let html = '';
    if ( icon !== null )
        html += icon;
    if ( t !== null )
        html += '<span class="text">' + t + '</span>';
    if ( html !== '' )
        a.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'], html));

    if ( v !== null && v !== void 0 )
        a.appendChild(simpleCreateHTML('span', 'value', v));
    if ( tail !== null && tail !== void 0 )
        a.appendChild(simpleCreateHTML('span', 'tail', tail));
    return a;
}

function getSkillAttributeData(){
    const ICON_DATA = {
        [SkillEffect.MP_COST]: 'iconify/ion:water',
        [SkillEffect.RANGE]: 'target',
        [SkillEffect.SKILL_TYPE]: 'multiple-blank-circle',
        [SkillEffect.IN_COMBO]: ['iconify/mdi:selection-ellipse-arrow-inside', 'forbid', 'iconify/mdi:numeric-1-circle-outline'],
        [SkillEffect.ACTION_TIME]: 'iconify/mdi:timer-sand-full',
        [SkillEffect.CASTING_TIME]: 'iconify/mdi:update'
    };
    const TITLE_DATA = {
        [SkillEffect.MP_COST]: Lang('mp cost'),
        [SkillEffect.RANGE]: Lang('range'),
        [SkillEffect.SKILL_TYPE]: Lang('skill type'), 
        [SkillEffect.IN_COMBO]: Lang('in combo'),
        [SkillEffect.ACTION_TIME]: Lang('action time'),
        [SkillEffect.CASTING_TIME]: ['', Lang('casting time'), Lang('charging time')]
    };
    const TEXT_LIST = {
        [SkillEffect.SKILL_TYPE]: Lang('skill type: List'),
        [SkillEffect.IN_COMBO]: Lang('in combo: List'),
        [SkillEffect.ACTION_TIME]: Lang('action time: List')
    };

    return {ICON_DATA, TITLE_DATA, TEXT_LIST};
}

function getStackBranchIdKey(stk){
    return 'id' + stk.branchAttributes['id'];
}

function Lang(s){
    return GetLang("Skill Query/Analysis Skill/" + s);
}

function handleFormula(str, calc_fun, eval_fun){
    str = str.replace(/\s+/g, '');
    // console.log(str);
    function isOperator(c){
        return /^[\+\-\*/\(\),]$/.test(c);
    }
    function isFunName(v){
        return /^[a-zA-Z_][a-zA-Z0-9\._]*$/.test(v);
    }
    // 用來取得push時的權重
    function w(c){
        switch (c){
            case '+':
            case '-':
                return 5;
            case '*':
            case '/':
            //case '%':
                return 6;
            case '(':
            case ')':
                return 8;
        }
    }

    let postFix, stk;
    const envirs = [];

    function createEnvir(){
        const t = {
            postFix: [],
            stk: []
        };
        envirs.push(t);
        postFix = t.postFix;
        stk = t.stk;
        return t;
    }
    function beforeLeaveEnvir(){
        if ( num !== '' )
            postFix.push(num);
        while ( stk.length != 0 )
            postFix.push(stk.pop());
    }

    const fun_stk = [];

    function addParam(){
        beforeLeaveEnvir();
        fun_stk[fun_stk.length-1].params.push(envirs.pop());
        const t = envirs[envirs.length-1];
        postFix = t.postFix;
        stk = t.stk;
    }

    createEnvir();
    let num = '';

    try {
        str.split('').forEach((c, i, ary) => {
            if ( !isOperator(c) ){
                num += c;
                return;
            }

            console.log(num);

            if ( num !== '' ){
                if ( c == '(' && isFunName(num) ){
                    fun_stk.push({
                        type: 'function',
                        name: num,
                        params: []
                    });

                    postFix.push(fun_stk[fun_stk.length-1]);
                    createEnvir();
                    num = '';
                    return;
                }
                else
                    postFix.push(num);
                num = '';
            }

            if ( c == ',' ){
                addParam();
                createEnvir();
                return;
            }

            // c為當前的運算子。開始對c作條件判斷。
            if ( c == ')' ){
                // 如果是")"，一直pop stk並放到postFix裡直到遇到"("
                if (stk.indexOf('(') == -1 && fun_stk.length != 0 ){
                    addParam();
                    fun_stk.pop();
                }
                else {
                    let t;
                    while ( (t = stk.pop()) != '(' ){
                        if ( stk.length == 0 ) // 左刮號找不到和它成對的右刮號時。
                            throw new Error('Unrecognizable operator: )');
                        postFix.push(t);
                    }
                }
                return;
            }

            // 設c的權重為wi。stk.top()的權重為wt。
            // 不停pop stk並放到postFix裡，直到(wi > wt)。
            // 要注意'('在stk內部的話，權重為最小。
            while ( w(c) <= w(stk[stk.length - 1]) && stk[stk.length - 1] != '(' )
                postFix.push(stk.pop());
            stk.push(c);
        });
        
        beforeLeaveEnvir();

        // console.log('envirs: ', envirs.slice());
        // console.log('fun_stk: ', fun_stk.slice());
        
        function handlePostFix(env){
            const _stk = [];
            const _postFix = env.postFix.reverse();

            while ( _postFix.length != 0 ){
                let p = _postFix.pop();
                if ( typeof p == 'object' ){
                    if ( p.type == 'function' ){
                        const params = p.params.map(a => handlePostFix(a));
                        const fun_str = p.name + '(' + params.join(', ') + ')';
                        p = params.every(a => /^[0-9.]+$/.test(a))
                            ? eval_fun(fun_str)
                            : fun_str;
                    }
                    else
                        p = '?';
                }
                if ( isOperator(p) ){
                    const a = _stk.pop(), b = _stk.pop();
                    if ( a == void 0 || b == void 0 )
                        throw new Error('Invaild formula: ' + str);
                    p = calc_fun(b, p, a);
                }
                _stk.push(p.toString());
            }
            return _stk.pop();
        }

        return handlePostFix(envirs[0]);
    }
    catch(e){
        console.log(e.stack);
        return '0';
    }       
}

export {createSkillAttributeScope, getStackBranchIdKey, simpleCreateHTML, Lang,
        getSkillAttributeData, handleFormula};