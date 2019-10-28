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

        this.listeners = {
            setStep(e){

            }
        };
    }
    init(el){
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        el.classList.add('SkillSimulator-main')

        const main = simpleCreateHTML('div', 'main');

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
    }
    initComponent(){
        const CyComponent = CY.CyComponent;
        const simpleCreateHTML = CY.element.simpleCreateHTML;

        //
        function setSkillButton(){

        }

        const SkillTree = new CyComponent({
            create(st){
                const main = simpleCreateHTML('div', 'skill-tree');

                const skill_tree = DrawSkillTree(st, {setSkillButton});
            }
        });

        const SkillTrees = new CyComponent({
            create(){
                const main = simpleCreateHTML('div', 'skill-trees');
                return main;
            },
            update(){

            }
        });
    }
    
}