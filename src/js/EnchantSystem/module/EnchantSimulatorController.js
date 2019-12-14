import {EnchantEquipment, EnchantStep, InitEnchantElementStatus, EnchantElementStatus} from "./EnchantElement.js";
import CY from "../../main/module/cyteria.js";
import GetLang from "../../main/module/LanguageSystem.js";
import Icons from "../../main/module/SvgIcons.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";
import ShowMessage from "../../main/module/ShowMessage.js";


function Lang(s){
    return GetLang('Enchant Simulator/' + s);
}

export default class EnchantSimulatorController {
    constructor(parent){
        this.parent = parent;
        this.equipments = [];
        this.nodes = {
            selectStat: null,
            equipmentsList: null,
            equipments: null
        };
        this.status = {
            currentEquipment: null,
            character: {
                levelLimit: 190
            },
            currentStepScope: null
        };
        this.scopeClassName = {
            'equipment': 'enchant-equipment',
            'step': 'step-scope',
            'stat': 'stat-scope'
        };
        const ctrr = this;
        this.listeners = {
            inputClickSelect(e){
                this.select();
            },
            setCharacterLevel(e){
                let v = EnchantElementStatus('Character/level');

                switch ( this.getAttribute('data-ctr') ){
                    case '+':
                        v = v + 10;
                        break;
                    case '-':
                        v = v - 10;
                        break;
                }
                if ( v > ctrr.status.character.levelLimit || v < 10 )
                    return;
                v = EnchantElementStatus('Character/level', v);
                this.parentNode.querySelector('.character-level').innerHTML = v;

                ctrr.equipments.forEach(eq => eq.refreshStats());

                ctrr.updateCurrentEquipmentScope();
            },
            selectCurrentEquipment(e){
                const i = Array.from(this.parentNode.querySelectorAll('.select')).indexOf(this);
                const scope = ctrr.nodes.equipments.querySelectorAll('.enchant-equipment')[i];
                const cur_scope = ctrr.nodes.equipments.querySelector('.enchant-equipment:not(.hidden)');
                if ( cur_scope )
                    cur_scope.classList.add('hidden');
                scope.classList.remove('hidden');

                const cur = this.parentNode.querySelector('.cur');
                if ( cur )
                    cur.classList.remove('cur');
                this.classList.add('cur');

                ctrr.currentEquipment(ctrr.equipments[i]);
            },
            selectEquipmentField(e){
                const eq = ctrr.currentEquipment();
                if ( !eq )
                    return;
                this.parentNode.querySelector('.cur').classList.remove('cur');
                this.classList.add('cur');
                switch ( this.getAttribute('data-set') ){
                    case 'main-weapon|original-element':
                        eq.setStatus('fieldType', 0);
                        eq.setStatus('isOriginalElement', true);
                        break;
                    case 'main-weapon':
                        eq.setStatus('fieldType', 0);
                        eq.setStatus('isOriginalElement', false);
                        break;
                    case 'body-armor':
                        eq.setStatus('fieldType', 1);
                }
                ctrr.updateCurrentEquipmentScope();
            },
            setEquipmentOriginalPotential(e){
                const eq = ctrr.currentEquipment();

                switch ( this.getAttribute('data-ctr') ){
                    case '+':
                        eq.addOriginalPotential(1);
                        break;
                    case '-':
                        eq.addOriginalPotential(-1);
                        break;
                }
                ctrr.updateCurrentEquipmentScope();
            },
            inputEquipmentOriginalPotential(e){
                const eq = ctrr.currentEquipment();
                eq.originalPotential(parseInt(this.value));
                ctrr.updateCurrentEquipmentScope();
            },
            setEquipmentBasePotential(e){
                const eq = ctrr.currentEquipment();

                switch ( this.getAttribute('data-ctr') ){
                    case '+':
                        eq.addBasePotential(1);
                        break;
                    case '-':
                        eq.addBasePotential(-1);
                        break;
                }
                ctrr.updateCurrentEquipmentScope();
            },
            inputEquipmentBasePotential(e){
                const eq = ctrr.currentEquipment();
                eq.basePotential(parseInt(this.value));
                ctrr.updateCurrentEquipmentScope();
            },
            createStep(e){
                const t = ctrr.currentEquipment();
                if ( !t )
                    return;
                // if ( !t.checkStatsNumber() ){
                //     ShowMessage(Lang('Warn/Number of Equipment Item exceeding the maximum'));
                //     return;
                // }
                // if ( !t.checkCurrentPotential() ){
                //     ShowMessage(Lang('Warn/Potential of Equipment has been less than 1'))
                //     return;
                // }
                const step = t.appendStep();
                const steps_scope = this.parentNode;
                const step_scope = ctrr.createEnchantStepHTML(step);
                steps_scope.insertBefore(step_scope, this);
                ctrr.updateEnchantStepScope(step_scope, step);
            },
            openCreateStatWindow(e){
                const eq = ctrr.currentEquipment();
                if ( !eq )
                    return;
                ctrr.currentStepScope = ctrr.getScopeFromChildNode(this, 'step');
                const scope = ctrr.nodes.selectStat;
                scope.querySelectorAll('.category-items[data-field-only]')
                    .forEach(p => p.classList.toggle('invalid',
                        parseInt(p.getAttribute('data-field-only'), 10) != eq.status['fieldType']));
                scope.classList.remove('hidden');
            },
            setStatValue(e){
                const stat_scope = ctrr.getScopeFromChildNode(this, 'stat');
                const estat = ctrr.getEnchantStatByScope(stat_scope);

                switch ( this.getAttribute('data-ctr') ){
                    case '+':
                        estat.add(1);
                        break;
                    case '-':
                        estat.add(-1);
                        break;
                    case '>>':
                        estat.set(estat.itemBase.getLimit(estat.statType())[0] - Math.min(estat.getPreviousStepStatValue(), 0));
                        break;
                }
                ctrr.updateCurrentEquipmentScope();
            },
            switchStepType(e){
                const tn = parseInt(this.getAttribute('data-step-type'));
                const new_tn = tn == 0 ? 1 : 0;

                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                const step = ctrr.getEnchantStepByScope(step_scope);

                step.setType(new_tn == 0 ? EnchantStep.TYPE_NORMAL : EnchantStep.TYPE_EACH);

                ctrr.updateCurrentEquipmentScope();
            },
            setStepStepValue(e){
                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                const step = ctrr.getEnchantStepByScope(step_scope);

                switch ( this.getAttribute('data-ctr') ){
                    case '+':
                        step.addStepValue(1);
                        break;
                    case '-':
                        step.addStepValue(-1);
                        break;
                }
                ctrr.updateCurrentEquipmentScope();
            },
            moveStep(e){
                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                const step = ctrr.getEnchantStepByScope(step_scope);

                const step_scope_list = ctrr
                    .getScopeFromChildNode(step_scope, 'equipment')
                    .querySelectorAll('.' + ctrr.scopeClassName['step']);

                const eq = step.belongEquipment(), si = step.index();

                let fin;
                switch ( this.getAttribute('data-ctr') ){
                    case '<':
                        fin = eq.swapStep(si, si-1);
                        if ( fin )
                            step_scope.parentNode.insertBefore(step_scope, step_scope_list[si-1]);
                        break;
                    case '>':
                        fin = eq.swapStep(si, si+1);
                        if ( fin )
                            step_scope.parentNode.insertBefore(step_scope_list[si+1], step_scope);
                        break;
                }
                if ( fin )
                    ctrr.updateCurrentEquipmentScope();
            },
            removeStep(e){
                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                const step = ctrr.getEnchantStepByScope(step_scope);
                step.remove();
                CY.element.remove(step_scope);
                ctrr.updateCurrentEquipmentScope();
            },
            removeStat(e){
                const stat_scope = ctrr.getScopeFromChildNode(this, 'stat');
                const stat = ctrr.getEnchantStatByScope(stat_scope);
                stat.remove();
                CY.element.remove(stat_scope);
                ctrr.updateCurrentEquipmentScope();
            },
            copyEnchantResult(e){
                const t = ctrr.getEnchantTextResult(ctrr.currentEquipment());
                if ( CY.copyToClipboard(t) )
                    ShowMessage(Lang('Warn/Success to copy'));
            }
        };
    }
    init(hnode){
        InitEnchantElementStatus();

        const ctrr = this;
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const set_clv = simpleCreateHTML('div', ['Cyteria', 'set-button-line', 'set-character-level']);
        {
            const left =  CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('sub'), {'data-ctr': '-'});
            left.addEventListener('click', this.listeners.setCharacterLevel);
            const right = CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('add'), {'data-ctr': '+'});
            right.addEventListener('click', this.listeners.setCharacterLevel);
            const mid = CY.element.simpleCreateHTML('span', ['Cyteria', 'text', 'between-button', 'character-level'], EnchantElementStatus('Character/level'));

            set_clv.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'title', 'text-small', 'light'], Icons('cards') + `<span class="text">${Lang('Character Level')}</span>`));
            set_clv.appendChild(left);
            set_clv.appendChild(mid);
            set_clv.appendChild(right);

            hnode.appendChild(set_clv);
        }

        const eq_list = simpleCreateHTML('ul', 'equipments-list');
        const create_eq_btn = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'no-border', 'create-equipment'], Icons('add-circle-outline') + `<span class="text">${Lang('create equipment')}</span>`);
        create_eq_btn.addEventListener('click', function(e){
            ctrr.createEquipment();
        });
        eq_list.appendChild(create_eq_btn);
        this.nodes.equipmentsList = eq_list;

        const eqs_scope = simpleCreateHTML('div', 'equipments');
        this.nodes.equipments = eqs_scope;

        hnode.appendChild(eq_list);
        hnode.appendChild(eqs_scope);

        function selectStatListener(e){
            const [i, j] = this.getAttribute('data-iid').split('-').map(a => parseInt(a));
            const type = this.getAttribute('data-type') === '0' ? StatBase.TYPE_CONSTANT : StatBase.TYPE_MULTIPLIER;

            const item = ctrr.parent.categorys[i].items[j];

            const eq = ctrr.currentEquipment();
            const step_index = parseInt(ctrr.currentStepScope.getAttribute('data-i'), 10);
            const step = eq.step(step_index);

            if ( step.stat(item, type) ){
                ShowMessage(Lang('Warn/Step Stat Repeat'));
                return;
            }

            const [max, min] = item.getLimit(type);
            const pot = item.getPotential(type, eq.status);
            const v = pot > item.basePotential(type) ? min : 0;

            const estat = step.appendStat(item, type, v);

            if ( !estat ){
                ShowMessage(Lang('Warn/Number of Equipment Item exceeding the maximum'));
                return;
            }

            const node = ctrr.createEnchantStatHTML(estat);
            const stats_scope = ctrr.currentStepScope.querySelector('.step-stats');
            stats_scope.insertBefore(node, stats_scope.querySelector('.create-step'));

            ctrr.updateEnchantStepScope(ctrr.currentStepScope, step);

            if ( step.type == EnchantStep.TYPE_EACH /*|| !eq.checkStatsNumber()*/ )
                ctrr.nodes.selectStat.classList.add('hidden');
        }
        const selectStat = simpleCreateHTML('div', ['Cyteria', 'window', 'top-center', 'frozen-top', 'bg-mask', 'select-stat', 'hidden']);
        {
            const top = simpleCreateHTML('div', 'top');
            const name = simpleCreateHTML('span', 'name', Lang('select stat title'));

            const close = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button'], Icons('close'));
            close.addEventListener('click', function(e){
                ctrr.nodes.selectStat.classList.add('hidden');
            });

            top.appendChild(name);
            top.appendChild(close);
            selectStat.appendChild(top);
        }

        this.parent.categorys.forEach((cat, i) => {
            const cat_title = simpleCreateHTML('div', 'category-title', cat.title);
            const cat_items = simpleCreateHTML('ul', 'category-items');
            if ( cat.status['isWeaponOnly'] ){
                cat_items.setAttribute('data-field-only', '0');
            }
            cat.items.forEach((item, j) => {
                const sb = item.statBase;
                [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER].forEach((type, type_no) => {
                    if ( type == StatBase.TYPE_MULTIPLIER && !sb.hasMultiplier )
                        return;
                    const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple'], null,
                        {
                            'data-iid': i + '-' + j,
                            'data-type': type_no
                        }
                    );
                    li.appendChild(simpleCreateHTML('span', 'text', sb.title(type)));
                    li.addEventListener('click', selectStatListener);
                    cat_items.appendChild(li);
                });
            });
            selectStat.appendChild(cat_title);
            selectStat.appendChild(cat_items);
        });

        this.nodes.selectStat = selectStat;

        hnode.appendChild(selectStat);
    }
    getScopeFromChildNode(node, name){
        const cn = this.scopeClassName[name];
        while ( !node.classList.contains(cn) && node != document )
            node = node.parentNode;
        if ( node == document )
            console.error("Scope not found: " + name);
        return node;
    }
    createEquipment(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const eq = new EnchantEquipment();
        this.equipments.push(eq);

        const el = this.nodes.equipmentsList;
        const btn = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'select'], Lang('equipment') + " " + this.equipments.length);
        btn.addEventListener('click', this.listeners.selectCurrentEquipment);
        el.insertBefore(btn, el.querySelector('.create-equipment'));

        const eq_scope = this.createEquipmentHTML();

        this.nodes.equipments.appendChild(eq_scope);

        this.updateEquipmentScope(eq_scope, eq);

        btn.click();
    }
    currentEquipment(t){
        if ( t !== void 0 )
            this.status.currentEquipment = t;
        return this.status.currentEquipment;
    }
    getEnchantTextResult(eq){
        let res = '';

        const mats_text = Lang('Material Point Type List');
        res += Lang('Original Potential') + " " + eq.originalPotential()
            + (eq.basePotential() != EnchantElementStatus('EquipmentBasePotentialMiniMum') ? ('｜' + Lang('Base Potential') + " " + eq.basePotential()) : '')
            + eq.getAllMaterialPointCost().reduce((a, b, i) => a + (b != 0 ? `｜${mats_text[i]} ${b}` : ''), '')
            + '\n\n';
        
        eq.steps.forEach((p, i) => {
            if ( p.stepStats.length == 0 )
                return;
            res += (i != 0 ? '\n' : '') + (i + 1) + '. ';
            if ( p.type == EnchantStep.TYPE_NORMAL ){
                res += '附';
                p.stepStats.forEach((a, j) => {
                    res += (j != 0 ? '｜' : '') + a.showCurrent();
                });
            }
            else {
                const a = p.stepStats[0];
                res += '每次附' + a.show(p.stepValue()) + '，直到' + a.showCurrent();
            }
            res += '｜' + eq.currentPotential(p.index() + 1) + 'pt';
        });

        res += '\n\n成功率：' + Math.floor(eq.successRate()) + '%\n\n（布偶的魔法書）';

        return res;
    }
    getEnchantResult(eq){
        const frg = document.createDocumentFragment();

        let res = '';

        const mats_text = Lang('Material Point Type List');
        res += Lang('Original Potential') + " " + eq.originalPotential()
            + (eq.basePotential() != EnchantElementStatus('EquipmentBasePotentialMiniMum') ? ('｜' + Lang('Base Potential') + " " + eq.basePotential()) : '')
            + eq.getAllMaterialPointCost().reduce((a, b, i) => a + (b != 0 ? `｜${mats_text[i]} ${b}` : ''), '')
            + '<p>';
        
        eq.steps.forEach((p, i) => {
            if ( p.stepStats.length == 0 )
                return;
            res += (i != 0 ? '<br>' : '') + (i + 1) + '. ';
            if ( p.type == EnchantStep.TYPE_NORMAL ){
                res += '附';
                p.stepStats.forEach((a, j) => {
                    res += (j != 0 ? '｜' : '') + a.showCurrent();
                });
            }
            else {
                const a = p.stepStats[0];
                res += '每次附' + a.show(p.stepValue()) + '，直到' + a.showCurrent();
            }
            res += '｜' + eq.currentPotential(p.index() + 1) + 'pt';
        });
        res += '</p>';

        const div = CY.element.simpleCreateHTML('div', null, res);
        frg.appendChild(div);

        return frg;
    }
    updateCurrentEquipmentScope(){
        const eq = this.currentEquipment();
        if ( !eq )
            return;
        const eq_scope = this.nodes.equipments.querySelector('.' + this.scopeClassName['equipment'] + ':not(.hidden)');
        this.updateEquipmentScope(eq_scope, eq);
    }
    updateEquipmentScope(scope, eq){
        const tmp_hid = !scope.classList.contains('hidden');
        if ( tmp_hid )
            scope.classList.add('hidden');

        scope.querySelectorAll('.steps > .' + this.scopeClassName['step']).forEach((p, i) => {
            this.updateEnchantStepScope(p, eq.steps[i]);
        });

        scope.querySelector('.original-potential').value = eq.originalPotential();
        scope.querySelector('.base-potential').value = eq.basePotential();

        const checkStepsPt = eq.checkStepsPotentialCost();
        if ( !checkStepsPt )
            ShowMessage(Lang('Warn/Potential of Step is less than 1'));

        const sr = eq.successRate();
        const sr_scope = scope.querySelector('.success-rate-scope');
        const res_scope = scope.querySelector('.show-result-scope');
        if ( sr != -1 && checkStepsPt ){
            sr_scope.querySelector('.success-rate').innerHTML = Math.floor(sr) + '%';
            const res = res_scope.querySelector('.show-result-content');
            CY.element.removeAllChild(res);
            res.appendChild(this.getEnchantResult(eq));
            sr_scope.classList.remove('hidden');
            res_scope.classList.remove('hidden');
        }
        else {
            sr_scope.classList.add('hidden');
            res_scope.classList.add('hidden');
        }

        if ( tmp_hid )
            scope.classList.remove('hidden');
    }
    updateEnchantStepScope(scope, step){
        const step_index = step.index();
        scope.setAttribute('data-i', step_index);

        const tn = step.type == EnchantStep.TYPE_NORMAL ? 0 : 1;
        scope.querySelector('.switch-step-type').setAttribute('data-step-type', tn);
        scope.querySelector('.type-each-set-scope').classList[tn == 0 ? 'add' : 'remove']('hidden');
        scope.querySelector('.step-type-text').innerHTML = Lang('step type')[tn];

        scope.querySelector('.step-value').innerHTML = step.stepValue();

        scope.querySelector('.top .title').innerHTML = Lang('step title') + " " + (step_index + 1);
        scope.querySelectorAll('.step-stats > .' + this.scopeClassName['stat']).forEach((p, i, ary) => {
            this.updateEnchantStatScope(p, step.stepStats[i]);
        });

        const eq = step.belongEquipment();

        const stepPt = eq.currentPotential(step.index() + 1);
        scope.querySelector('.step-potential').innerHTML = stepPt;
        scope.classList[(stepPt < 1 || !eq.checkStatsNumber(step.index())) ? 'add' : 'remove']('warn');
    }
    updateEnchantStatScope(scope, estat){
        if ( !estat.valid() )
            scope.classList.add('invalid');
        else
            scope.classList.remove('invalid');

        scope.querySelector('.show').innerHTML = estat.show();

        scope.querySelector('.sub .pre-stats-value').innerHTML = estat.getPreviousStepStatValue();
        const pot = -1 * estat.realPotentialCost();
        scope.querySelector('.sub .stat-potential').innerHTML = Number.isInteger(pot) ? pot : pot.toFixed(2);

        const mat = estat.getMaterialPointCost();
        scope.querySelector('.sub .stat-material-point-cost').innerHTML = mat.value + " " + Lang('Material Point Type List')[mat.type];

        CY.element.setAttributes(scope, {
            'data-bn': estat.baseName(),
            'data-type': estat.statType() == StatBase.TYPE_CONSTANT ? 0 : 1
        });
    }
    getEnchantStepByScope(step_scope){
        const eq = this.currentEquipment();
        return eq.step(parseInt(step_scope.getAttribute('data-i')));
    }
    getEnchantStatByScope(stat_scope, step_scope){
        if ( !step_scope )
            step_scope = stat_scope.parentNode.parentNode;

        const step = this.getEnchantStepByScope(step_scope);

        const bn = stat_scope.getAttribute('data-bn');
        const type = stat_scope.getAttribute('data-type') == '0' ? StatBase.TYPE_CONSTANT : StatBase.TYPE_MULTIPLIER;

        return step.stat(bn, type);
    }
    createEquipmentHTML(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const r = simpleCreateHTML('div', [this.scopeClassName['equipment'], 'hidden']);

        const field_menu = simpleCreateHTML('ul', 'field-menu');
        const field_menu_text = Lang('Equipment Field List');
        const field_menu_icon = ['sword', 'sword', 'clothing'];
        ['main-weapon', 'main-weapon|original-element', 'body-armor'].forEach((p, i) => {
            const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple'], Icons(field_menu_icon[i]) + `<span class="text">${field_menu_text[i]}</span>`, {'data-set': p});
            li.addEventListener('click', this.listeners.selectEquipmentField);
            field_menu.appendChild(li);
            if ( i == 0 )
                li.classList.add('cur');
        });

        const set_orig_pot = simpleCreateHTML('div', ['Cyteria', 'set-button-line', 'set-original-potential']);
        {
            const left =  CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('sub'), {'data-ctr': '-'});
            left.addEventListener('click', this.listeners.setEquipmentOriginalPotential);
            const right = CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('add'), {'data-ctr': '+'});
            right.addEventListener('click', this.listeners.setEquipmentOriginalPotential);
            const mid = CY.element.simpleCreateHTML('input', ['Cyteria', 'input', 'between-button', 'original-potential']);
            mid.addEventListener('change', this.listeners.inputEquipmentOriginalPotential);
            mid.addEventListener('click', this.listeners.inputClickSelect);
            mid.type = 'number';

            set_orig_pot.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small', 'light', 'title'], Icons('multiple-blank-circle') + `<span class="text">${Lang('Original Potential')}</span>`));
            set_orig_pot.appendChild(left);
            set_orig_pot.appendChild(mid);
            set_orig_pot.appendChild(right);
        }

        const set_base_pot = simpleCreateHTML('div', ['Cyteria', 'set-button-line', 'set-base-potential']);
        {
            const left =  CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('sub'), {'data-ctr': '-'});
            left.addEventListener('click', this.listeners.setEquipmentBasePotential);
            const right = CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('add'), {'data-ctr': '+'});
            right.addEventListener('click', this.listeners.setEquipmentBasePotential);
            const mid = CY.element.simpleCreateHTML('input', ['Cyteria', 'input', 'between-button', 'base-potential']);
            mid.addEventListener('change', this.listeners.inputEquipmentBasePotential);
            mid.addEventListener('click', this.listeners.inputClickSelect);
            mid.type = 'number';

            set_base_pot.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small', 'light', 'title'], Icons('multiple-blank-circle') + `<span class="text">${Lang('Base Potential')}</span>`));
            set_base_pot.appendChild(left);
            set_base_pot.appendChild(mid);
            set_base_pot.appendChild(right);
            set_base_pot.appendChild(simpleCreateHTML('span', ['Cyteria', 'text', 'tips'], Lang('tips/Base Potential')));
        }

        const steps = simpleCreateHTML('div', 'steps');

        const create_step_btn = simpleCreateHTML('div', 'create-step');
        create_step_btn.appendChild(simpleCreateHTML('span', null, Icons('add-circle-outline')));
        create_step_btn.addEventListener('click', this.listeners.createStep);

        steps.appendChild(create_step_btn);

        const show_res_scope = simpleCreateHTML('div', ['show-result-scope', 'hidden']);
        const show_res = simpleCreateHTML('div', 'show-result');
        const show_res_top = simpleCreateHTML('div', 'top');
        const show_res_copy_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'right'], Icons('content-copy'));
        show_res_copy_btn.addEventListener('click', this.listeners.copyEnchantResult);
        show_res_top.appendChild(show_res_copy_btn);
        show_res.appendChild(show_res_top);
        show_res.appendChild(simpleCreateHTML('div', 'show-result-content'));
        show_res_scope.appendChild(show_res);

        const successRate = simpleCreateHTML('div', ['success-rate-scope', 'hidden']);
        successRate.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'], Icons('star-border') + `<span class="text">${Lang('Success Rate')}</span><span class="value success-rate"></span>`));

        r.appendChild(field_menu);
        r.appendChild(set_orig_pot);
        r.appendChild(set_base_pot);
        r.appendChild(steps);
        r.appendChild(show_res_scope);
        r.appendChild(successRate);

        return r;
    }
    createEnchantStepHTML(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const scope = simpleCreateHTML('div', this.scopeClassName['step']);

        const top = simpleCreateHTML('div', 'top');
        top.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'vertical-middle', 'space-right'], Icons('book') + '<span class="text title"></span>'));

        const delete_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('delete'));
        delete_btn.addEventListener('click', this.listeners.removeStep);

        const up_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('arrow-up'), {'data-ctr': '<'});
        const down_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('arrow-down'), {'data-ctr': '>'});
        up_btn.addEventListener('click', this.listeners.moveStep);
        down_btn.addEventListener('click', this.listeners.moveStep);

        top.appendChild(up_btn);
        top.appendChild(down_btn);
        top.appendChild(delete_btn);

        scope.appendChild(top);

        
        const step_type = simpleCreateHTML('div', 'step-type');
        const switch_type_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'switch-step-type'], Icons('switch'));
        switch_type_btn.addEventListener('click', this.listeners.switchStepType);

        step_type.appendChild(switch_type_btn);
        step_type.appendChild(simpleCreateHTML('span', ['Cyteria', 'text', 'after-icon-button', 'step-type-text']));

        const set_step_value = simpleCreateHTML('div', ['type-each-set-scope', 'hidden']);
        set_step_value.appendChild(simpleCreateHTML('span', ['text-pretext', 'text-small'], Lang('enchant per time: title')));
        const set_step_left =  simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('sub'), {'data-ctr': '-'});
        const set_step_right = simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('add'), {'data-ctr': '+'});
        set_step_left.addEventListener('click', this.listeners.setStepStepValue);
        set_step_right.addEventListener('click', this.listeners.setStepStepValue);

        set_step_value.appendChild(set_step_left);
        set_step_value.appendChild(simpleCreateHTML('span', ['Cyteria', 'text', 'between-button', 'step-value']), 1);
        set_step_value.appendChild(set_step_right);

        step_type.appendChild(set_step_value);

        scope.appendChild(step_type);

        const stats = simpleCreateHTML('div', 'step-stats');

        const create_stat_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'no-border', 'create-step'], Icons('add-circle-outline') + `<span class="text">${Lang('create enchant stat')}</span>`);
        create_stat_btn.addEventListener('click', this.listeners.openCreateStatWindow);
        stats.appendChild(create_stat_btn);

        scope.appendChild(stats);

        scope.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'line', 'show-step-potential'], Icons('creation') + '<span class="text step-potential"></span>'));

        return scope;
    }
    createEnchantStatHTML(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const scope = simpleCreateHTML('div', this.scopeClassName['stat']);

        const main = simpleCreateHTML('div', 'main');

        const left = simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('sub'), {'data-ctr': '-'});
        const right = simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('add'), {'data-ctr': '+'});
        left.addEventListener('click', this.listeners.setStatValue);
        right.addEventListener('click', this.listeners.setStatValue);

        const last = simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('arrow-last'), {'data-ctr': '>>'});
        last.addEventListener('click', this.listeners.setStatValue);

        const delete_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'right'], Icons('delete'));
        delete_btn.addEventListener('click', this.listeners.removeStat);

        main.appendChild(left);
        main.appendChild(simpleCreateHTML('span', ['Cyteria', 'text', 'between-button', 'show']));
        main.appendChild(right);
        main.appendChild(last);
        main.appendChild(delete_btn);

        scope.appendChild(main);

        const sub = simpleCreateHTML('div', 'sub');
        sub.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small'], Icons('label') + '<span class="text pre-stats-value"></span>'));
        sub.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small', 'space-left'], Icons('creation') + '<span class="text stat-potential"></span>'));
        sub.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small', 'space-left'], Icons('cube-outline') + '<span class="text stat-material-point-cost"></span>'));

        scope.appendChild(sub);

        return scope;
    }
}