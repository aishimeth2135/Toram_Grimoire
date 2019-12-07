import {Calculation, CalcItemContainer} from "./CalcElements.js";
import CY from "../../../main/module/cyteria.js";
import GetLang from "../../../main/module/LanguageSystem.js";
import Icons from "../../../main/module/SvgIcons.js";
import ShowMessage from "../../../main/module/ShowMessage.js";

function Lang(s){
    return GetLang('Damage Calculation/' + s);
}


export default class DamageCalculationController {
    constructor(parent){
        this.parent = parent;
        this.calculations = [];
        this.status = {
            currentCalculation: null,
            comparativeDamage: 1
        };

        this.nodes = {
            menu: null,
            save_load: null,
            main: null,
            calculationSelect: null,
            calculations: null,
            showContainerTips: null,
            spanForAdjustWidth: null
        };

        this.scopeClassName = {
            'calculation': 'calculation',
            'container': 'item-container',
            'calc-item': 'calc-item'
        };

        const ctrr = this;
        this.listeners = {
            inputClickSelect(e){
                this.select();
            },
            stopBubble(e){
                e.stopPropagation();
            },
            openMainMenu(e){
                ctrr.nodes.menu.classList.remove('hidden');
            },
            closeWindow(e){
                this.parentNode.parentNode.classList.add('hidden');
            },
            saveloadCsvFile(e){
                const ctr = this.getAttribute('data-ctr');
                switch (ctr){
                    case 'save_csv': {
                        const str = ctrr.saveToCsv();
                        if ( !str )
                            return;
                        CY.csv.saveFile(str, ctrr.calculations[0].calculationName());
                        ctrr.nodes.menu.classList.add('hidden');
                        break;
                    }
                    case 'load_csv':
                        CY.csv.loadFile(res => {
                            ctrr.loadFromCsv(res);
                            ctrr.nodes.menu.classList.add('hidden');
                        },
                        () => ShowMessage(Lang('Save Load/Warn/Wrong file type: csv')));
                        break;
                }
            },
            saveToUrl(e){
                const str = ctrr.saveToCsv().replace(/\r\n/g, '|n|');
                const url = new URL(document.location);
                CY.copyToClipboard(url.origin + url.pathname + '?calculation_data=' + str);
                ShowMessage(Lang('Save Load/Warn/Copy to clipboard successed'));
            },
            openContainerTips(e){
                const scope = ctrr.nodes.showContainerTips;
                const ctner = ctrr.getItemContainerFromScope(ctrr.getScopeFromChildNode(this, 'container'));
                scope.querySelector('.top > .name').innerHTML = ctner.containerTitle();

                const text = Lang('Container Tips/' + ctner.containerId());
                const c = scope.querySelector('.content');
                CY.element.removeAllChild(c);

                const simpleCreateHTML = CY.element.simpleCreateHTML;

                const p = s => s.replace(/\(\(([^\)]+)\)\)/g, (m, m1) => `<span class="separate-text light">${m1}</span>`);

                if ( Array.isArray(text) ){
                    c.appendChild(simpleCreateHTML('div', 'text-scope', p(text[0])));
                    const ul = simpleCreateHTML('ul', ['Cyteria', 'ul', 'simple']);
                    text.slice(1).forEach(t => ul.appendChild(simpleCreateHTML('li', null, p(t))));
                    c.appendChild(ul);
                    // const frg = document.createDocumentFragment();
                    // text.forEach(t => frg.appendChild(simpleCreateHTML('div', 'text-scope', p(t))));
                    // c.appendChild(frg);
                }
                else
                    c.appendChild(simpleCreateHTML('div', 'text-scope', p(text)));

                scope.classList.remove('hidden');
            },
            openSaveLoadWindow(e){
                if ( !CY.storageAvailable('localStorage') ){
                    ShowMessage(GetLang('global/LocalStorage is inavailable'));
                    return;
                }
                ctrr.updateSaveLoadScope();
                const scope = ctrr.nodes.save_load;
                scope.classList.remove('hidden');
                scope.setAttribute('data-ctr', this.getAttribute('data-ctr'));
            },
            clickSaveLoadCalculations(e){
                const scope = ctrr.nodes.save_load;
                const ctr = scope.getAttribute('data-ctr');
                const stg = window.localStorage;

                const pretext = 'Damage-Calculation-' + this.getAttribute('data-i') + '-';

                const stg_name_names = pretext + 'names';
                const stg_name_data = pretext + 'data';

                const no_data = this.getAttribute('data-status') == 'no-data';
                switch (ctr){
                    case 'save': {
                        if ( !no_data && this.getAttribute('data-status') != 'confirm' ){
                            const cur = this.parentNode.querySelector('.scope[data-status="confirm"]');
                            if ( cur )
                                cur.setAttribute('data-status', '');
                            this.setAttribute('data-status', 'confirm');
                            const cfm = this.parentNode.querySelector('.save-confirm-tips');
                            cfm.classList.remove('hidden');
                            this.parentNode.insertBefore(cfm, this.nextSibling);
                            return;
                        }
                        const str = ctrr.saveToCsv();
                        if ( !str )
                            return;
                        stg.setItem(stg_name_names, ctrr.calculations.map(a => a.calculationName()).join(',,'));
                        stg.setItem(stg_name_data, str);
                        break;
                    }
                    case 'load':
                        if ( no_data )
                            return;
                        if ( this.getAttribute('data-status') != 'confirm' && ctrr.calculations.length != 0 ){
                            const cur = this.parentNode.querySelector('.scope[data-status="confirm"]');
                            if ( cur )
                                cur.setAttribute('data-status', '');
                            this.setAttribute('data-status', 'confirm');
                            const cfm = this.parentNode.querySelector('.load-confirm-tips');
                            cfm.classList.remove('hidden');
                            this.parentNode.insertBefore(cfm, this.nextSibling);
                            return;
                        }
                        ctrr.loadFromCsv(stg.getItem(stg_name_data));
                        break;
                }
                ctrr.nodes.menu.classList.add('hidden');
                scope.classList.add('hidden');
            },
            setComparativeDamage(e){
                const t = ctrr.currentCalculation();
                const res = t ? Math.floor(t.calcResult()) : 0;
                ctrr.status.comparativeDamage = res;
                ctrr.showResult();
            },
            deleteCalculation(e){
                const cal_scope = ctrr.getScopeFromChildNode(this, 'calculation');
                const cal_btn = ctrr.getCalculationSelectButton(cal_scope);
                const pre_btn = cal_btn.previousSibling;
                CY.element.remove(cal_btn);
                CY.element.remove(cal_scope);
                const i = ctrr.calculations.indexOf(ctrr.getCalculationFromScope(cal_scope));
                ctrr.calculations.splice(i, 1);
                if ( pre_btn )
                    btn.click();
            },
            copyCalculation(e){
                const cal_scope = ctrr.getScopeFromChildNode(this, 'calculation');
                const cal = ctrr.getCalculationFromScope(cal_scope);

                const new_cal = ctrr.createCalculation().copyFrom(cal);
                ctrr.currentCalculation(new_cal);
                const new_cal_scope = ctrr.createCalculationHTML(new_cal);
                ctrr.nodes.calculations.appendChild(new_cal_scope);
                ctrr.updateCalculationScope(new_cal, new_cal_scope);
                ctrr.getCalculationSelectButton(new_cal_scope).click();
            },
            createCalculation(e){
                const cal = ctrr.createCalculation();
                ctrr.currentCalculation(cal);
                const cal_scope = ctrr.createCalculationHTML(cal);
                ctrr.nodes.calculations.appendChild(cal_scope);
                ctrr.updateCalculationScope(cal, cal_scope);
                ctrr.getCalculationSelectButton(cal_scope).click();
            },
            calculationUserSet(e){
                const t = this.parentNode.getAttribute('data-target');
                let v = parseInt(this.value, 10);
                switch (t){
                    case 'str':
                    case 'dex':
                    case 'agi':
                    case 'int':
                    case 'vit':
                        v = CY.number.between(v, 0, 999);
                        break;
                }
                ctrr.currentCalculation().userSet(t, v);
                this.value = v;

                ctrr.showResult();
            },
            setCalculationName(e){
                const cal = ctrr.currentCalculation();
                let v = this.value;
                const MAX_LENGTH = 16;
                if ( v.includes(',,') ){
                    ShowMessage(Lang('Warn/Disable char'));
                    v = v.replace(new RegExp(',,', 'g'), '');
                }
                if ( v.length > MAX_LENGTH ){
                    ShowMessage(Lang('Warn/Calculation Name too long'))
                    v = v.slice(0, MAX_LENGTH);
                }
                const n = cal.calculationName(v);
                this.value = n;
                ctrr.getCalculationSelectButton(ctrr.getScopeFromChildNode(this, 'calculation')).querySelector('.text').innerHTML = n;
            },
            calculationSelect(e){
                const cur = this.parentNode.querySelector('.cur');
                if ( cur ){
                    cur.classList.remove('cur');
                    ctrr.getCalculationScope(cur).classList.add('hidden');
                }

                this.classList.add('cur');
                const cal_scope = ctrr.getCalculationScope(this);
                cal_scope.classList.remove('hidden');
                ctrr.currentCalculation(ctrr.getCalculationFromScope(cal_scope));

                ctrr.showResult();
            },
            containerToggle(e){
                const scope = ctrr.getScopeFromChildNode(this, 'container');
                const ctner = ctrr.getItemContainerFromScope(scope);
                ctner.toggle();

                if ( ctner.beLinked() && ctner.getLink().toggleContainer ){
                    ctner.notifyLinkedContainers(CalcItemContainer.NOTIFY_LINKED_TYPE_CONTAINER_TOGGLE);
                    ctrr.updateCalculationScope(ctner.belongCalculation());
                }
                else
                    scope.classList.toggle('invalid');

                ctrr.showResult();
            },
            setCalcItemValue(e){
                const item_scope = ctrr.getScopeFromChildNode(this, 'calc-item');
                const item = ctrr.getCalcItemFromScope(item_scope);
                const v = item.value(parseInt(this.value, 10));
                this.value = v;

                ctrr.showResult();
            },
            calcItemToggle(e){
                const item_scope = ctrr.getScopeFromChildNode(this, 'calc-item');
                const item = ctrr.getCalcItemFromScope(item_scope);
                item.toggle();

                this.classList.toggle('invalid');

                ctrr.showResult();
            },
            calcItemSelect(e){
                const item_scope = ctrr.getScopeFromChildNode(this, 'calc-item');
                const item = ctrr.getCalcItemFromScope(item_scope);
                const ctner = item.belongContainer();
                const cal = ctner.belongCalculation();
                ctner.currentItem(item);

                if ( ctner.beLinked() ){
                    ctner.notifyLinkedContainers(CalcItemContainer.NOTIFY_LINKED_TYPE_ITEM_SELECT);
                    ctrr.updateCalculationScope(cal);
                }
                else {
                    const cur = item_scope.parentNode.querySelector('.' + ctrr.scopeClassName['calc-item'] + ':not(.invalid)');
                    if ( cur )
                        cur.classList.add('invalid');
                    item_scope.classList.remove('invalid');
                }

                ctrr.showResult();

                e.stopPropagation();
            },
            adjustInputWidth(e){
                ctrr.adjustInputWidth(this);
            }
        };

        this.functions = {
            calculation: {
                originalValue: function(){
                    const v = this.value();
                    switch (this.category){
                        case CalcItemContainer.CATEGORY_CONSTANT:
                            return v;
                        case CalcItemContainer.CATEGORY_MULTIPLIER:
                            return v/100;
                    }
                },
                negativeValue: function(){
                    const v = -1*this.value();
                    switch (this.category){
                        case CalcItemContainer.CATEGORY_CONSTANT:
                            return v;
                        case CalcItemContainer.CATEGORY_MULTIPLIER:
                            return (100 + v)/100;
                    }
                },
                atkCalc: function(){
                    let v = this.value();
                    const cal = this.belongCalculation();
                    if ( cal.findItem('atk') == this.currentItem() ){
                        const two_handed_lv = cal.findItem('two_handed_skill_level');
                        if ( two_handed_lv.isValid() )
                            v = Math.floor(v * (100 + 5*two_handed_lv.value()) / 100);
                        const sub_atk = cal.findItem('sub_atk');
                        if ( sub_atk.isValid() ){
                            const a = sub_atk.value(),
                                b = cal.findItem('sub_atk_multiplier').value();
                            v += Math.floor(a*b/100);
                        }
                    }
                    // character level difference
                    const lv = cal.findContainerById('level_difference');
                    const lvDif = lv.getItem('character_level').value() - lv.getItem('target_level').value();
                    v += lvDif;

                    const tar_rst = cal.findContainerById('target_resistance').value();
                    v *= (100 - tar_rst) / 100;

                    return v;
                },
                otherConstant: function(){
                    return this.item().reduce((a, b) => a + b.value(), 0);
                },
                otherMultiplier: function(){
                    return this.item().reduce((a, b) => a * b.value() / 100, 1);
                },
                defenseCalc: function(){
                    const v = this.calculatedValue();
                    const p = this.belongCalculation().findContainer('physical_pierce').value();
                    return Math.floor(v * (p - 100) / 100);
                },
                skillConstantValue: function(){
                    let v = this.getItem('skill_constant').value();
                    ['str', 'dex', 'int', 'agi', 'vit'].forEach(p => {
                        v += this.getItem('skill_constant_' + p).value() * this.belongCalculation().userSet(p) / 100;
                    });
                    return Math.floor(v);
                },
                skillMultiplierValue: function(){
                    let v = this.getItem('skill_multiplier').value();
                    ['str', 'dex', 'int', 'agi', 'vit'].forEach(p => {
                        v += this.getItem('skill_multiplier_' + p).value() * this.belongCalculation().userSet(p) / 100;
                    });
                    return Math.floor(v)/100;
                },
                criticalExpectedValue: function(){
                    const rate = this.getItem('critical_rate');
                    const dmg = this.getItem('critical_damage');

                    let dr = dmg.value(), r = rate.value();
                    if ( !this.belongCalculation().findItem('physical_damage').isValid() ){
                        const cr = this.belongCalculation().findItem('magic_critical_conversion_rate').value();
                        r = r * cr / 100;
                        dr = 100 + (dr - 100) * cr / 100;
                    }

                    return rate.isValid() ? ((100 * (100 - r)) + dr * r) / 10000 : dr/100;
                },
                stabilityExpectedValue: function(){
                    const graze = this.getItem('probability_of_graze');
                    const stab = this.getItem('stability');

                    const a = graze.value();
                    const b = stab.value();

                    const v = graze.isValid() ? (a*b/2 + (100-a)*b) / 100 : b;
                    return (v + 100)/200;
                }
            }
        };
    }
    init(node){
        node.classList.add('CalculationSystem-Damage');

        const simpleCreateHTML = CY.element.simpleCreateHTML;

        //
        const top = simpleCreateHTML('div', ['Cyteria', 'Layout', 'sticky-header', 'top']);
        const top_content = simpleCreateHTML('div', 'content');

        const calculationSelect = simpleCreateHTML('ul', 'calculation-select');
        const create_cal_btn = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'no-border', 'create-calclulation'], Icons('add-circle-outline') + '<span class="text">' + Lang('create calculation') + '</span>');
        create_cal_btn.addEventListener('click', this.listeners.createCalculation);
        calculationSelect.appendChild(create_cal_btn);
        top_content.appendChild(calculationSelect);

        const menu_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'menu-button'], Icons('cube-outline'));
        menu_btn.addEventListener('click', this.listeners.openMainMenu);
        top_content.appendChild(menu_btn);

        top.appendChild(top_content);
        node.appendChild(top);

        //
        const calculations = simpleCreateHTML('div', 'calculations');
        node.appendChild(calculations);

        //
        const detail = document.createDocumentFragment();
        
        const result = simpleCreateHTML('div', ['damage', 'result-scope', 'frozen']);

        const damage_result_scope = simpleCreateHTML('div', 'scope');
        damage_result_scope.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'],
            `${Icons('sword')}<span class="text">${Lang('Damage')}</span><span class="value damage-result">0</span>`));
        result.appendChild(damage_result_scope);

        const cmp_dmg_scope = simpleCreateHTML('div', 'scope');
        cmp_dmg_scope.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'],
            `${Icons('sword')}<span class="text">${Lang('Comparative Damage')}</span><span class="value comparative-damage">0</span>`));

        const update_cmp_dmg = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'single-line'], Icons('switch'));
        update_cmp_dmg.addEventListener('click', this.listeners.setComparativeDamage);
        cmp_dmg_scope.appendChild(update_cmp_dmg);

        result.appendChild(cmp_dmg_scope);

        const cmp_res_scope = simpleCreateHTML('div', 'scope');
        cmp_res_scope.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'comparative-result-icon'], Icons('arrow-up')));
        cmp_res_scope.appendChild(simpleCreateHTML('span', 'comparative-result', 0));
        result.appendChild(cmp_res_scope);

        const result_2 = simpleCreateHTML('div', 'result-scope');

        // Damage Floating
        const df_crt_scope = simpleCreateHTML('div', 'scope');
        df_crt_scope.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'], Icons('sword') + '<span class="text">' + Lang('Damage Floating: critical') + '</span>'));
        df_crt_scope.appendChild(simpleCreateHTML('span', ['damage-floating-critical', 'vertical-middle', 'space-left', 'light'], '1~1'));
        result_2.appendChild(df_crt_scope);

        const df_ncrt_scope = simpleCreateHTML('div', 'scope');
        df_ncrt_scope.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'], Icons('sword') + '<span class="text">' + Lang('Damage Floating: without critical') + '</span>'));
        df_ncrt_scope.appendChild(simpleCreateHTML('span', ['damage-floating-without-critical', 'vertical-middle', 'space-left', 'light-2'], '1~1'));
        result_2.appendChild(df_ncrt_scope);

        detail.appendChild(result);
        detail.appendChild(result_2);

        node.appendChild(detail);

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

        const save_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('save') + '<span class="text">' + Lang('save') + '</span>', {'data-ctr': 'save'});
        save_btn.addEventListener('click', this.listeners.openSaveLoadWindow);
        const load_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('book-page') + '<span class="text">' + Lang('load') + '</span>', {'data-ctr': 'load'});
        load_btn.addEventListener('click', this.listeners.openSaveLoadWindow);
        const save_to_csv_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('csv-file') + '<span class="text">' + Lang('save to csv') + '</span>', {'data-ctr': 'save_csv'});
        save_to_csv_btn.addEventListener('click', this.listeners.saveloadCsvFile);
        const load_from_csv_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('file-import') + '<span class="text">' + Lang('load from csv') + '</span>', {'data-ctr': 'load_csv'});
        load_from_csv_btn.addEventListener('click', this.listeners.saveloadCsvFile);
        const save_to_url = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('share') + '<span class="text">' + Lang('save to url') + '</span>', {'data-ctr': 'load_csv'});
        save_to_url.addEventListener('click', this.listeners.saveToUrl);

        menu_scope_content.appendChild(save_btn);
        menu_scope_content.appendChild(load_btn);
        menu_scope_content.appendChild(save_to_csv_btn);
        menu_scope_content.appendChild(load_from_csv_btn);
        menu_scope_content.appendChild(save_to_url);

        menu_scope.appendChild(menu_scope_top);
        menu_scope.appendChild(menu_scope_content);

        const sl_scope = simpleCreateHTML('div', ['Cyteria', 'window', 'top-center', 'frozen-top', 'save-load-scope', 'hidden']);
        const sl_scope_top = simpleCreateHTML('div', 'top');
        sl_scope_top.appendChild(simpleCreateHTML('span', 'name', Lang('Save Load: title')));
        sl_scope_top.appendChild(createCloseWindowButton());
        sl_scope.appendChild(sl_scope_top);
        sl_scope.appendChild(simpleCreateHTML('div', 'content'))

        node.appendChild(menu_scope);
        node.appendChild(sl_scope);

        //
        const showContainerTips = simpleCreateHTML('div', ['Cyteria', 'window', 'frozen-top', 'top-center', 'pop-right', 'show-container-tips', 'hidden']);
        const showContainerTips_top = simpleCreateHTML('div', 'top');
        showContainerTips_top.appendChild(simpleCreateHTML('span', 'name'));
        showContainerTips_top.appendChild(createCloseWindowButton());
        showContainerTips.appendChild(showContainerTips_top);
        showContainerTips.appendChild(simpleCreateHTML('div', 'content'));
        node.appendChild(showContainerTips);

        //
        this.nodes.main = node;
        this.nodes.calculationSelect = calculationSelect;
        this.nodes.calculations = calculations;

        this.nodes.menu = menu_scope;
        this.nodes.save_load = sl_scope;

        this.nodes.showContainerTips = showContainerTips;

        this.nodes.spanForAdjustWidth = simpleCreateHTML('span', 'for-adjust-input-width');
        node.appendChild(this.nodes.spanForAdjustWidth);

        this.checkLocationParam();

        return this;
    }
    windowing(){
        this.nodes.main.classList.add('Cyteria', 'window', 'top-center', 'frozen-top', 'bg-mask', 'hidden');
    }
    adjustInputWidth(input){
        const t = this.nodes.spanForAdjustWidth;
        t.innerHTML = input.value;
        input.style.width = (t.offsetWidth + 2) + "px";
    }
    updateSaveLoadScope(){
        const scope = this.nodes.save_load.querySelector('.content');
        CY.element.removeAllChild(scope);

        if ( !CY.storageAvailable('localStorage') )
            return;

        const frg = document.createDocumentFragment();

        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const SAVE_SIZE = 5;

        const stg = window.localStorage;

        Array(SAVE_SIZE).fill().forEach((p, i) => {
            const t = simpleCreateHTML('div', 'scope', null, {'data-i': i});
            const title = simpleCreateHTML('div', ['Cyteria', 'scope-icon'], Icons('book') + '<span class="text">'+ Lang('Save Load/file') + ' ' + (i+1) + '</span>');
            const detail = simpleCreateHTML('div', 'detail');

            const names = stg.getItem('Damage-Calculation-' + i + '-names');
            if ( names ){
                const ul = simpleCreateHTML('ul', ['Cyteria', 'ul', 'simple']);
                names.split(',,').forEach(a => ul.appendChild(simpleCreateHTML('li', null, a)));
                detail.appendChild(ul);
            }
            else {
                detail.appendChild(simpleCreateHTML('div', 'no-data', Lang('Save Load/no data')));
                t.setAttribute('data-status', 'no-data');
            }

            t.appendChild(title);
            t.appendChild(detail);

            t.addEventListener('click', this.listeners.clickSaveLoadCalculations);
            frg.appendChild(t);
        });

        frg.appendChild(simpleCreateHTML('div', ['Cyteria', 'text', 'tips', 'save-confirm-tips', 'hidden', 'entrance', 'fade-in-down'], Lang('Save Load/Warn/Confirm to overwrite existing data')));
        frg.appendChild(simpleCreateHTML('div', ['Cyteria', 'text', 'tips', 'load-confirm-tips', 'hidden', 'entrance', 'fade-in-down'], Lang('Save Load/Warn/Confirm to load data')));

        scope.appendChild(frg);
    }
    getScopeFromChildNode(node, name){
        const cn = this.scopeClassName[name];
        try {
            while ( node != document && !node.classList.contains(cn) )
                node = node.parentNode;
            if ( node == document )
                console.error("Scope not found: " + name);
                return node;
        }
        catch(e){
            console.log(node);
        }
    }
    getCalculationFromScope(scope){
        const cal_scopes = Array.from(this.nodes.calculations.querySelectorAll('.' + this.scopeClassName['calculation']));
        return this.calculations[cal_scopes.indexOf(scope)];
    }
    getItemContainerFromScope(scope){
        return this.currentCalculation().container(parseInt(scope.getAttribute('data-i'), 10));
    }
    getCalcItemFromScope(scope, ctner_scope){
        if ( !ctner_scope )
            ctner_scope = this.getScopeFromChildNode(scope, 'container');
        const ctner = this.getItemContainerFromScope(ctner_scope);
        return ctner.getItem(scope.getAttribute('data-id'));
    }
    showResult(){
        const cal = this.currentCalculation();
        const res = Math.floor(cal.calcResult());
        const cmp = this.status.comparativeDamage;

        const scope = this.nodes.main;
        scope.querySelector('.result-scope .damage-result').innerHTML = res;
        scope.querySelector('.result-scope .comparative-damage').innerHTML = cmp;

        //
        const cmp_res_icon = scope.querySelector('.result-scope .comparative-result-icon'),
            cmp_res = scope.querySelector('.result-scope .comparative-result');

        let t = (((res-cmp)/cmp)*100).toFixed(2);

        const up = t > 0;
        cmp_res_icon.innerHTML = up ? Icons('arrow-up') : Icons('arrow-down');
        cmp_res_icon.classList[up ? 'remove' : 'add']('down');
        cmp_res.classList[up ? 'remove' : 'add']('down');

        t = Math.abs(t);
        cmp_res.innerHTML = t > 999 ? '999%+' : t + '%';

        scope.querySelector('.result-scope .damage-floating-critical').innerHTML =
            Math.floor(cal.calcResult({
                valueSet: {
                    'critical_rate': 100
                },
                beforeCalculate: [
                    {
                        container: cal.findContainer('stability'),
                        value: function(){
                            const v = this.value('stability');
                            const g = this.getItem('probability_of_graze');
                            return g.isValid() && g.value() != 0 ? v/200 : v/100;
                        }
                    }
                ]
            })) +'~' +
            Math.floor(cal.calcResult({
                valueSet: {
                    'probability_of_graze': 0,
                    'stability': 100,
                    'critical_rate': 100
                }
            }));
        scope.querySelector('.result-scope .damage-floating-without-critical').innerHTML =
            Math.floor(cal.calcResult({
                valueSet: {
                    'critical_rate': 0
                },
                beforeCalculate: [
                    {
                        container: cal.findContainer('stability'),
                        value: function(){
                            const v = this.value('stability');
                            const g = this.getItem('probability_of_graze');
                            return g.isValid() && g.value() != 0 ? v/200 : v/100;
                        }
                    }
                ]
            })) +'~' +
            Math.floor(cal.calcResult({
                valueSet: {
                    'probability_of_graze': 0,
                    'stability': 100,
                    'critical_rate': 0
                }
            }));
    }
    currentCalculation(t){
        if ( t )
            this.status.currentCalculation = t;
        return this.status.currentCalculation;
    }
    /**
     * Get Calculation Select Button By Calculation Scope
     * @param  {HTMLNode} scope
     * @return {HTMLNode}
     */
    getCalculationSelectButton(scope){
        const btn_list = this.nodes.calculationSelect.querySelectorAll('.select-button');
        const cal_scopes = Array.from(this.nodes.calculations.querySelectorAll('.' + this.scopeClassName['calculation']));
        return btn_list[cal_scopes.indexOf(scope)];
    }
    /**
     * Get Calculation Scope By Calculation Select Button
     * @param  {HTMLNode} btn
     * @return {HTMLNode}
     */    
    getCalculationScope(btn){
        const btn_list = Array.from(this.nodes.calculationSelect.querySelectorAll('.select-button'));
        const cal_scopes = this.nodes.calculations.querySelectorAll('.' + this.scopeClassName['calculation']);

        return cal_scopes[btn_list.indexOf(btn)];
    }
    updateCalculationScope(cal, scope){
        if ( !scope ){
            const cal_scopes = Array.from(this.nodes.calculations.querySelectorAll('.' + this.scopeClassName['calculation']));
            scope = cal_scopes[this.calculations.indexOf(cal)];
        }

        const name = cal.calculationName();
        this.getCalculationSelectButton(scope).querySelector('.text').innerHTML = name;
        scope.querySelector('.calculation-name > input').value = name;

        scope.querySelectorAll('.sets > .set-scope').forEach(p => {
            const t = p.querySelector('input');
            t.value = cal.userSet(p.getAttribute('data-target'));
        });
        scope.querySelectorAll('.' + this.scopeClassName['container']).forEach(p => {
            const ctner = this.getItemContainerFromScope(p);
            p.classList[!ctner.isValid() ? 'add' : 'remove']('invalid');
        });
        scope.querySelectorAll('.' + this.scopeClassName['calc-item']).forEach(p => {
            const item = this.getCalcItemFromScope(p);
            p.classList[!item.isValid() ? 'add' : 'remove']('invalid');
            const ipt = p.querySelector('.item-value-input');
            if ( !ipt )
                return;
            ipt.value = item.value();
            this.adjustInputWidth(ipt);
        });
    }
    createCalculation(){
        const parent = this.parent;
        const c = new Calculation();
        const p = (cati, base_name, id, ti) => {
            const cat = [
                CalcItemContainer.CATEGORY_CONSTANT,
                CalcItemContainer.CATEGORY_MULTIPLIER,
                CalcItemContainer.CATEGORY_NONE
            ][cati];
            const type = [
                CalcItemContainer.TYPE_NORMAL,
                CalcItemContainer.TYPE_SELECT
            ][ti || 0];

            const t = c.createContainer(id, cat, type);

            t.containerTitle(Lang('Container Title/' + id));

            (Array.isArray(base_name) ? base_name : [base_name]).forEach(a => {
                t.appendItem(parent.getCalcItemBase(a));
            });

            if ( type == CalcItemContainer.TYPE_SELECT )
                t.currentItem(t.item(0));

            return t;
        };
        p(2, ['physical_damage', 'magic_damage'], 'damage_type', 1)
            .link('damage_type')
            .closeCalc()
            .closeInputValue();
        p(0, ['atk', 'matk'], 'atk', 1)
            .link('atk/matk')
            .setBeforeCalculateFunction(this.functions.calculation.atkCalc)
            .closeToggle();
        p(0, ['sub_atk', 'sub_atk_multiplier','two_handed_skill_level'], 'atk_other')
            .openItemToggle('sub_atk', 'two_handed_skill_level')
            .closeCalc();
        p(0, ['character_level', 'target_level'], 'level_difference')
            .closeCalc();
        p(0, ['target_def', 'target_mdef'], 'target_def', 1)
            .link('atk/matk')
            .setBeforeCalculateFunction(this.functions.calculation.defenseCalc);
        p(0, ['physical_pierce', 'magic_pierce'], 'pierce', 1)
            .link('atk/matk')
            .closeCalc();
        p(0, [
            'skill_constant',
            'skill_constant_str',
            'skill_constant_dex',
            'skill_constant_agi',
            'skill_constant_int',
            'skill_constant_vit'
        ], 'skill_constant')
            .link('skill')
            .setBeforeCalculateFunction(this.functions.calculation.skillConstantValue)
            .getLink()
            .openToggleContainer();;

        p(0, 'unsheathe_attack', 'unsheathe_attack_contant')
            .link('unsheathe attack')
            .getLink()
            .openToggleContainer();

        p(0, ['dagger_atk', 'other_constant'], 'other_constant')
            .setBeforeCalculateFunction(this.functions.calculation.otherConstant);

        p(1, [
            'skill_multiplier',
            'skill_multiplier_str',
            'skill_multiplier_dex',
            'skill_multiplier_agi',
            'skill_multiplier_int',
            'skill_multiplier_vit'
        ], 'skill_multiplier')
            .link('skill')
            .setBeforeCalculateFunction(this.functions.calculation.skillMultiplierValue);

        p(1, ['critical_damage', 'critical_rate', 'magic_critical_conversion_rate'], 'critical')
            .setBeforeCalculateFunction(this.functions.calculation.criticalExpectedValue)
            .openItemToggle('critical_rate');

        p(1, ['short_range_damage', 'long_range_damage'], 'range_damage', 1);
        p(1, 'unsheathe_attack_multiplier', 'unsheathe_attack_multiplier')
            .link('unsheathe attack');
        p(1, [
            'stronger_against_neutral',
            'stronger_against_fire',
            'stronger_against_water',
            'stronger_against_earth',
            'stronger_against_wind',
            'stronger_against_light',
            'stronger_against_dark'
        ], 'stronger_against_element', 1)
            .link('element')
        p(1, [
            'target_neutral_resistance',
            'target_fire_resistance',
            'target_water_resistance',
            'target_earth_resistance',
            'target_wind_resistance',
            'target_light_resistance',
            'target_dark_resistance'
        ], 'target_element_resistance', 1)
            .link('element')
            .setBeforeCalculateFunction(this.functions.calculation.negativeValue);
        p(1, 'poration', 'poration');

        p(1, ['target_physical_resistance', 'target_magic_resistance'], 'target_resistance', 1)
            .link('damage_type')
            .closeCalc();

        p(1, ['stability', 'probability_of_graze'], 'stability')
            .setBeforeCalculateFunction(this.functions.calculation.stabilityExpectedValue)
            .openItemToggle('probability_of_graze');

        p(1, ['combo_multiplier', 'other_multiplier'], 'other_multiplier')
            .setBeforeCalculateFunction(this.functions.calculation.otherMultiplier);

        this.calculations.push(c);
        c.calculationName(Lang('build') + ' ' + this.calculations.length);

        return c;
    }
    createCalculationHTML(cal){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const createContainerTitleScope = ctner => {
            const t = simpleCreateHTML('div', 'title-scope');
            const icon = Icons({
                [CalcItemContainer.CATEGORY_CONSTANT]: 'add',
                [CalcItemContainer.CATEGORY_MULTIPLIER]: 'hexagon-multiple',
                [CalcItemContainer.CATEGORY_NONE]: 'multiple-blank-circle'
            }[ctner.category]);
            t.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'text-small', 'title'], icon + '<span class="text">' + ctner.containerTitle() + '</span>'))
            const help_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('help-rhombus'));
            help_btn.addEventListener('click', this.listeners.openContainerTips);
            t.appendChild(help_btn);
            return t;
        }

        const select_btn = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple', 'no-border', 'select-button'], Icons('rhombus-split') + '<span class="text"></span>');
        select_btn.addEventListener('click', this.listeners.calculationSelect);
        this.nodes.calculationSelect.insertBefore(select_btn, this.nodes.calculationSelect.querySelector('.create-calclulation'));

        const node = simpleCreateHTML('div', this.scopeClassName['calculation']);
        
        //
        const top_scope = simpleCreateHTML('div', 'calculation-top-scope');
        
        const set_name = simpleCreateHTML('div', 'calculation-name');
        set_name.appendChild(simpleCreateHTML('span', 'icon', Icons('book')));
        const set_name_input = simpleCreateHTML('input');
        set_name_input.addEventListener('change', this.listeners.setCalculationName);
        set_name.appendChild(set_name_input);

        top_scope.appendChild(set_name);

        const menu_scope = simpleCreateHTML('div', 'calculation-menu');
        const copy_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'], Icons('content-copy') + '<span class="text">' + Lang('copy') + '</span>');
        copy_btn.addEventListener('click', this.listeners.copyCalculation);

        const delete_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'], Icons('delete') + '<span class="text">' + Lang('delete') + '</span>');
        delete_btn.addEventListener('click', this.listeners.deleteCalculation);

        menu_scope.appendChild(copy_btn);
        menu_scope.appendChild(delete_btn);

        top_scope.appendChild(menu_scope);

        node.appendChild(top_scope);

        //
        const createSetScope = tar => {
            const t = simpleCreateHTML('div', 'set-scope');
            t.appendChild(simpleCreateHTML('span', 'text', Lang('User Set/' + tar)));
            const ipt = simpleCreateHTML('input', ['Cyteria', 'input']);
            ipt.addEventListener('click', this.listeners.inputClickSelect);
            ipt.addEventListener('click', this.listeners.stopBubble);
            ipt.addEventListener('change', this.listeners.calculationUserSet);
            ipt.type = 'number';
            t.setAttribute('data-target', tar);
            t.appendChild(ipt);
            return t;
        };
        const sets = simpleCreateHTML('div', 'sets');

        Object.keys(cal.userSet()).forEach(p => sets.appendChild(createSetScope(p)));
        node.appendChild(sets);

        const calcContainers = simpleCreateHTML('div', 'containers');

        const processItemTitle = s => s.replace(/\(\(([^\)]+)\)\)/g, (m, m1) => `<span class="separate-text light">${m1}</span>`);

        const createContainerScope = (c, i) => {
            const scope = simpleCreateHTML('div', this.scopeClassName['container'], null, {'data-i': i});

            const item_clickable = c.type == CalcItemContainer.TYPE_SELECT;

            const items_scope = simpleCreateHTML('div', 'items');
            const ary = [];
            c.item().forEach(a => {
                const t = simpleCreateHTML('div', this.scopeClassName['calc-item'], null, {'data-id': a.itemId()});
                t.appendChild(simpleCreateHTML('span', 'item-text', processItemTitle(a.itemText())));
                if ( c.beInput ){
                    const ipt = simpleCreateHTML('input', ['Cyteria', 'input', 'item-value-input']);
                    ipt.type = 'number';
                    ipt.addEventListener('click', this.listeners.inputClickSelect);
                    ipt.addEventListener('click', this.listeners.stopBubble);
                    ipt.addEventListener('change', this.listeners.setCalcItemValue);
                    ipt.addEventListener('input', this.listeners.adjustInputWidth);
                    t.appendChild(ipt);
                }
                else {
                    t.classList.add('text-only');
                }

                if ( a.beToggle )
                    t.addEventListener('click', this.listeners.calcItemToggle);

                if ( item_clickable || a.beToggle )
                    t.classList.add('clickable');

                t.appendChild(simpleCreateHTML('span', ['item-unit', 'vertical-middle'], a.itemUnit()));

                ary.push(t);
            });
            switch (c.type){
                //case CalcItemContainer.TYPE_NORMAL: do nothing
                case CalcItemContainer.TYPE_SELECT:
                    ary.forEach(b => b.querySelector('.item-text').addEventListener('click', this.listeners.calcItemSelect));
                    break;
            }

            ary.forEach(a => items_scope.appendChild(a));

            const title_scope = createContainerTitleScope(c);

            if ( c.beToggle ){
                const t = title_scope.querySelector('.title');
                t.addEventListener('click', this.listeners.containerToggle);
                t.classList.add('clickable');
            }

            scope.appendChild(title_scope);
            scope.appendChild(items_scope);

            return scope;
        }

        cal.container().forEach((c, i) => {
            calcContainers.appendChild(createContainerScope(c, i));
        });

        node.appendChild(calcContainers);

        {
            const inputs = node.querySelectorAll('.item-value-input'),
                ary = [];
            document.body.appendChild(node);
            inputs.forEach(p => ary.push(p.parentNode.querySelector('.item-text').getBoundingClientRect().width.toFixed(1)));
            document.body.removeChild(node);
            node.classList.add('hidden');

            inputs.forEach((p, i) => p.style.paddingLeft = 'calc(' + ary[i] + 'px + 1rem)');
        }

        return node;
    }
    clearAllCalculations(){
        this.calculations = [];
    }
    saveToCsv(){
        if ( this.calculations.length == 0 ){
            ShowMessage(Lang('Save Load/Warn/Calculations is empty'));
            return null;
        }
        const type_List = {
            'calculation': 0,
            'sets': 1,
            'item': 2,
            'container': 3
        };
        const INDEX = {
            type: 0,
            calculation: {
                name: 1
            },
            sets: {
                name: 1,
                value: 2
            },
            item: {
                id: 1,
                value: 2,
                valid: 3
            },
            container: {
                id: 1,
                currentItemIndex: 2,
                valid: 3
            }
        };

        const bool_to_int = v => v ? 1 : 0;

        const data = [];

        this.calculations.forEach(cal => {
            let ary = [];
            ary[INDEX.type] = type_List['calculation'];
            ary[INDEX.calculation.name] = cal.calculationName();
            data.push(ary);

            Object.keys(cal.userSet()).forEach(s => {
                ary = [];
                ary[INDEX.type] = type_List['sets'];
                ary[INDEX.sets.name] = s;
                ary[INDEX.sets.value] = cal.userSet(s);
                data.push(ary);
            });

            cal.container().forEach(ctner => {
                ctner.item().forEach(item => {
                    ary = [];
                    ary[INDEX.type] = type_List['item'];
                    ary[INDEX.item.id] = item.itemId();
                    ary[INDEX.item.value] = item._value;
                    ary[INDEX.item.valid] = bool_to_int(item.valid);
                    data.push(ary);
                });
            });
            cal.container().forEach(ctner => {
                ary = [];
                ary[INDEX.type] = type_List['container'];
                ary[INDEX.container.id] = ctner.containerId();
                ary[INDEX.container.currentItemIndex] = ctner.item().indexOf(ctner.currentItem());
                ary[INDEX.container.valid] = bool_to_int(ctner.valid);
                data.push(ary);
            });
        });

        ShowMessage(Lang('Save Load/Warn/Saving success'));

        return Papa.unparse(data);
    }
    loadFromCsv(csv){
        if ( csv === '' ){
            ShowMessage(Lang('Save Load/Warn/File is empty'));
            return;
        }

        const type_List = [
            'calculation', 'sets', 'item', 'container'
        ];
        const INDEX = {
            type: 0,
            calculation: {
                name: 1
            },
            sets: {
                name: 1,
                value: 2
            },
            item: {
                id: 1,
                value: 2,
                valid: 3
            },
            container: {
                id: 1,
                currentItemIndex: 2,
                valid: 3
            }
        };

        const check = v => v !== void 0 && v !== '';
        const checkValue = (v, if_false) => check(v) ? v : if_false;

        const strint_to_bool = v => v == '1' ? true : false;
        const str_to_int = v => parseInt(v, 10);

        const dataInput = (fun, ...datas) => {
            if ( datas.every(a => check(a)) )
                fun(...datas);
        };

        // 暫存載入前的資料
        const old_cals = this.calculations.slice();
        this.calculations = [];

        // 開始讀取CSV
        try {
            let cur_cal;

            Papa.parse(csv).data.forEach(p => {
                const type = type_List[p[INDEX.type]];
                switch (type){
                    case 'calculation':
                        cur_cal = this.createCalculation();
                        dataInput(
                            v => cur_cal.calculationName(v),
                            p[INDEX.calculation.name]
                        );
                        break;
                    case 'sets':
                        dataInput(
                            (name, v) => cur_cal.userSet(name, str_to_int(v)),
                            p[INDEX.sets.name],
                            p[INDEX.sets.value]
                        );
                        break;
                    case 'item': {
                        const item = cur_cal.findItem(p[INDEX.item.id]);
                        if ( item ){
                            dataInput(
                                v => item.value(str_to_int(v)),
                                p[INDEX.item.value]
                            );
                            dataInput(
                                v => item.valid = strint_to_bool(v),
                                p[INDEX.item.valid]
                            );
                        }
                        break;
                    }
                    case 'container': {
                        const ctner = cur_cal.findContainerById(p[INDEX.container.id]);
                        if ( ctner ){
                            dataInput(
                                v => {
                                    v = str_to_int(v);
                                    if ( v != -1 )
                                        ctner.currentItem(ctner.item(v))
                                },
                                p[INDEX.container.currentItemIndex]
                            );
                            dataInput(
                                v => ctner.valid = strint_to_bool(v),
                                p[INDEX.container.valid]
                            );
                        }
                        break;
                    }
                }
            });
        }
        catch (e){
            console.log(e);
            ShowMessage(Lang('Save Load/Warn/An error occurred while loading data'));

            // 發生錯誤，還原Controller至載入前
            this.calculations = old_cals;

            return;
        }

        // === 若載入成功，才開始載入介面。 ===
        
        // 重置介面
        CY.element.removeAllChild(this.nodes.calculations);
        this.nodes.calculationSelect.querySelectorAll('.select-button').forEach(p => CY.element.remove(p));

        const scope = this.nodes.calculations;
        // 配置介面
        this.calculations.forEach(a => {
            const cal_scope = this.createCalculationHTML(a);
            scope.appendChild(cal_scope);
            this.currentCalculation(a);
            this.updateCalculationScope(a, cal_scope);
        });
        this.nodes.calculationSelect.querySelector('.select-button').click();

        ShowMessage(Lang('Save Load/Warn/Loading success'));
    }
    checkLocationParam(){
        const url = new URL(document.location);
        const calculation_data = url.searchParams.get('calculation_data');
        if ( calculation_data ){
            this.loadFromCsv(calculation_data.replace(/\|n\|/g, '\r\n'));
        }
    }
}