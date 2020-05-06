import GetLang from "@global-modules/LanguageSystem.js";
import CY from "@global-modules/cyteria.js";

import UserGuideSystem from "../../../UserGuideSystem/UserGuideSystem.js";
import {UserGuideFrame, UserGuideText} from "../../../UserGuideSystem/module/Element.js";
import {createDrawSkillTreeDefs} from "../../module/DrawSkillTree.js";

import Vue from 'vue';
import vue_main from "./vue/main.vue";

function Lang(s, vs){
    return GetLang('Skill Simulator/Controller/' + s, vs);
}
export {Lang};

export default class SkillSimulatorController {
    constructor(sr){
        this.skillRoot = sr;
    }
    init(el){
        this.UserGuideSystem = null;

        this.initComponent(el);

        // svg reusable defs
        const svg = CY.svg.create();
        svg.appendChild(createDrawSkillTreeDefs());
        document.body.appendChild(svg);
    }
    updateUserGuideSystem(el){
        if ( this.UserGuideSystem == null )
            this.initUserGuideSystem(el);
        else
            this.UserGuideSystem.componentOptions.targetElement = el;
    }
    initUserGuideSystem(el){
        const componentOptions = {
            name: 'Skill-Simulator-v2',
            targetElement: el,
            start: {
                title: Lang('user guide text/start title'),
                caption: Lang('user guide text/start caption')
            },
            framesDatas: [
                {
                    id: 1,
                    type: UserGuideFrame.TYPE_NORMAL,
                    elementGroupsDatas: [
                        {
                            id: 1,
                            text: Lang('user guide text/frame 1-1'),
                            position: UserGuideText.POSITION_BOTTOM
                        }
                    ]
                },
                {
                    id: 2,
                    type: UserGuideFrame.TYPE_NORMAL,
                    elementGroupsDatas: [
                        {
                            id: 1,
                            text: Lang('user guide text/frame 2-1'),
                            position: UserGuideText.POSITION_BOTTOM
                        }
                    ]
                },
                {
                    id: 3,
                    type: UserGuideFrame.TYPE_NORMAL,
                    elementGroupsDatas: [
                        {
                            id: 1,
                            text: Lang('user guide text/frame 3-1'),
                            position: UserGuideText.POSITION_BOTTOM
                        }
                    ]
                },
                {
                    id: 4,
                    type: UserGuideFrame.TYPE_NORMAL,
                    elementGroupsDatas: [
                        {
                            id: 1,
                            text: Lang('user guide text/frame 4-1'),
                            position: UserGuideText.POSITION_BOTTOM
                        }
                    ]
                },
                {
                    id: 5,
                    type: UserGuideFrame.TYPE_NORMAL,
                    elementGroupsDatas: [
                        {
                            id: 1,
                            text: Lang('user guide text/frame 5-1'),
                            position: UserGuideText.POSITION_TOP
                        }
                    ]
                },
                {
                    id: 6,
                    type: UserGuideFrame.TYPE_NORMAL,
                    elementGroupsDatas: [
                        {
                            id: 1,
                            text: Lang('user guide text/frame 6-1'),
                            position: UserGuideText.POSITION_TOP
                        }
                    ]
                },
                {
                    id: 7,
                    type: UserGuideFrame.TYPE_NORMAL,
                    elementGroupsDatas: [
                        {
                            id: 1,
                            text: Lang('user guide text/frame 7-1'),
                            position: UserGuideText.POSITION_TOP
                        }
                    ]
                }
            ]
        };
        this.UserGuideSystem = {
            origin: new UserGuideSystem(),
            componentOptions
        };

        this.UserGuideSystem.origin.init(componentOptions);
    }
    initComponent(el){
        const ctrr = this;
        const vm = new Vue({
            el: el,
            template: '<main-scope :skill-root="skillRoot"></main-scope>',
            data(){
                return {
                    skillRoot: ctrr.skillRoot
                };
            },
            components: {
                'main-scope': vue_main
            },
            updated: function(){
                ctrr.updateUserGuideSystem(this.$el);
            },
            mounted: function(){
                ctrr.updateUserGuideSystem(this.$el);
            }
        });
    }
}