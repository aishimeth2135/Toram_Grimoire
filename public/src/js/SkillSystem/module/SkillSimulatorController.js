import {SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import {DrawSkillTree, createDrawSkillTreeDefs} from "./DrawSkillTree.js";
import {getSkillElementId, selectSkillElement} from "./SkillElementMethods.js";

import Icons from "../../main/module/SvgIcons.js";
import GetLang from "../../main/module/LanguageSystem.js";

import CY from "../../main/module/cyteria.js";
import CyComponent from "../../main/module/Cyteria/CyComponent.js";
import WindowController from "../../main/module/Cyteria/WindowController.js";

function Lang(s){
    return GetLang('Skill Simulator/Controller/' + s);
}

export default class SkillSimulatorController {
    constructor(sr){
        this.skillRoot = sr;

        this.nodes = {
            main: null,
            buttons: null,
            skillRoot: null
        };

        this.components = {
            'SkillRoot': null
        }

        this.status = {
            skillPointStep: 5,
            skillPointOperating: '+'
        }

        this.listeners = {
            setStep(e){
                const s = this.getAttribute('data-set');
                ctrr.status.skillPointStep = parseInt(s, 10);
            },
            setOperating(e){
                const s = this.getAttribute('data-set');
                ctrr.status.skillPointOperating = s;
            }
        };
    }
    init(el){
        this.initComponent();

        const simpleCreateHTML = CY.element.simpleCreateHTML;
        const ctrr = this;

        el.classList.add('SkillSimulator-main')

        // svg reusable defs
        const svg = CY.svg.create();
        svg.appendChild(createDrawSkillTreeDefs());
        el.appendChild(svg);

        //
        const main = simpleCreateHTML('div', 'main');
        const skillRoot_scope = this.components['SkillRoot'].$create(this.skillRoot);
        main.appendChild(skillRoot_scope);
        this.nodes['skillRoot'] = skillRoot_scope;

        this.WindowController = new WindowController();
        // this.WindowController.appendWindow('select-skill-tree', {
        //     extraClassList: ['frozen-top', 'top-center'],
        //     title: '',
        //     contentDocumentFragment: this.components['select-skill-tree'].$create(this.skillRoot)
        // });

        const main_top = simpleCreateHTML('div', ['Cyteria', 'Layout', 'sticky-header', 'top']);
        const main_top_content = simpleCreateHTML('div', 'content');
        const open_select_skilltree = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button', 'start'], Icons('six-star'));
        open_select_skilltree.addEventListener('click', function(e){
            ctrr.nodes['select-skill-tree'].classList.toggle('hidden');
        });
        this.nodes['select-skill-tree'] = this.components['select-skill-tree'].$create(this.skillRoot);
        main_top_content.appendChild(open_select_skilltree);

        main_top_content.appendChild(this.nodes['select-skill-tree']);

        main_top.appendChild(main_top_content);

        main.appendChild(main_top);
        el.appendChild(main);

        // Buttommenu
        const bottom_menu = simpleCreateHTML('div', 'bottom-menu');
        const bottom_menu_select = simpleCreateHTML('div', ['select-menu', 'hidden']);
        const bottom_menu_content = simpleCreateHTML('div', 'content');

        function openBottomMenuSelect(e){
            this.classList.add('selected');
            const sel = this.parentNode.querySelector('.selected');
            sel && sel.classList.remove('selected');

            const sel_menu = bottom_menu_select.querySelector('.column:not(.hidden)');
            sel_menu && sel_menu.classList.add('hidden');
            bottom_menu_select.querySelector(`.column[data-id="${this.getAttribute('data-id')}"]`).classList.remove('hidden');

            bottom_menu_select.classList.remove('hidden');
        }
        function updateBottomMenu(e){
            const btn = bottom_menu_content.querySelector(`.set-button[data-id="${this.parentNode.parentNode.getAttribute('data-id')}"]`);
            btn.innerHTML = this.innerHTML;
            btn.classList.remove('selected');

            bottom_menu_select.classList.add('hidden');
        }

        const createMenuScope = (id, title_id, icon_id, values, cur_value, listener) => {
            const col = simpleCreateHTML('div', ['column', 'hidden'], null, {'data-id': id});
            const btns = simpleCreateHTML('div', 'buttons-scope');
            values.forEach((p, i) => {
                const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons(icon_id[i]));
                btn.setAttribute('data-set', p);
                btn.addEventListener('click', updateBottomMenu);
                btn.addEventListener('click', listener);
                btns.appendChild(btn);
            });
            col.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'line'], Icons('multiple-blank-circle') + `<span class="text">${Lang('main menu/' + title_id)}</span>`));
            col.appendChild(btns);

            bottom_menu_select.appendChild(col);

            const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'set-button'], Icons(icon_id[values.indexOf(cur_value)]), {'data-id': id});
            btn.addEventListener('click', openBottomMenuSelect);
            bottom_menu_content.appendChild(btn);

            return col;
        };

        createMenuScope(0, 'operating', ['add', 'sub'], ['+', '-'], this.status.skillPointOperating, this.listeners.setOperating);
        createMenuScope(1, 'step value', ['iconify/mdi:numeric-1', 'iconify/mdi:numeric-5', 'iconify/mdi:numeric-10'], [1, 5, 10], this.status.skillPointStep, this.listeners.setStep);
        bottom_menu.appendChild(bottom_menu_select);
        bottom_menu.appendChild(bottom_menu_content);

        el.appendChild(bottom_menu);

        el.appendChild(this.WindowController.getWindowContainer());
    }
    initComponent(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const ctrr = this;


        const cy_SkillTree = new CyComponent({
            name: "SkillSimulator/SkillTree",
            create(self, st){
                const main = simpleCreateHTML('div', 'skill-tree', null, {'data-id': st.id});

                const skill_tree = DrawSkillTree(st, {setSkillButton: self.$callback('set-skill-tree-button')});
                main.appendChild(skill_tree);

                return main;
            },
            update(el, st){
                el.querySelector('.skill-level-text').forEach(p => {
                    const id = parseInt(this.getAttribute('data-id'));
                    p.innerHTML = st.skills.find(a => a.id == id).level();
                });
            },
            eventListeners: {
                'click-skill-tree-button': function(e){
                    const skill = selectSkillElement(ctrr.skillRoot, this.getAttribute('data-iid'));
                    const v = ctrr.status.skillPointStep * (ctrr.status.skillPointOperating == '-' ? -1 : 1);
                    skill.addLevel(v);
                    skill.updateTree();
                    const st_el = document.getElementById(cy_SkillTree.$method('get-html-element-id', getSkillElementId(skill.parent)));
                    cy_SkillTree.$update(st_el);
                }
            },
            methods: {
                'get-html-element-id': function(self, iid){
                    return 'Skill-Simulator--skill-tree--' + iid;
                }
            },
            callbacks: {
                'set-skill-tree-button': function(btn, skill, data){
                    const w = data.gridWidth;
                    const {cx, cy} = data;
                    const tran = data.lengthTransformFunction;
                    const Circle = CY.svg.drawCircle,
                        Text = CY.svg.drawText;
                    const bg = Circle(tran(cx) + w/2, tran(cy) + w/2, w/4, {class: 'skill-level-circle'}),
                        text = Text(tran(cx) + w/2, tran(cy) + w/2, skill.level(), {
                            class: 'skill-level-text', 'data-iid': getSkillElementId(skill)
                        });

                    btn.parentNode.insertBefore(text, btn.previousSibling);
                    btn.parentNode.insertBefore(bg, text);
                }
            }
        });

        const cy_SkillTreeCategory = new CyComponent({
            name: 'SkillSimulator/SkillTreeCategory',
            create(self, stc){
                const main = simpleCreateHTML('div', 'skill-tree-category', null, {'data-id': stc.id});

                // const frg = document.createDocumentFragment();
                // stc.skillTrees.forEach(st => {
                //     const t = self.$component('SkillTree').$create(st);
                //     frg.appendChild(t);
                // });

                // main.appendChild(frg);
                return main;
            },
            update(self, el, type, ...args){
                if ( type == 'skill-tree' ){
                    const st = args[0];
                    const st_el = r.querySelector(`.skill-tree[data-id="${st.id}"]`);
                    if ( !st_el ){
                        const new_st_el = self.$component('skill-tree').$create(st);
                        const st_els = r.querySelectorAll('.skill-tree');
                        st_els.length == 0
                            ? el.appendChild(new_st_el)
                            : Array.from(st_els).find((p, i, ary) => {
                                const id = parseInt(p.getAttribute('data-id'));
                                if ( id > st.id ){
                                    el.insertBefore(new_st_el, p);
                                    return true;
                                }
                                if ( i == ary.length - 1 )
                                    el.appendChild(new_st_el);
                            });
                    }
                    else
                        self.$component('skill-tree').$update(st_el, st);
                }
            },
            components: {
                "skill-tree": cy_SkillTree
            }
        });

        const cy_SkillRoot = new CyComponent({
            name: 'SkillSimulator/SkillRoot',
            create(self, sr){
                const main = simpleCreateHTML('div', 'skill-root');

                const top = simpleCreateHTML('div', 'top');

                const stcs_scope = simpleCreateHTML('div', 'skill-tree-categorys');

                main.appendChild(top);
                main.appendChild(stcs_scope);

                return main;
            },
            update(self, r, type, ...args){
                if ( type == 'skill-tree' ){
                    const st = args[0];
                    const stc_el = r.querySelector(`.skill-tree-category[data-id="${st.parent.id}"]`)
                        || self.$update('append|skill-tree-category', st.parent);
                    self.$component('skill-tree-category').$update(stc_el, 'skill-tree', st);
                }
                else if ( type == 'append|skill-tree-category' ){
                    const stc = args[0];
                    const new_el = self.$component('skill-tree-categorys').$create(stc);
                    const stc_els = r.querySelectorAll('.skill-tree-category');
                    
                    stc_els.length == 0
                        ? r.appendChild(new_el)
                        : Array.from(stc_els).find((p, i, ary) => {
                            const id = parseInt(p.getAttribute('data-id'), 10);
                            if ( id > stc.id ){
                                r.insertBefore(new_el, p);
                                return true;
                            }
                            if ( i == ary.length - 1 )
                                r.appendChild(new_el);
                        });
                    return new_el;
                }
            },
            components: {
                "skill-tree-category": cy_SkillTreeCategory
            }
        });

        this.components['SkillRoot'] = cy_SkillRoot;

        this.components['select-skill-tree'] = new CyComponent({
            name: 'select-skill-tree',
            create(self, sr){
                const r = simpleCreateHTML('div', ['Cyteria', 'entrance', 'fade-in', 'inner-menu', 'select-skill-tree-menu', 'hidden']);
                sr.skillTreeCategorys.forEach(stc => {
                    stc.skillTrees.forEach(st => {
                        const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('iconify/mdi:file-tree') + `<span class="text">${st.name}</span>`, {'data-iid': getSkillElementId(st)});
                        btn.addEventListener('click', self.$eventListener('toggle-select-skill-tree'));
                        r.appendChild(btn);
                    });
                });
                return r;
            },
            eventListeners: {
                'toggle-select-skill-tree': function(e){
                    this.classList.toggle('selected');
                    this.classList.contains('selected')
                        ? this.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon', 'content-right', 'selected-icon'], Icons('done')))
                        : this.removeChild(this.querySelector('.selected-icon'));
                    cy_SkillRoot.$update(ctrr.nodes['skillRoot'], 'skill-tree', selectSkillElement(ctrr.skillRoot, this.getAttribute('data-iid')));
                }
            }
        });
    }
    /**
     * compare order of sid and cmp. if order(sid) > order(cmp), return true. or return false. (order will not equal)
     * @param  {String} sid
     * @param  {String} cmp
     * @return {Boolean}
     */
    // compareOrderByStringId(sid, cmp){
    //     const [stcn, stn] = sid.split('-').map(a => parseInt(a, 10));
    //     const [cmp_stcn, cmp_stn] = cmp_.split('-').map(a => parseInt(a, 10));

    //     return stcn > cmp_stcn ? true : (stcn == cmp_stcn ? stn > cmp_stn : false);
    // }
}