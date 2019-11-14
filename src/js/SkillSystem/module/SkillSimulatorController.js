import {SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import {DrawSkillTree, createDrawSkillTreeDefs} from "./DrawSkillTree.js";
import {getSkillElementId, selectSkillElement} from "./SkillElementMethods.js";

import Icons from "../../main/module/SvgIcons.js";
import GetLang from "../../main/module/LanguageSystem.js";

import CY from "../../main/module/cyteria.js";

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
            'SkillTrees': null
        }

        this.listeners = {
            setStep(e){

            }
        };
    }
    init(el){
        this.initComponent();

        const simpleCreateHTML = CY.element.simpleCreateHTML;

        el.classList.add('SkillSimulator-main')

        // Buttons
        const main_menu = simpleCreateHTML('div', 'main-menu');
        const createMenuScope = (title_id, icon_id, values, listener) => {
            const col = simpleCreateHTML('div', 'column');
            const btns = simpleCreateHTML('div', 'buttons-scope');
            values.forEach((p, i) => {
                const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'fill'], Icons(icon_id[i]));
                btn.setAttribute('data-step', p);
                btn.addEventListener('click', listener);
                btns.appendChild(btn);
            });
            col.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'line'], Icons('multiple-blank-circle') + `<span class="text">${Lang('main menu/' + title_id)}</span>`));
            col.appendChild(btns);
            return cols;
        };

        const set_operating = createMenuScope('operating', ['add', 'sub'], ['+', '-'], this.listeners.setOperating);
        const set_step = createMenuScope('step value', ['numeric-1', 'numeric-5', 'numeric-10'], ['1', '5', '10'], this.listeners.setStep);
        main_menu.appendChild(set_operating);
        main_menu.appendChild(set_step);

        // svg reusable defs
        const svg = CY.svg.create();
        svg.appendChild(createDrawSkillTreeDefs);
        el.appendChild(svg);

        const main = simpleCreateHTML('div', 'main');
        const skillRoot_scope = this.components['SkillRoot'].$create(this.skillRoot);
        main.appendChild(skillRoot_scope);

    }
    initComponent(){
        const CyComponent = CY.CyComponent;
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const ctrr = this;

        //
        function setSkillButton(btn, skill, data){
            const w = data.gridWidth;
            const {cx, cy} = data;
            const Circle = CY.svg.drawCircle,
                Text = CY.svg.drawText;
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

                const frg = 
                stc.skillTrees.reduce((cur, st) => {
                    const t = this.$component('SkillTree').$create(st);
                    cur.appendChild(t);
                    return cur;
                },
                document.createDocumentFragment());

                main.appendChild(frg);
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

                return main;
            },
            update(self, el, sr){
                const frg =
                sr.skillTreeCategorys.reduce((cur, stc) => {
                    const t = this.$component('SkillTreeCategory').$create(stc);
                    cur.appendChild(t);
                    return cur;
                },
                document.createDocumentFragment());

                main.appendChild(frg);
            },
            components: {
                "SkillTreeCategory": Cy_SkillTreeCategory
            }
        });

        this.components['SkillRoot'] = Cy_SkillRoot;
    }
    
}