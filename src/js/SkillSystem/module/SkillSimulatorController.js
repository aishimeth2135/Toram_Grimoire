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
            buttons: null
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

            },
            setOperating(e){

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

        this.WindowController = new WindowController();
        this.WindowController.appendWindow('select-skill-tree', {
            extraClassList: ['frozen-top', 'top-center'],
            title: '',
            contentDocumentFragment: this.components['select-skill-tree'].$create(this.skillRoot)
        });

        const main_top = simpleCreateHTML('div', ['Cyteria', 'Layout', 'sticky-header', 'top']);
        const open_select_skilltree = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('six-star'));
        open_select_skilltree.addEventListener('click', function(e){
            ctrr.WindowController.openWindow('select-skill-tree');
        });

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
                btn.setAttribute('data-step', p);
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

        //
        function setSkillButton(btn, skill, data){
            const w = data.gridWidth;
            const {cx, cy} = data;
            const tran = data.lengthTransformFunction;
            const Circle = CY.svg.drawCircle,
                Text = CY.svg.drawText;
            const bg = Circle(tran(cx) + w/2, tran(cy) + w/2, w/4, {class: 'skill-level-circle'}),
                text = Text(tran(cx) + w/2, tran(cy) + w/2, skill.level(), {class: 'skill-level-text', 'data-skill-no': skill.no});

            btn.parentNode.insertBefore(text, btn.previousSibling);
            btn.parentNode.insertBefore(bg, text);
        }

        const Cy_SkillTree = new CyComponent({
            name: "SkillSimulator/SkillTree",
            create(self, st){
                const main = simpleCreateHTML('div', 'skill-tree');

                const skill_tree = DrawSkillTree(st, {setSkillButton});
                main.appendChild(skill_tree);

                return main;
            },
            update(){

            }
        });

        const Cy_SkillTreeCategory = new CyComponent({
            name: 'SkillSimulator/SkillTreeCategory',
            create(self, stc){
                const main = simpleCreateHTML('div', 'skill-tree-category');

                // const frg = document.createDocumentFragment();
                // stc.skillTrees.forEach(st => {
                //     const t = self.$component('SkillTree').$create(st);
                //     frg.appendChild(t);
                // });

                // main.appendChild(frg);
                return main;
            },
            update(self, el, stc){

            },
            components: {
                "SkillTree": Cy_SkillTree
            }
        });

        const Cy_SkillRoot = new CyComponent({
            name: 'SkillSimulator/SkillRoot',
            create(self, sr){
                const main = simpleCreateHTML('div', 'skill-root');

                const top = simpleCreateHTML('div', 'top');

                const frg = document.createDocumentFragment();
                sr.skillTreeCategorys.forEach(stc => {
                    const t = self.$component('SkillTreeCategory').$create(stc);
                    frg.appendChild(t);
                });

                const stcs_scope = simpleCreateHTML('div', 'skill-tree-categorys');
                stcs_scope.appendChild(frg);

                main.appendChild(top);
                main.appendChild(stcs_scope);

                return main;
            },
            update(self, el, sr){

            },
            components: {
                "SkillTreeCategory": Cy_SkillTreeCategory
            }
        });

        this.components['SkillRoot'] = Cy_SkillRoot;

        this.components['select-skill-tree'] = new CyComponent({
            name: 'select-skill-tree',
            create(self, sr){
                sr.skillTreeCategorys.forEach(stc => {
                    stc.skillTrees.forEach(st => {
                        const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('file-tree') + `<span class="text">${st.name}</span>`);

                    });
                });
                return document.createElement('div');
            },
            eventListeners: {

            }
        });
    }
    
}