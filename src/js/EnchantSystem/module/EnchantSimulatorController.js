import {EnchantEquipment, EnchantStep, InitEnchantElementStatus, EnchantElementStatus} from "./EnchantElement.js";
import CY from "../../main/module/cyteria.js";
import GetLang from "../../main/module/LanguageSystem.js";
import Icons from "../../main/module/SvgIcons.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";
import ShowMessage from "../../main/module/ShowMessage.js";
import SaveLoadSystem from "../../SaveLoadSystem/SaveLoadSystem.js";


function Lang(s, vs){
    return GetLang('Enchant Simulator/' + s, vs);
}

export default class EnchantSimulatorController {
    constructor(parent){
        this.parent = parent;
        this.equipments = [];
        this.nodes = {
            main: null,
            selectStat: null,
            equipmentsList: null,
            equipments: null
        };
        this.status = {
            currentEquipment: null,
            character: {
                levelLimit: 200,
                smithLevelLimit: 200
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
            setCharacterSmithLevel(){
                let v = EnchantElementStatus('Character/smithLevel');

                switch ( this.getAttribute('data-ctr') ){
                    case '+':
                        v = v + 10;
                        break;
                    case '-':
                        v = v - 10;
                        break;
                }
                if ( v > ctrr.status.character.smithLevelLimit || v < 0 )
                    return;
                v = EnchantElementStatus('Character/smithLevel', v);
                this.parentNode.querySelector('.character-smith-level').innerHTML = v;

                ctrr.updateCurrentEquipmentScope();
            },
            selectCurrentEquipment(e){
                const i = Array.from(this.parentNode.querySelectorAll('.select-equipment')).indexOf(this);
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
                        eq.setStatus('isOriginalElement', false);
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
            copyEquipment(){
                ctrr.copyEquipment(ctrr.currentEquipment());
            },
            removeEquipment(){
                const eq = ctrr.currentEquipment();
                const index = ctrr.equipments.indexOf(eq);

                const menu_btns = ctrr.nodes.equipmentsList.querySelectorAll('.select-equipment');
                CY.element.remove(menu_btns[index]);
                CY.element.remove(ctrr.nodes.equipments.querySelectorAll('.' + ctrr.scopeClassName['equipment'])[index]);

                ctrr.equipments.splice(index, 1);

                if ( menu_btns[index-1] )
                    menu_btns[index-1].click();
                else {
                    menu_btns[index+1].click();
                }
            },
            createStep(e){
                const eq = ctrr.currentEquipment();
                if ( !eq )
                    return;
                ctrr.createStep(eq);
                ctrr.updateCurrentEquipmentScope();
            },
            openCreateStatWindow(e){
                const eq = ctrr.currentEquipment();
                if ( !eq )
                    return;
                ctrr.status.currentStepScope = ctrr.getScopeFromChildNode(this, 'step');
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

                let success;
                switch ( this.getAttribute('data-ctr') ){
                    case '<':
                        success = eq.swapStep(si, si-1);
                        if ( success )
                            step_scope.parentNode.insertBefore(step_scope, step_scope_list[si-1]);
                        break;
                    case '>':
                        success = eq.swapStep(si, si+1);
                        if ( success )
                            step_scope.parentNode.insertBefore(step_scope_list[si+1], step_scope);
                        break;
                }
                if ( success )
                    ctrr.updateCurrentEquipmentScope();
            },
            removeStep(e){
                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                const step = ctrr.getEnchantStepByScope(step_scope);
                step.remove();
                CY.element.remove(step_scope);
                ctrr.updateCurrentEquipmentScope();
            },
            hiddenStep(e){
                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                const step = ctrr.getEnchantStepByScope(step_scope);
                this.classList.toggle('selected', step.hidden(!step.hidden()));
                ctrr.updateCurrentEquipmentScope();
            },
            insertStep(e){
                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                const step = ctrr.getEnchantStepByScope(step_scope);
                const steps_scope = step_scope.parentNode;

                const eq = step.belongEquipment();

                const step_scope_list = ctrr
                    .getScopeFromChildNode(step_scope, 'equipment')
                    .querySelectorAll('.' + ctrr.scopeClassName['step']);

                const new_step = eq.appendStepBefore(step);
                const new_step_scope = ctrr.createEnchantStepHTML(new_step);

                steps_scope.insertBefore(new_step_scope, step_scope);

                ctrr.updateCurrentEquipmentScope();
            },
            toggleStepExtraMenu(e){
                const step_scope = ctrr.getScopeFromChildNode(this, 'step');
                step_scope.querySelector('.extra-menu').classList.toggle('hidden');
                this.classList.toggle('selected');
            },
            removeStat(e){
                const stat_scope = ctrr.getScopeFromChildNode(this, 'stat');
                const stat = ctrr.getEnchantStatByScope(stat_scope);
                stat.remove();
                CY.element.remove(stat_scope);
                ctrr.updateCurrentEquipmentScope();
            },
            copyEnchantResult(e){
                const t = ctrr.createEnchantResult(ctrr.currentEquipment(), 'copy-text');
                if ( CY.copyToClipboard(t) )
                    ShowMessage(Lang('Warn/Success to copy'));
            },
            openMainMenu(e){
                ctrr.nodes.menu.classList.remove('hidden');
            },
            closeWindow(e){
                this.parentNode.parentNode.classList.add('hidden');
            }
        };
    }
    init(hnode){
        InitEnchantElementStatus();

        const ctrr = this;
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        this.nodes.main = hnode;
        //
        const top = simpleCreateHTML('div', ['Cyteria', 'Layout', 'sticky-header', 'top']);
        const top_content = simpleCreateHTML('div', 'content');

        const menu_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'menu-button', 'button'], Icons('cube-outline'));
        menu_btn.addEventListener('click', this.listeners.openMainMenu);
        top_content.appendChild(menu_btn);

        top.appendChild(top_content);
        hnode.appendChild(top);
        //
        const createCloseWindowButton = () => {
            const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button'], Icons('close'));
            btn.addEventListener('click', this.listeners.closeWindow);
            return btn;
        };
        const menu_scope = simpleCreateHTML('div', ['Cyteria', 'window', 'top-center', 'bg-mask', 'frozen-top', 'menu-scope', 'hidden', 'Cyteria', 'entrance', 'fade-in']);

        const menu_scope_top = simpleCreateHTML('div', 'top');
        menu_scope_top.appendChild(simpleCreateHTML('span', 'name', Lang('Main Menu: title')));
        menu_scope_top.appendChild(createCloseWindowButton());
        const menu_scope_content = simpleCreateHTML('div', 'content');

        menu_scope.appendChild(menu_scope_top);
        menu_scope.appendChild(menu_scope_content);

        hnode.appendChild(menu_scope);
        this.nodes.menu = menu_scope;

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
            set_clv.appendChild(simpleCreateHTML('span', ['Cyteria', 'text', 'tips'], Lang('tips/Character Level')));

            hnode.appendChild(set_clv);
        }

        const set_smithlv = simpleCreateHTML('div', ['Cyteria', 'set-button-line', 'set-character-smith-level']);
        {
            const left =  CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('sub'), {'data-ctr': '-'});
            left.addEventListener('click', this.listeners.setCharacterSmithLevel);
            const right = CY.element.simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only'], Icons('add'), {'data-ctr': '+'});
            right.addEventListener('click', this.listeners.setCharacterSmithLevel);
            const mid = CY.element.simpleCreateHTML('span', ['Cyteria', 'text', 'between-button', 'character-smith-level'], EnchantElementStatus('Character/smithLevel'));

            set_smithlv.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'title', 'text-small', 'light'], Icons('cards') + `<span class="text">${Lang('Character Smith Level')}</span>`));
            set_smithlv.appendChild(left);
            set_smithlv.appendChild(mid);
            set_smithlv.appendChild(right);
            set_smithlv.appendChild(simpleCreateHTML('span', ['Cyteria', 'text', 'tips'], Lang('tips/Smith Level')));

            hnode.appendChild(set_smithlv);
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
            const step_index = parseInt(ctrr.status.currentStepScope.getAttribute('data-i'), 10);
            const step = eq.step(step_index);

            ctrr.createEnchantStat(step, item, type);

            ctrr.updateCurrentEquipmentScope();

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

        this.SaveLoadSystem = new SaveLoadSystem().init({
            name: 'Enchant-Simulator',
            menuNode: menu_scope,
            csvFileName(){
                return 'state';
            },
            getSaveNameList(){
                return ctrr.equipments
                    .map(eq => eq.currentStats(eq.lastStepIndex())
                        .map(p => p.show())
                        .join('｜'));
            },
            getSaveCsvString(){
                return ctrr.saveToCsv();
            },
            loadCsvString(csv){
                return ctrr.loadFromCsv(csv);
            },
            afterActionFinish(){
                ctrr.nodes.menu.classList.add('hidden');
            },
            beforeLoadConfirm(){
                return ctrr.equipments.length != 0;
            },
            error(){
                ShowMessage(GetLang('global/LocalStorage is inavailable'));
            }
        });
        hnode.appendChild(this.SaveLoadSystem.controller.getSaveLoadWindow());

        document.querySelector('footer .auth-name').addEventListener('click', function(e){
            ctrr.status.character.levelLimit = 1000;
        });
    }
    getScopeFromChildNode(node, name){
        const cn = this.scopeClassName[name];
        while ( !node.classList.contains(cn) && node != document )
            node = node.parentNode;
        if ( node == document )
            console.error("Scope not found: " + name);
        return node;
    }
    currentEquipment(t){
        if ( t !== void 0 )
            this.status.currentEquipment = t;
        return this.status.currentEquipment;
    }
    createEnchantResult(eq, type){
        const frg = document.createDocumentFragment();

        const line_split = {
            'normal': '<br />',
            'copy-text':'\n'
        }[type];

        let res = '';

        res += '｜' + Lang('Equipment Field List')[eq.status.fieldType == 0 ? (eq.status.isOriginalElement ? 1 : 0) : 2]
            + '｜' + Lang('Original Potential') + " " + eq.originalPotential()
            + (eq.basePotential() != EnchantElementStatus('EquipmentBasePotentialMiniMum') ? ('｜' + Lang('Base Potential') + " " + eq.basePotential()) : '')

        res += line_split;

        res += '｜' + Lang('Final Results') + '｜' + eq.currentStats(eq.lastStepIndex()).map(p => p.show()).join('｜');

        res += '<p>';

        const all_mcost = eq.getAllMaterialPointCost();
        const mats_text = Lang('Material Point Type List').filter((a, i) => all_mcost[i] != 0);
        res += '｜' + Lang('Material Point Cost') + '｜'
            + all_mcost
                .filter(a => a != 0)
                .map((a, i) => `${mats_text[i]} ${a}`)
                .join('｜');

        res += '</p><p>';

        const enchant_text = Lang('enchant line pretext');

        res += eq.currentSteps(eq.lastStepIndex())
            .filter(p => p.stepStats.length != 0)
            .map((p, i) => {
                return (i + 1).toString() + '. '
                    + (p.type == EnchantStep.TYPE_NORMAL
                        ? enchant_text + p.stepStats.map(a => a.showCurrentText()).join('｜')
                        : Lang('enchant line: each', [p.stepStats[0].show(p.stepValue()), p.stepStats[0].showCurrentText()])
                    )
                    + '｜' + p.stepRemainingPotential() + 'pt';
            })
            .join(line_split);
        
        res += '</p>';

        if ( type == 'normal'){
            const div = CY.element.simpleCreateHTML('div', null, res);
            return div;
        }
        else if ( type == 'copy-text' ){
            res = res
                .replace(/<\/p><p>/g, '\n\n')
                .replace(/<p>/g, '\n\n')
                .replace(/<\/p>/g, '');
            const sr = eq.successRate();
            res += '\n\n成功率：' + (sr != -1
                ? Math.floor(sr) + '%｜實際' + (Math.floor(sr) + 30).toString() + '%'
                : Lang('unlimited')
            ) + '\n\n｜布偶的魔法書｜';
            return res;
        }
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

        const fieldTypeStr = (eq.status.fieldType == 0 ? 'main-weapon' : 'body-armor')
            + (eq.status.isOriginalElement ? '|original-element' : '');
        const menu_scope = scope.querySelector('ul.field-menu');
        menu_scope.querySelector('.cur').classList.remove('cur');
        menu_scope.querySelector(`li[data-set="${fieldTypeStr}"]`).classList.add('cur');

        scope.querySelectorAll('.steps > .' + this.scopeClassName['step']).forEach((p, i) => {
            this.updateEnchantStepScope(p, eq.step(i));
        });

        scope.querySelector('.original-potential').value = eq.originalPotential();
        scope.querySelector('.base-potential').value = eq.basePotential();

        if ( !eq.checkStepsPotentialCost() )
            ShowMessage(Lang('Warn/Potential of Step is less than 1'), null, 'pt of step less than 1');

        {
            const sr = eq.successRate();
            const sr_scope = scope.querySelector('.success-rate-scope');
            const res_scope = scope.querySelector('.show-result-scope');
            sr_scope.querySelector('.success-rate').innerHTML =
                sr != -1
                ? Math.floor(sr) + '%｜實際' + (Math.floor(sr) + 30).toString() + '%'
                : Lang('unlimited');
            const res = res_scope.querySelector('.show-result-content');
            CY.element.removeAllChild(res);
            if ( eq.currentStats(eq.lastStepIndex()).length > 0 ){
                res.appendChild(this.createEnchantResult(eq, 'normal'));
                res.classList.remove('hidden');
            }
            else
                res.classList.add('hidden');
        }

        if ( tmp_hid )
            scope.classList.remove('hidden');
    }
    updateEnchantStepScope(scope, step){
        const step_index = step.index();
        scope.setAttribute('data-i', step_index);

        const tn = step.type == EnchantStep.TYPE_NORMAL ? 0 : 1;
        scope.querySelector('.switch-step-type').setAttribute('data-step-type', tn);
        scope.querySelector('.type-each-set-scope').classList.toggle('hidden', tn == 0);
        scope.querySelector('.step-type-text').innerHTML = Lang('step type')[tn];

        scope.querySelector('.step-value').innerHTML = step.stepValue();

        const is_last = step.isLastStep(), after_last = step.afterLastStep();

        let title = Lang('step title') + " " + (step_index + 1);
        if ( is_last )
            title = Lang('step title: finale');
        else if ( after_last )
            title = Lang('step title: invalid');
        scope.querySelector('.top .title').innerHTML = title;
        scope.querySelectorAll('.step-stats > .' + this.scopeClassName['stat']).forEach((p, i, ary) => {
            this.updateEnchantStatScope(p, step.stepStats[i]);
        });

        const eq = step.belongEquipment();

        scope.querySelector('.step-potential').innerHTML = step.stepRemainingPotential();
        scope.classList.toggle('last-step', is_last);
        scope.classList.toggle('after-last-step', after_last);

        scope.classList.toggle('is-hidden', step.hidden());
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
    createEquipment(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const eq = new EnchantEquipment();
        this.equipments.push(eq);

        const el = this.nodes.equipmentsList;
        const btn = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'select-equipment'], Lang('equipment') + " " + this.equipments.length);
        btn.addEventListener('click', this.listeners.selectCurrentEquipment);
        el.insertBefore(btn, el.querySelector('.create-equipment'));

        const eq_scope = this.createEquipmentHTML();

        this.nodes.equipments.appendChild(eq_scope);

        this.updateEquipmentScope(eq_scope, eq);

        btn.click();

        return [eq, eq_scope];
    }
    copyEquipment(eq){
        const [new_eq, new_eq_scope] = this.createEquipment();

        new_eq.originalPotential(eq.originalPotential());
        new_eq.basePotential(eq.basePotential());

        eq._steps.forEach(step => {
            const [new_step, new_step_scope] = this.createStep(new_eq);
            new_step.setType(step.type);
            new_step.hidden(step.hidden());
            this.status.currentStepScope = new_step_scope;
            step.stepStats.forEach(stat => {
                this.createEnchantStat(new_step, stat.itemBase, stat.statType(), stat.statValue());
            });
        });

        this.updateCurrentEquipmentScope();

        const eq_name = t => Lang('equipment') + (this.equipments.indexOf(t) + 1).toString();
        ShowMessage(Lang('copy equipment success', [eq_name(eq), eq_name(new_eq)]), 'done', 'copy equipment success');
    }
    createEquipmentHTML(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const r = simpleCreateHTML('div', [this.scopeClassName['equipment'], 'hidden']);

        const top_menu = simpleCreateHTML('div', 'top-menu');

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

        top_menu.appendChild(field_menu);

        const copy_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'no-border'], Icons('content-copy') + `<span class="text">${Lang('copy equipment')}</span>`);
        copy_btn.addEventListener('click', this.listeners.copyEquipment);
        top_menu.appendChild(copy_btn);

        const remove_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'no-border'], Icons('delete') + `<span class="text">${Lang('remove equipment')}</span>`);
        remove_btn.addEventListener('click', this.listeners.removeEquipment);
        top_menu.appendChild(remove_btn);

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

        const show_res_scope = simpleCreateHTML('div', 'show-result-scope');
        const show_res = simpleCreateHTML('div', 'show-result');
        const show_res_top = simpleCreateHTML('div', 'top');
        const show_res_copy_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'right'], Icons('content-copy'));
        show_res_copy_btn.addEventListener('click', this.listeners.copyEnchantResult);
        show_res_top.appendChild(show_res_copy_btn);
        show_res.appendChild(show_res_top);
        show_res.appendChild(simpleCreateHTML('div', 'show-result-content'));
        show_res_scope.appendChild(show_res);

        const successRate = simpleCreateHTML('div', 'success-rate-scope');
        successRate.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'], Icons('star-border') + `<span class="text">${Lang('Success Rate')}</span><span class="value success-rate"></span>`));

        r.appendChild(top_menu);
        r.appendChild(set_orig_pot);
        r.appendChild(set_base_pot);
        r.appendChild(steps);
        r.appendChild(show_res_scope);
        r.appendChild(successRate);

        return r;
    }
    createStep(eq){
        // if ( !t.checkStatsNumber() ){
        //     ShowMessage(Lang('Warn/Number of Equipment Item exceeding the maximum'));
        //     return;
        // }
        // if ( !t.checkCurrentPotential() ){
        //     ShowMessage(Lang('Warn/Potential of Equipment has been less than 1'))
        //     return;
        // }
        const eq_scope = this.nodes.equipments.querySelector('.enchant-equipment:not(.hidden)');
        const step = eq.appendStep();
        const steps_scope = eq_scope.querySelector('.steps');
        const step_scope = this.createEnchantStepHTML(step);

        steps_scope.insertBefore(step_scope, steps_scope.querySelector('.create-step'));

        return [step, step_scope];
    }
    createEnchantStepHTML(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const scope = simpleCreateHTML('div', this.scopeClassName['step']);

        const top = simpleCreateHTML('div', 'top');
        top.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'vertical-middle', 'space-right'], Icons('book') + '<span class="text title"></span>'));

        const delete_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('delete'));
        delete_btn.addEventListener('click', this.listeners.removeStep);

        const hidden_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('block'));
        hidden_btn.addEventListener('click', this.listeners.hiddenStep);

        const toggle_extra_menu_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('menu'));
        toggle_extra_menu_btn.addEventListener('click', this.listeners.toggleStepExtraMenu);

        top.appendChild(hidden_btn);
        top.appendChild(delete_btn);
        top.appendChild(toggle_extra_menu_btn);

        scope.appendChild(top);

        const extra_menu = simpleCreateHTML('div', ['extra-menu', 'hidden']);
        
        const up_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('arrow-up'), {'data-ctr': '<'});
        up_btn.addEventListener('click', this.listeners.moveStep);
        const down_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('arrow-down'), {'data-ctr': '>'});
        down_btn.addEventListener('click', this.listeners.moveStep);

        const insert_up_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('table-row-insert-before'));
        insert_up_btn.addEventListener('click', this.listeners.insertStep);
        
        extra_menu.appendChild(up_btn);
        extra_menu.appendChild(down_btn);
        extra_menu.appendChild(insert_up_btn);

        scope.appendChild(extra_menu);

        
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

        const create_stat_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'no-border', 'create-stat'], Icons('add-circle-outline') + `<span class="text">${Lang('create enchant stat')}</span>`);
        create_stat_btn.addEventListener('click', this.listeners.openCreateStatWindow);
        stats.appendChild(create_stat_btn);

        scope.appendChild(stats);

        scope.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'line', 'show-step-potential'], Icons('creation') + '<span class="text step-potential"></span>'));

        return scope;
    }
    createEnchantStat(step, item, type, value){
        if ( step.stat(item, type) ){
            ShowMessage(Lang('Warn/Step Stat Repeat'));
            return;
        }

        const eq = step.belongEquipment();

        const [max, min] = item.getLimit(type);
        const pot = item.getPotential(type, eq.status);

        let new_value = 0;
        const estat = step.appendStat(item, type, new_value);

        value = value !== void 0 ? value : (pot > item.basePotential(type) ? (min - Math.min(estat.getPreviousStepStatValue(), 0)) : 0);
        estat.statValue(value);

        if ( !estat ){
            ShowMessage(Lang('Warn/Number of Equipment Item exceeding the maximum'));
            return;
        }

        const node = this.createEnchantStatHTML(estat);
        const stats_scope = this.status.currentStepScope.querySelector('.step-stats');
        stats_scope.insertBefore(node, stats_scope.querySelector('.create-stat'));

        return [estat, node];
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
    saveToCsv(){
        const {type, index} = this.getSaveLoadSetting();
        const data = [];

        const createColumn = l => {
            const t = l ? new Array(l) : [];
            data.push(t);
            return t;
        };

        const stepTypeToInt = t => t == EnchantStep.TYPE_NORMAL ? 0 : 1;
        const statTypeToInt = t => t == StatBase.TYPE_CONSTANT ? 0 : 1;
        const boolToInt = b => b ? 1 : 0;

        const ctrdata = createColumn(2);
        ctrdata[index['controller']['characterLevel']] = EnchantElementStatus('Character/level');
        ctrdata[index['controller']['characterSmithLevel']] = EnchantElementStatus('Character/smithLevel');

        this.equipments.forEach(eq => {
            const p = createColumn(3);
            p[index['type']] = type['equipment'];
            p[index['equipment']['fieldType']] = eq.status.fieldType;
            p[index['equipment']['isOriginalElement']] = boolToInt(eq.status.isOriginalElement);
            p[index['equipment']['originalPotential']] = eq.originalPotential();
            p[index['equipment']['basePotential']] = eq.basePotential();
            eq._steps.forEach(step => {
                const p1 = createColumn(2);
                p1[index['type']] = type['step'];
                p1[index['step']['type']] = stepTypeToInt(step.type);
                p1[index['step']['hidden']] = boolToInt(step.hidden());
                step.stepStats.forEach(stat => {
                    const p2 = createColumn(2);
                    p2[index['type']] = type['stat'];
                    p2[index['stat']['baseName']] = stat.baseName();
                    p2[index['stat']['type']] = statTypeToInt(stat.statType());
                    p2[index['stat']['value']] = stat.statValue();
                });
            });
        });

        return Papa.unparse(data);
    }
    loadFromCsv(csv_string){
        const {type, index} = this.getSaveLoadSetting();

        const intStrToBool = t => t == '1' ? true : false;
        const intStrToStepType = t => t == '0' ? EnchantStep.TYPE_NORMAL : EnchantStep.TYPE_EACH;
        const intStrToStatType = t => t == '0' ? StatBase.TYPE_CONSTANT : StatBase.TYPE_MULTIPLIER;

        const findItemBaseByBaseName = bn => {
            let res;
            this.parent.categorys.find(ct => {
                res = ct.items.find(item => item.statBase.baseName == bn);
                return res;
            });
            return res;
        };

        this.nodes.equipmentsList.querySelectorAll('.select-equipment')
            .forEach(el => CY.element.remove(el));
        CY.element.removeAllChild(this.nodes.equipments);
        this.equipments = [];

        try {
            let cur_eq = null,
                cur_step = null,
                cur_step_scope = null;
            Papa.parse(csv_string).data.forEach((p, i) => {
                if ( i == 0 ){
                    const t = index['controller'];
                    const clv = parseInt(p[t['characterLevel']], 10),
                        cslv = parseInt(p[t['characterSmithLevel']], 10);
                    EnchantElementStatus('Character/level', clv);
                    EnchantElementStatus('Character/smithLevel', cslv);

                    this.nodes.main.querySelector('.character-level').innerHTML = clv;
                    this.nodes.main.querySelector('.character-smith-level').innerHTML = cslv;
                    return;
                }
                const line_type_no = parseInt(p[index['type']], 10);
                const line_type = Object.keys(type).find(a => type[a] == line_type_no);
                const ti = index[line_type];
                if ( line_type == 'equipment' ){
                    const [eq, eq_scope] = this.createEquipment();
                    cur_eq = eq;
                    eq.setStatus('fieldType', parseInt(p[ti['fieldType']], 10));
                    eq.setStatus('isOriginalElement', intStrToBool(p[ti['isOriginalElement']]));
                    eq.originalPotential(parseInt(p[ti['originalPotential']], 10));
                    eq.basePotential(parseInt(p[ti['basePotential']], 10));
                }
                else if ( line_type == 'step' ){
                    const [step, step_scope] = this.createStep(cur_eq);
                    cur_step = step;
                    cur_step_scope = step_scope;
                    step.setType(intStrToStepType(p[ti['type']]));
                    step.hidden(intStrToBool(p[ti['hidden']]));
                }
                else if ( line_type == 'stat' ){
                    this.status.currentStepScope = cur_step_scope;
                    this.createEnchantStat(
                        cur_step,
                        findItemBaseByBaseName(p[ti['baseName']]),
                        intStrToStatType(p[ti['type']]),
                        parseInt(p[ti['value']], 10)
                    );
                }
            });
        }
        catch(e){
            ShowMessage(GetLang('Save Load System/Warn/An error occurred while loading data'));
            console.log(e);
        }

        const eq_scopes = this.nodes.equipments.querySelectorAll('.' + this.scopeClassName['equipment']);
        eq_scopes.forEach((scope, i) => this.updateEquipmentScope(scope, this.equipments[i]));
    }
    getSaveLoadSetting(){
        const type = {
            'equipment': 0,
            'step': 1,
            'stat': 2
        };
        const index = {
            'type': 0,
            'controller': {
                'characterLevel': 0,
                'characterSmithLevel': 1
            },
            'equipment': {
                'fieldType': 1,
                'isOriginalElement': 2,
                'originalPotential': 3,
                'basePotential': 4
            },
            'step': {
                'type': 1,
                'hidden': 2
            },
            'stat': {
                'baseName': 1,
                'type': 2,
                'value': 3
            }
        };

        return {type, index};
    }
}