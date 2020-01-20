<template>
    <article>
        <div class="main">
            <div class="Cyteria Layout sticky-header transparent top">
                <div class="content">
                    <cy-left-menu data-user-guide-set="1-1">
                        <div class="column">
                            <template v-for="(state, i) in skillRootStates">
                                <transition name="fade">
                                    <span class="Cyteria Button line selection"
                                        :class="{'selected': currentSkillRootStateIndex == i}"
                                        @click="selectCurrentSkillRootState(i)">
                                        <iconify-icon name="ant-design:build-outlined"></iconify-icon>
                                        <span class="text">{{ state.name }}</span>
                                    </span>
                                </transition>
                            </template>
                            <span @click.stop="createBuild()" class="Cyteria Button simple no-border">
                                <iconify-icon name="ic:round-add-circle-outline"></iconify-icon>
                                <lang-text lang-id="Skill Simulator/Controller/create build" class="text"></lang-text>
                            </span>
                        </div>
                        <lang-text tag-name="div" lang-id="Skill Simulator/Controller/left menu/save load" class="title-line"></lang-text>
                        <div class="column">
                            <save-load-data-system v-bind="SaveLoadDataSystemOptions"></save-load-data-system>
                        </div>
                    </cy-left-menu>
                    <span class="Cyteria Button icon-only button start"
                        @click="openJumpSkillTree()"
                        :class="{selected: jumpSkillTreeVisible}"
                        data-user-guide-set="4-1">
                        <iconify-icon name="dashicons:flag"></iconify-icon>
                    </span>
                    <span class="Cyteria Button icon-only button"
                        @click="openSelectSkillTree()"
                        :class="{selected: selectSkillTreeVisible}"
                        data-user-guide-set="3-1">
                        <iconify-icon name="ic:round-library-add"></iconify-icon>
                    </span>
                    <span class="Cyteria Button icon-only button"
                        :class="{selected: buildInformationVisible}"
                        @click="openBuildInformation()"
                        data-user-guide-set="2-1">
                        <iconify-icon
                            :name="buildInformationVisible ? 'ic-round-keyboard-arrow-up' : 'ic-round-keyboard-arrow-down'">
                        </iconify-icon>
                    </span>
                    <transition name="inner-menu">
                        <div class="inner-menu select-skill-tree" v-show="selectSkillTreeVisible">
                            <template v-for="(stc, index) in currentSkillRootState.skillTreeCategoryStates">
                                <div class="title">{{ stc.origin.name }}</div>
                                <div class="content">
                                    <span v-for="(st, index2) in stc.skillTreeStates"
                                        @click="toggleSkillTreeVisible(stc, st)"
                                        :class="{selected: st.visible}"
                                        class="Cyteria Button line icon-small selection">
                                        <svg-icon icon-id="rabbit-book"></svg-icon>
                                        <span class="text">{{ st.origin.name }}</span>
                                        <iconify-icon v-show="st.visible" class="content-right" name="mdi:done"></iconify-icon>
                                    </span>
                                </div>
                            </template>
                        </div>
                    </transition>
                    <transition name="inner-menu">
                        <div class="inner-menu" v-show="jumpSkillTreeVisible">
                            <div v-if="noSkillTreeSelected" class="default-tips">
                                <div class="container">
                                    <iconify-icon name="mdi:ghost"></iconify-icon>
                                    <lang-text lang-id="Skill Simulator/Controller/no skill tree selected"></lang-text>
                                </div>
                            </div>
                            <template v-else>
                                <div class="top Cyteria line-space-bottom">
                                    <span v-show="!jumpSkillTreeShowDetail"
                                        @click="toggleJumpSkillTreeShowDetail()"
                                        class="Cyteria Button simple no-border no-padding">
                                        <iconify-icon name="ic:round-details"></iconify-icon>
                                        <lang-text class="text" lang-id="Skill Simulator/Controller/skill tree: show details"></lang-text>
                                    </span>
                                    <span v-show="jumpSkillTreeShowDetail"
                                        @click="toggleJumpSkillTreeShowDetail()"
                                        class="Cyteria Button simple no-border no-padding">
                                        <iconify-icon name="mdi:circle-outline"></iconify-icon>
                                        <lang-text class="text" lang-id="Skill Simulator/Controller/skill tree: show normal"></lang-text>
                                    </span>
                                </div>
                                <lang-text class="title" v-show="jumpSkillTreeShowDetail"
                                    lang-id="Skill Simulator/Controller/main menu/star gem list">
                                </lang-text>
                                <div v-show="jumpSkillTreeShowDetail && currentStarGemList.length != 0"
                                    class="content">
                                    <span v-for="(o, i) in currentStarGemList"
                                        @click="jumpToSkillTree(o.skillTreeState.origin)"
                                        class="Cyteria Button line icon-small">
                                        <iconify-icon name="mdi:judaism"></iconify-icon>
                                        <span class="text">
                                            {{ o.skill.base.name }} Lv.{{ o.skill.starGemLevel() }}
                                        </span>
                                        <span class="Cyteria scope-icon text-small content-right">
                                            <iconify-icon name="mdi:judaism"></iconify-icon>
                                            <span class="text">{{ o.skill.starGemLevel() - o.skill.level() }}</span>
                                        </span>
                                    </span>
                                </div>
                                <div v-if="jumpSkillTreeShowDetail && currentStarGemList.length == 0"
                                    class="default-tips">
                                    <div class="container">
                                        <iconify-icon name="mdi:ghost"></iconify-icon>
                                        <lang-text lang-id="Skill Simulator/Controller/no star gem set"></lang-text>
                                    </div>
                                </div>
                                <template v-for="(stc, index) in currentSkillRootState.skillTreeCategoryStates">
                                    <div class="title" v-show="stc.visible">{{ stc.origin.name }}</div>
                                    <div class="content" v-show="stc.visible">
                                        <template v-for="(st, index2) in stc.skillTreeStates"
                                            v-if="st.visible">
                                            <span @click="jumpToSkillTree(st.origin)"
                                                class="Cyteria Button line icon-small">
                                                <svg-icon icon-id="rabbit-book"></svg-icon>
                                                <span class="text">{{ st.origin.name }}</span>
                                                <span class="Cyteria scope-icon text-small content-right">
                                                    <iconify-icon name="simple-line-icons:magic-wand"></iconify-icon>
                                                    <span class="text">{{ skillTreeSkillPointCost(st) }}</span>
                                                </span>
                                            </span>
                                        </template>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </transition>
                    <transition name="inner-menu">
                        <div class="inner-menu build-information" v-show="buildInformationVisible">
                            <div class="Cyteria Layout title-input-scope">
                                <span class="icon">
                                    <iconify-icon name="ant-design:build-outlined"></iconify-icon>
                                </span>                                    
                                <input type="text" v-model="currentSkillRootState.name" />
                            </div>
                            <div class="buttons-content">
                                <span class="Cyteria Button simple" @click="copyCurrentBuild()">
                                    <iconify-icon name="mdi:content-copy"></iconify-icon>
                                    <lang-text class="text" lang-id="global/copy"></lang-text>
                                </span>
                                <span class="Cyteria Button simple" @click="deleteCurrentBuild()">
                                    <iconify-icon name="ic:round-delete-outline"></iconify-icon>
                                    <lang-text class="text" lang-id="global/delete"></lang-text>
                                </span>
                                <span class="Cyteria Button simple" @click="exportCurrentBuildText()">
                                    <iconify-icon name="gridicons:image"></iconify-icon>
                                    <lang-text class="text" lang-id="Skill Simulator/Controller/export text"></lang-text>
                                </span>
                                <span class="Cyteria Button simple" @click="exportCurrentBuildImage()">
                                    <iconify-icon name="gridicons:image"></iconify-icon>
                                    <lang-text class="text" lang-id="Skill Simulator/Controller/export image"></lang-text>
                                </span>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
            <skill-root :skill-root-state="currentSkillRootState"></skill-root>
            <div class="bottom-menu">
                <div class="skill-point-information">
                    <span class="Cyteria scope-icon space-right" data-user-guide-set="6-1">
                        <iconify-icon name="simple-line-icons:magic-wand"></iconify-icon>
                        <span class="text">{{ skillPointCostSum }}</span>
                    </span>
                    <span class="Cyteria scope-icon" data-user-guide-set="7-1">
                        <iconify-icon name="mdi:judaism"></iconify-icon>
                        <span class="text">{{ starGemSkillPointSum }}</span>
                    </span>
                </div>
                <div class="content">
                    <span v-for="(state, index) in setButtonStates"
                        @click="openSetButtonMenu(state.type)"
                        :class="{selected: state.selected}"
                        class="set-button" data-user-guide-set="5-1">
                        <transition name="inner-menu">
                            <div class="select-menu" v-show="state.selected">
                                <span v-for="(value, index2) in state.values"
                                    @click="setButtonSelected(state.type, index2)"
                                    class="Cyteria Button line icon-small">
                                    <iconify-icon :name="state.icons[index2]"></iconify-icon>
                                    <span class="text">{{ state.texts[index2] }}</span>
                                </span>
                            </div>
                        </transition>
                        <span class="Cyteria Button simple no-border">
                            <iconify-icon :name="state.icons[state.currentIndex]"></iconify-icon>
                            <span class="text" v-show="state.selected">{{ state.texts[state.currentIndex] }}</span>
                        </span>
                    </span>
                </div>
            </div>
            <cy-window :visible="previewExportedImageWindowVisible"
                @close-window="previewExportedImageWindowVisible = false"
                title-lang-id="Skill Simulator/Controller/main menu/preview exported image"
                class="frozen-top width-auto">
                <template v-slot:top-buttons>
                    <span class="Cyteria Button simple inline" @click="downloadExportedImage()">
                        <iconify-icon name="uil:image-download"></iconify-icon>
                        <lang-text class="text" lang-id="global/download"></lang-text>
                    </span>
                </template>
                <img src="#" ref="previewExportedImageContent" />
            </cy-window>
            <cy-window :visible="previewExportedTextWindowVisible"
                @close-window="previewExportedTextWindowVisible = false"
                title-lang-id="Skill Simulator/Controller/main menu/preview exported text"
                class="frozen-top width-auto">
                <template v-slot:top-buttons>
                    <span class="Cyteria Button simple inline" @click="copyExportedText()">
                        <iconify-icon name="mdi:content-copy"></iconify-icon>
                        <lang-text class="text" lang-id="global/copy"></lang-text>
                    </span>
                </template>
                <div class="exported-text-content" ref="previewExportedTextContent" v-html="currentExportedText"></div>
            </cy-window>
        </div>
    </article>
</template>

<script>
    import vue_iconifyIcon from "global-vue-components/iconify-icon.vue";
    import vue_svgIcon from "global-vue-components/svg-icon.vue";
    import vue_langText from "global-vue-components/lang-text.vue";
    import vuecy_window from "global-vue-components/Cyteria/window.vue";
    import vuecy_leftMenu from "global-vue-components/Cyteria/left-menu.vue";

    import Papa from "papaparse";

    import vue_skillRoot from "./skill-root.vue";
    import {Lang} from "../SkillSimulatorController.js";
    import {getSkillElementId} from "../../SkillElementMethods.js";

    import vue_SaveLoadDataSystem from "../../../../SaveLoadDataSystem/module/vue/main.vue";

    import {LevelSkillTree} from "../../SkillElements.js";

    import CY from "global-modules/cyteria.js";
    import GetLang from "global-modules/LanguageSystem.js"
    import {ShowMessage, ShowLoadingMessage, loadingFinished} from 'global-modules/ShowMessage.js';
    import {computeDrawSkillTreeData, GetDrawSetting} from "../../DrawSkillTree.js";

    export default {
        props: ['skillRoot'],
        data: function(){
            const r = this.skillRoot;

            function createSetButtonState(type, icon_ids, values, current_value){
                return {
                    type: type,
                    texts: values.map(a => Lang('main menu/' + type + ': ' + a)),
                    icons: icon_ids,
                    values: values,
                    currentIndex: values.indexOf(current_value),
                    selected: false
                };
            }

            const skillPointState = {
                mode: 'normal',
                operating: '+',
                stepValue: 5
            };

            const self = this;

            return {
                skillPointState,
                currentSkillRootStateIndex: 0,
                drawSkillTreeOptions: {
                    setSkillButtonExtraData(skill, data){
                        const w = data.gridWidth;
                        const {cx, cy} = data;
                        const tran = data.lengthTransformFunction;
                        
                        const offset = w/2 + 3;
                        const text_yFix = 1;

                        const extra_data = [];

                        if ( skill.level() != 0 ){
                            // extra_data.push({
                            //     type: 'skill-level-circle',
                            //     cx: tran(cx) + offset, cy: tran(cy) + offset,
                            //     r: w/4,
                            //     class: ['skill-level-circle']
                            // });
                            extra_data.push({
                                type: 'skill-level-text',
                                x: tran(cx) + offset, y: tran(cy) + offset + text_yFix,
                                innerText: skill.level(),
                                class: ['skill-level-text']
                            });   
                        }

                        if ( skill.starGemLevel() != 0){
                            // extra_data.push({
                            //     type: 'star-gem-level-circle',
                            //     cx: tran(cx) + offset, cy: tran(cy) - offset,
                            //     r: w/4,
                            //     class: ['star-gem-level-circle']
                            // });
                            extra_data.push({
                                type: 'star-gem-level-text',
                                x: tran(cx) - offset, y: tran(cy) + offset + text_yFix,
                                innerText: skill.starGemLevel(),
                                class: ['star-gem-level-text']
                            });
                        }
                        
                        return extra_data;
                    },
                    skillCircleClickListener(e, skill){
                        const neg = self.skillPointState.operating == '-';
                        const v = self.skillPointState.stepValue * (neg ? -1 : 1);
                        if ( self.skillPointState.mode == 'normal' ){
                            skill.addLevel(v);
                            skill.updateTree(neg && v < 5);
                        }
                        else {
                            skill.addStarGemLevel(v);
                        }
                    },
                    skillTreeType: 'level-skill-tree'
                },
                skillRootStates: [],
                currentExportedImage: null,
                currentExportedText: null,
                selectSkillTreeVisible: false,
                jumpSkillTreeShowDetail: false,
                jumpSkillTreeVisible: false,
                buildInformationVisible: false,
                previewExportedImageWindowVisible: false,
                previewExportedTextWindowVisible: false,
                setButtonStates: [
                    createSetButtonState('operating', ['ic:round-add-circle-outline',
                        'ic:round-remove-circle-outline'], ['+', '-'], skillPointState.operating),
                    createSetButtonState('step value',['mdi:numeric-1-circle-outline',
                        'mdi:numeric-5-circle-outline', 'mdi:numeric-10-circle-outline'],
                        [1, 5, 10], skillPointState.stepValue),
                    createSetButtonState('mode', ['simple-line-icons:magic-wand', 'mdi:judaism'],
                        ['normal', 'star-gem'], skillPointState.mode)
                ],
                SaveLoadDataSystemOptions: {
                    name: 'Skill Simulator',
                    saveData: () => {
                        const {type, index} = this.saveSetting();
                        const datas = [];
                        function createColumn(){
                            const t = [];
                            datas.push(t);
                            return t;
                        }
                        this.skillRootStates.forEach(sr => {
                            const p1 = createColumn(), n1 = 'skillRoot';
                            p1[index['type']] = type[n1];
                            p1[index[n1]['name']] = sr.name;
                            sr.skillTreeCategoryStates.forEach(stc => {
                                if ( !stc.visible ) return;
                                const p2 = createColumn(), n2 = 'skillTreeCategory';
                                p2[index['type']] = type[n2];
                                p2[index[n2]['id']] = stc.origin.id;
                                stc.skillTreeStates.forEach(st => {
                                    if ( !st.visible ) return;
                                    const p3 = createColumn(), n3 = 'skillTree';
                                    p3[index['type']] = type[n3];
                                    p3[index[n3]['id']] = st.origin.id;
                                    st.levelSkillTree.levelSkills.forEach(skill => {
                                        const lv = skill.level(), sglv = skill.starGemLevel();
                                        if ( lv == 0 && sglv == 0 ) return;
                                        const p4 = createColumn(), n4 = 'levelSkill';
                                        p4[index['type']] = type[n4];
                                        p4[index[n4]['id']] = skill.base.id;
                                        p4[index[n4]['level']] = lv;
                                        p4[index[n4]['starGemLevel']] = sglv;
                                    });
                                });
                            });
                        });

                        return Papa.unparse(datas);
                    },
                    loadData: str => {
                        const {type, index} = this.saveSetting();
                        let hasInit = false;
                        let cur, cur_stc, cur_st;
                        Papa.parse(str).data.forEach(p => {
                            let _type;
                            Object.keys(type).find(k => {
                                if ( type[k] == p[index['type']] ){
                                    _type = k;
                                    return true;
                                }
                            });


                            if ( _type == 'skillRoot' ){
                                if ( !hasInit ){
                                    cur = this.resetSkillRootStates();
                                    hasInit = true;
                                }
                                else {
                                    cur = createBuild();
                                }
                            }
                            else if ( _type == 'skillTreeCategory' ){
                                const id = parseInt(p[index[_type]['id']], 10);
                                cur_stc = cur.skillTreeCategoryStates.find(a => a.origin.id == id);
                                cur_stc.visible = true;
                            }
                            else if ( _type == 'skillTree' ){
                                const id = parseInt(p[index[_type]['id']], 10);
                                cur_st = cur_stc.skillTreeStates.find(a => a.origin.id == id);
                                cur_st.visible = true;
                            }
                            else if ( _type == 'levelSkill' ){
                                const id = parseInt(p[index[_type]['id']], 10);
                                const skill = cur_st.levelSkillTree.levelSkills.find(a => a.base.id == id);
                                skill.level(parseInt(p[index[_type]['level']], 10));
                                skill.starGemLevel(parseInt(p[index[_type]['starGemLevel']], 10));
                                console.log(skill);
                            }
                        });
                    },
                    saveNameList: () => {
                        return this.skillRootStates.map(a => a.name);
                    },
                    error(e){
                        console.log(e);
                    }
                }
            };
        },
        created(){
            this.createBuild();
        },
        computed: {
            currentStarGemList(){
                const list = [];
                this.currentSkillRootState.skillTreeCategoryStates.forEach(stc => {
                    stc.skillTreeStates.forEach(st => {
                        st.levelSkillTree.levelSkills.forEach(skill => {
                            if ( skill.starGemLevel() > 0 ){
                                list.push({
                                    skill,
                                    skillTreeState: st
                                });
                            }
                        });
                    });
                });
                return list;
            },
            currentSkillRootState(){
                return this.skillRootStates[this.currentSkillRootStateIndex];
            },
            noSkillTreeSelected(){
                return this.currentSkillRootState.skillTreeCategoryStates.every(a => !a.visible);
            },
            skillPointCostSum(){
                let sum = 0;
                this.currentSkillRootState.skillTreeCategoryStates.forEach(stc => {
                    if ( !stc.visible ) return;
                    stc.skillTreeStates.forEach(st => {
                        sum += this.skillTreeSkillPointCost(st);
                    });
                });
                return sum;
            },
            starGemSkillPointSum(){
                let sum = 0;
                this.currentSkillRootState.skillTreeCategoryStates.forEach(stc => {
                    if ( !stc.visible ) return;
                    stc.skillTreeStates.forEach(st => {
                        sum += this.skillTreeStarGemSkillPoint(st);
                    });
                });
                return sum;
            }
        },
        methods: {
            beforeExportConfirm(){
                const t =  this.currentSkillRootState.skillTreeCategoryStates.find(a => a.visible);
                if ( !t )
                    ShowMessage(Lang('tips/must have at least one skill tree to export'), 'ghost', 'must have at least one skill tree to export');
                return t;
            },
            copyExportedText(){
                if ( CY.copyToClipboard(this.$refs.previewExportedTextContent.innerText) )
                    ShowMessage(GetLang('global/copy to clipboard finished'));
            },
            downloadExportedImage(){
                if ( this.currentExportedImage == null ){
                    ShowMessage(Lang('tips/download exported image: error'));
                    return;
                }
                const a = document.createElement('a');
                a.setAttribute('href', this.currentExportedImage);
                a.setAttribute('download', this.currentSkillRootState.name + '.png');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            exportCurrentBuildText(){
                if ( !this.beforeExportConfirm() ) return;
                let res = '', starGems = [];

                this.currentSkillRootState.skillTreeCategoryStates.forEach((stc, i) => {
                    if ( !stc.visible ) return;
                    stc.skillTreeStates.forEach((st, j) => {
                        if ( !st.visible ) return;
                        res += st.origin.name + '<br />';
                        st.levelSkillTree.levelSkills.forEach((skill, k) => {
                            const lv = skill.level();
                            if ( lv > 0 )
                                res += '｜' + skill.base.name + ' Lv.' + lv + '<br />';
                            if ( skill.starGemLevel() > 0 )
                                starGems.push(skill);
                        });
                        res += '<br />';
                    });
                });
                if ( starGems.length != 0 ){
                    res = Lang('main menu/star gem list') + '<br />'
                        + starGems.reduce((c, p) => c + '｜' + p.base.name + ' Lv.' + p.starGemLevel() + '<br />', '')
                        + '<br />' + res;
                }

                let top = '｜' + Lang('exported image inner text/skill point cost sum', [this.
                    skillPointCostSum]) + '<br />';
                top += '｜' + Lang('exported image inner text/star gem skill point sum', [this.starGemSkillPointSum]) + '<br />';
                top += '<br />';

                res = top + res;

                res += Lang('export watermark');

                this.currentExportedText = res;
                this.previewExportedTextWindowVisible = true;
                this.buildInformationVisible = false;
            },
            async exportCurrentBuildImage(){
                if ( !this.beforeExportConfirm() ) return;
                try {
                    await ShowLoadingMessage(Lang('tips/export build image: loading message'));
                    const drawSetting = GetDrawSetting();

                    const cur_build = this.currentSkillRootState;
                    const body_cs = getComputedStyle(document.body);
                    const pcolorl = body_cs.getPropertyValue('--primary-light'),
                        pcolor3 = body_cs.getPropertyValue('--primary-light-3'),
                        pcolor4 = body_cs.getPropertyValue('--primary-light-4'),
                        fontFamily = body_cs.getPropertyValue('font-family');

                    // icon
                    const skillPointCostSvgIconString = `<svg xmlns="http://www.w3.org/2000/svg" width="16.64px" height="16px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1056 1024"><path d="M1037 429L934 276l51-179q5-18-8.5-31.5T945 57l-178 52L612 6q-15-11-32-2.5T562 31l-5 186l-147 115q-6 5-9.5 13t-1.5 17q0 3 1.5 6.5t3 6t4 5t5.5 4.5t6 3l138 49q-3 2-3 3L23 969q-6 6-8 14.5t0 16.5t8 15q10 9 23 9t23-9l530-531q3-3 5-7l54 148q7 17 25 20q3 1 5 1q16 0 26-13l113-147l184-7q9 0 16.5-4.5T1039 462q8-17-2-33zm-227-6q-15 0-24 12l-88 113l-49-134q-5-14-19-19l-134-49l112-88q4-3 6.5-6.5t4-8t1.5-9.5l5-143l118 80q13 8 27 4l137-40l-39 137q-1 3-1 6v5.5l.5 5.5l2 5.5l2.5 4.5l81 118z" fill="${pcolor3}"></path></svg>`;
                    const svgIconData = {
                        skillPointCost: {
                            src: 'data:image/svg+xml;base64,' + window.btoa(skillPointCostSvgIconString),
                            loadedImage: null
                        },
                        potum: {
                            src: './src/picture/icon/favicon48.png',
                            loadedImage: null
                        }
                    };
                    //
                    const drawDatas = [],
                        main_canvases = [],
                        starGemDatas = [];

                    cur_build.skillTreeCategoryStates.forEach((stc, i) => {
                        if ( !stc.visible ) return;
                        stc.skillTreeStates.forEach((st, j) => {
                            if ( !st.visible ) return;
                            const drawData = computeDrawSkillTreeData(st.levelSkillTree, {
                                setSkillButtonExtraData: this.drawSkillTreeOptions.setSkillButtonExtraData,
                                skillTreeType: 'level-skill-tree'
                            });
                            drawData.skillTree = st.origin;
                            drawData.levelSkillTree = st.levelSkillTree;
                            drawDatas.push(drawData);
                        });
                    });

                    await Promise.all([
                        ...Object.values(svgIconData).map(imgData => {
                            const img = document.createElement('img');
                            return new Promise((resolve, reject) => {
                                img.src = imgData.src;
                                img.addEventListener('load', function img_load(e){
                                    img.removeEventListener('load', img_load);
                                    imgData.loadedImage = img;
                                    resolve();
                                });
                            });
                        }),
                        ...drawDatas.map(drawData => {
                            return Promise.all(drawData.data
                                .filter(p => p.type == 'skill-circle')
                                .map(p => {
                                    const img = document.createElement('img');
                                    return new Promise((resolve, reject) => {
                                        p.skill.starGemLevel() > 0 && starGemDatas.push(p);

                                        img.src = p.path.slice(1);
                                        img.addEventListener('load', function img_load(e){
                                            img.removeEventListener('load', img_load);
                                            p.loadedImage = img;
                                            resolve();
                                        });
                                    });
                                })
                            );
                        })
                    ]);

                    const title_text_middle_y = 31,
                        title_preRect_w = 3,
                        title_preRect_h = 25,
                        title_preRect_pdt = 16,
                        title_preRect_pdl = 16,
                        title_preRect_pdr = 12,
                        left_icon_scope_mr = 16,
                        left_icon_scope_icon_w = 16,
                        left_icon_scope_icon_pl = 12,
                        left_icon_scope_text_ml = 8,
                        st_extra_top_pd = 12,
                        skill_icon_width = (drawSetting.gridWidth - drawSetting.iconPadding * 2),
                        topInfo_topBottomPd = 16,
                        topInfo_icon_h = 48,
                        topInfo_icon_mr = 12,
                        topInfo_text_h = 25,
                        topInfo_h_sum = topInfo_topBottomPd * 2 + topInfo_text_h * 2,
                        watermark_line_h = 50,
                        starGemScope_topBottomPd = 16,
                        sgc_margin = 10, //sgc: star gem column
                        sgc_icon_mr = 10,
                        sgc_w = 240,
                        sgc_lineCount = Math.floor((starGemDatas.length + 1) / 2),
                        sgc_icon_pd = drawSetting.iconPadding,
                        starGemScope_h_sum = title_preRect_pdt + title_preRect_h
                            + starGemScope_topBottomPd
                            + sgc_lineCount * (skill_icon_width + sgc_icon_pd * 2)
                            + (sgc_lineCount - 1) * sgc_margin
                            + starGemScope_topBottomPd;

                    function skillIconGrdAddColors(grd){
                        grd.addColorStop(0, "white");
                        grd.addColorStop(0.5, "#FFD1EA");
                        grd.addColorStop(1, "#f7a8d3");
                    }

                    const final_w = Math.max(500, ...drawDatas.map(p => p.width)),
                        final_h = drawDatas.reduce(
                            (c, p) => c + p.height + st_extra_top_pd,
                            watermark_line_h
                            + topInfo_h_sum
                            + (starGemDatas.length != 0 ? starGemScope_h_sum : 0)
                        );

                    drawDatas.forEach(drawData => {
                        const canvas = document.createElement('canvas');
                        const st_w = drawData.width, st_h = drawData.height;
                        canvas.width = final_w;
                        canvas.height = st_h;
                        const ctx = canvas.getContext('2d');

                        drawData.data.forEach(p => {
                            ctx.beginPath();
                            if ( p.type == 'skill-circle' ){
                                const grd = ctx.createLinearGradient(p.cx, p.cy - p.r, p.cx, p.cy + p.r);
                                skillIconGrdAddColors(grd);
                                ctx.fillStyle = grd;
                                ctx.strokeStyle = '#ff5fb7';
                                ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.stroke();
                                const ir = skill_icon_width / 2;
                                ctx.drawImage(p.loadedImage, p.cx - ir, p.cy - ir, 2 * ir, 2 * ir);
                            }
                            else if ( p.type == 'tree-line' ){
                                ctx.moveTo(p.x1, p.y1);
                                ctx.lineTo(p.x2, p.y2);
                                ctx.strokeStyle = pcolorl;
                                ctx.lineWidth = 2;
                                ctx.stroke();
                            }
                            else if ( p.type == 'tree-dot' ){
                                ctx.strokeStyle = pcolorl;
                                ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            else if ( p.type == 'skill-level-text' || p.type == 'star-gem-level-text' ){
                                ctx.font = "1rem 'Itim'";
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = body_cs.getPropertyValue(
                                    p.type == 'skill-level-text'
                                    ? '--primary-light-4' : '--primary-water-blue');
                                ctx.fillText(p.innerText, p.x, p.y);
                            }
                        });

                        ctx.font = '1.1rem ' + fontFamily;
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = pcolor4;

                        const yf = title_preRect_pdt - st_extra_top_pd;
                        const title_text_y = title_text_middle_y - st_extra_top_pd;
                        
                        ctx.fillRect(title_preRect_pdl, title_preRect_pdt - st_extra_top_pd, title_preRect_w, title_preRect_h);
                        ctx.fillText(drawData.skillTree.name,
                            title_preRect_pdl + title_preRect_w + title_preRect_pdr, title_text_y);

                        const spc = drawData.levelSkillTree.skillPointCost();
                        const spc_w = ctx.measureText(spc).width;

                        ctx.textAlign = 'right';
                        ctx.fillText(spc, final_w - title_preRect_pdl, title_text_y);
                        ctx.drawImage(svgIconData.skillPointCost.loadedImage,
                            final_w
                             - (left_icon_scope_mr
                                + left_icon_scope_text_ml
                                + left_icon_scope_icon_w
                            ) - spc_w,
                            title_text_y - left_icon_scope_icon_w / 2);

                        main_canvases.push({
                            canvas: canvas,
                            width: st_w,
                            height: st_h
                        });
                    });

                    const final_canvas = document.createElement('canvas');
                    final_canvas.width = final_w;
                    final_canvas.height = final_h;
                    
                    const fctx = final_canvas.getContext('2d');

                    // background
                    fctx.fillStyle = body_cs.getPropertyValue('background-color');
                    fctx.fillRect(0, 0, final_w, final_h);

                    // init
                    let cur_y = 0;
                    fctx.font = '1rem ' + fontFamily;
                    fctx.textBaseline = 'middle';
                    fctx.fillStyle = pcolor4;

                    fctx.textAlign = 'left';

                    // top info
                    {
                        const spcs = Lang('exported image inner text/skill point cost sum', [this.skillPointCostSum]),
                            sgsps = Lang('exported image inner text/star gem skill point sum', [this.starGemSkillPointSum]);
                        const topInfo_contanier_w = Math.max(fctx.measureText(spcs).width, fctx.measureText(sgsps).width) + topInfo_icon_h + topInfo_icon_mr;
                        const topInfo_icon_left = (final_w - topInfo_contanier_w) / 2,
                            topInfo_icon_top = (topInfo_h_sum - topInfo_icon_h) / 2,
                            topInfo_text_left = topInfo_icon_left + topInfo_icon_h + topInfo_icon_mr;

                        fctx.drawImage(svgIconData.potum.loadedImage, topInfo_icon_left, topInfo_icon_top);

                        cur_y += topInfo_topBottomPd + topInfo_text_h / 2;
                        fctx.fillText(spcs, topInfo_text_left, cur_y);
                        cur_y += topInfo_text_h;
                        fctx.fillText(sgsps, topInfo_text_left, cur_y);
                        cur_y += topInfo_text_h / 2 + topInfo_topBottomPd;
                    }
                    
                    // star gem list
                    if ( starGemDatas.length > 0 ){
                        fctx.fillRect(title_preRect_pdl, cur_y + title_preRect_pdt, title_preRect_w, title_preRect_h);
                        fctx.fillText(Lang('main menu/star gem list'),
                            title_preRect_pdl + title_preRect_w + title_preRect_pdr, cur_y + title_text_middle_y);
                        cur_y += title_preRect_pdt + title_preRect_h + starGemScope_topBottomPd;

                        const sgc_left1 = (final_w - 2 * sgc_w - sgc_margin) / 2,
                            sgc_left2 = sgc_left1 + sgc_w + sgc_margin,
                            icon_width_sum = sgc_icon_pd * 2 + skill_icon_width;
                        starGemDatas.forEach((p, i, ary) => {
                            const left = i % 2 == 0 ? sgc_left1 : sgc_left2;
                            const icon_mid = left + icon_width_sum / 2,
                                icon_r = icon_width_sum / 2;
                            const grd = fctx.createLinearGradient(icon_mid, cur_y, icon_mid, cur_y + icon_width_sum);
                            skillIconGrdAddColors(grd);
                            const icon_cy = cur_y + icon_r;
                            fctx.beginPath();
                            fctx.arc(icon_mid, icon_cy, icon_r, 0, Math.PI * 2);
                            fctx.fill();
                            fctx.drawImage(p.loadedImage, left + sgc_icon_pd, cur_y + sgc_icon_pd, skill_icon_width, skill_icon_width);
                            fctx.fillText(p.skill.base.name + ' Lv.' + p.skill.starGemLevel(), left + icon_width_sum + sgc_icon_mr, icon_cy);
                            if (i % 2 == 1 && i != ary.length - 1)
                                cur_y += skill_icon_width + sgc_margin + sgc_icon_pd * 2;
                        });
                        cur_y += skill_icon_width + starGemScope_topBottomPd;
                    }

                    // all skill trees
                    cur_y += st_extra_top_pd;
                    fctx.strokeStyle = pcolorl;
                    main_canvases.forEach(p => {
                        cur_y += 1;
                        fctx.beginPath();
                        fctx.moveTo(0, cur_y);
                        fctx.lineTo(final_w, cur_y);
                        fctx.stroke();

                        cur_y += (1 + st_extra_top_pd);

                        fctx.drawImage(p.canvas, 0, cur_y);
                        cur_y += p.height;
                    });

                    // watermark
                    cur_y += 1;
                    fctx.beginPath();
                    fctx.moveTo(0, cur_y);
                    fctx.lineTo(final_w, cur_y);
                    fctx.stroke();
                    fctx.textAlign = 'right';
                    fctx.fillText(Lang('export watermark'), final_w - 10, cur_y + 20);

                    // finale
                    const imgc = this.$refs.previewExportedImageContent;
                    this.currentExportedImage = final_canvas.toDataURL('image/png', 1);
                    imgc.src = this.currentExportedImage;
                    this.previewExportedImageWindowVisible = true;
                }
                catch(e) {
                    console.log(e);
                    this.currentExportedImage = null;
                    ShowMessage(Lang('tips/export build image: error'));
                }
                finally {
                    this.buildInformationVisible = false;
                    loadingFinished();
                }
            },
            deleteCurrentBuild(){
                if ( this.skillRootStates.length == 1 ){
                    ShowMessage(Lang('tips/number of build cannot be less than 1'), 'iconify/ic:round-remove-circle-outline', 'number of build cannot be less than 1');
                    return;
                }
                const cur_index = this.currentSkillRootStateIndex;
                const cur_build = this.skillRootStates[cur_index];
                this.skillRootStates.splice(cur_index, 1);
                if ( cur_index >= this.skillRootStates.length )
                    this.currentSkillRootStateIndex = this.skillRootStates.length - 1;
                ShowMessage(Lang('tips/delete build message', [cur_build.name]), 'done', null, {
                    messageClick: () => {
                        this.skillRootStates.splice(cur_index, 0, cur_build);
                        this.currentSkillRootStateIndex = cur_index;
                        ShowMessage(Lang('tips/recovery delete build message', [cur_build.name]), 'done');
                    },
                    removeMessageAfterClick: true
                });

                this.buildInformationVisible = false;
            },
            copyCurrentBuild(){
                const cur_build = this.currentSkillRootState;
                const new_build = this.createBuild();

                cur_build.skillTreeCategoryStates.forEach((stc, i) => {
                    if ( !stc.visible ) return;
                    const t1 = new_build.skillTreeCategoryStates[i];
                    t1.visible = true;
                    stc.skillTreeStates.forEach((st, j) => {
                        if ( !st.visible ) return;
                        const t2 = t1.skillTreeStates[j];
                        t2.visible = true;
                        st.levelSkillTree.levelSkills.forEach((skill, k) => {
                            const t3 = t2.levelSkillTree.levelSkills[k];
                            t3.level(skill.level());
                            t3.starGemLevel(skill.starGemLevel());
                        });
                    });
                });

                this.buildInformationVisible = false;
                ShowMessage(Lang('tips/copy build message', [cur_build.name, new_build.name], 'done'));
            },
            resetSkillRootStates(){
                this.skillRootStates = [];
                this.currentSkillRootStateIndex = 0;
                return this.createBuild();
            },
            saveSetting(){
                const type = {
                    'skillRoot': 0,
                    'skillTreeCategory': 1,
                    'skillTree': 2,
                    'levelSkill': 3
                };
                const index = {
                    type: 0,
                    'skillRoot': {
                        name: 1
                    },
                    'skillTreeCategory': {
                        id: 1
                    },
                    'skillTree': {
                        id: 1
                    },
                    'levelSkill': {
                        id: 1,
                        level: 2,
                        starGemLevel: 3
                    }
                };
                return {type, index};
            },
            selectCurrentSkillRootState(i){
                this.currentSkillRootStateIndex = i;
                this.skillRootStates.forEach(p => p.editName = false);
            },
            createBuild(){
                const r = this.skillRoot;
                const newState = {
                    name: Lang('build') + ' ' + (this.skillRootStates.length + 1),
                    origin: r,
                    skillTreeCategoryStates: r.skillTreeCategorys.map(stc => {
                        return {
                            origin: stc,
                            visible: false,
                            skillTreeStates: stc.skillTrees.map(st => {
                                const lst = new LevelSkillTree(st);
                                st.skills.forEach(skill => lst.appendLevelSkill(skill));
                                return {
                                    origin: st,
                                    levelSkillTree: lst,
                                    visible: false,
                                    drawOptions: {
                                        skillTree: lst,
                                        ...this.drawSkillTreeOptions
                                    }
                                };
                            })
                        };
                    })
                };
                this.skillRootStates.push(newState);
                this.currentSkillRootStateIndex = this.skillRootStates.length - 1;

                return newState;
            },
            skillTreeStarGemSkillPoint(st){
                if ( !st.visible ) return 0;
                return st.levelSkillTree.starGemSkillPoint();
            },
            skillTreeSkillPointCost(st){
                if ( !st.visible ) return 0;
                return st.levelSkillTree.skillPointCost();
            },
            toggleJumpSkillTreeShowDetail(){
                this.jumpSkillTreeShowDetail = !this.jumpSkillTreeShowDetail;
            },
            openBuildInformation(){
                this.buildInformationVisible = !this.buildInformationVisible;
                this.jumpSkillTreeVisible = false;
                this.selectSkillTreeVisible = false;
            },
            openSelectSkillTree(){
                this.selectSkillTreeVisible = !this.selectSkillTreeVisible;
                this.jumpSkillTreeVisible = false;
                this.buildInformationVisible = false;
            },
            openJumpSkillTree(){
                this.jumpSkillTreeVisible = !this.jumpSkillTreeVisible;
                this.selectSkillTreeVisible = false;
                this.buildInformationVisible = false;
            },
            toggleSkillTreeVisible(stc, st){
                if ( !st.visible ){
                    stc.visible = true;
                    st.visible = true;
                }
                else {
                    stc.visible = !stc.skillTreeStates.every(a => !a.visible);
                    st.visible = false;
                }
            },
            openSetButtonMenu(type){
                const t = this.setButtonStates.forEach(p => {
                    p.type == type
                        ? (p.selected = !p.selected)
                        : (p.selected && (p.selected = false));
                });
            },
            setButtonSelected(type, index){
                const s = this.setButtonStates.find(p => p.type == type);
                s.currentIndex = index;
                if ( type == 'operating' )
                    this.skillPointState.operating = s.values[index];
                if ( type == 'step value' )
                    this.skillPointState.stepValue = s.values[index];
                if ( type == 'mode' )
                    this.skillPointState.mode = s.values[index];
            },
            jumpToSkillTree(st){
                document.getElementById('skill-tree--' + getSkillElementId(st)).scrollIntoView({
                    behavior: "smooth"
                });
                this.jumpSkillTreeVisible = false;
            }
        },
        components: {
            'skill-root': vue_skillRoot,
            'iconify-icon': vue_iconifyIcon,
            'svg-icon': vue_svgIcon,
            'lang-text': vue_langText,
            'cy-window': vuecy_window,
            'cy-left-menu': vuecy_leftMenu,
            'save-load-data-system': vue_SaveLoadDataSystem
        }
    };
</script>

<style lang="less" scoped>
    .main {
        & > .top {
            z-index: 3;
            & > .content {
                overflow: visible!important;
                background-color: transparent!important;
                padding-right: 0.6rem;

                & > .button {
                    z-index: 6;
                }

                & > .inner-menu {
                    position: absolute;
                    top: 0.4rem;
                    right: 0;
                    z-index: 5;
                    padding: 0.6rem 1rem;
                    padding-top: 2rem;
                    border: 1px solid var(--primary-light-2);
                    background-color: var(--white);
                    width: 31.2rem;
                    max-width: 100%;
                    max-height: calc(100vh - 5rem);
                    overflow-y: auto;
                    white-space: normal;
                    
                    & > .default-tips {
                        padding: 1rem 0.2rem;
                        text-align: center;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    & > .default-tips > .container {
                        display: flex;
                        align-items: center;
                        white-space: normal;

                        & > svg {
                            color: var(--primary-light-2);
                            width: 3rem;
                            height: 3rem;
                            margin-right: 1rem;
                        }
                    }

                    &::-webkit-scrollbar {
                        width: 0.5rem;
                    }
                    &::-webkit-scrollbar-thumb {
                        background-color: var(--primary-light-2);
                        border-radius: 0.22rem;
                        transition: 0.3s;
                    }
                    &::-webkit-scrollbar-thumb:hover {
                        background-color: var(--primary-light-4);
                    }

                    & > .title {
                        font-size: 0.9rem;
                        margin-bottom: 0.2rem;
                        color: var(--primary-light-3);
                    }
                    & > .content {
                        display: grid;
                        grid-template-columns: 50% 50%;
                        margin-bottom: 0.4rem;
                    }
                    & > .buttons-content {
                        padding: 0.6rem 0.4rem;
                    }
                }
            }
        }
        & > .bottom-menu {
            position: sticky;
            bottom: 0;
            z-index: 2;

            & > .skill-point-information {
                text-align: right;
                padding: 0.2rem;
                & > .Cyteria.scope-icon {
                    margin-right: 1rem;
                }
            }

            & > .content {
                border-top: 1px solid var(--primary-light);
                padding: 0.3rem 0;
                background-color: var(--white);
                padding-bottom: 0.4rem;
                display: flex;
                align-items: center;
                position: relative;
                
                & > .set-button {
                    position: relative;
                    z-index: 5;
    
                    & > .Cyteria.Button {
                        height: 2rem;
                    }
                    &.selected {
                        z-index: 6;

                        & > .Cyteria.Button {
                            position: relative;
                        }
                    }

                    & > .inner-button {
                        position: relative;
                    }
                    & > .select-menu {
                        position: absolute;
                        left: 0;
                        bottom: -0.4rem;
                        border: 1px solid var(--primary-light-2);
                        padding: 0.6rem;
                        background-color: var(--white);
                        padding-bottom: 2.4rem;
                        max-width: 20rem;
                    }
                }
            }
        }

        .inner-menu-enter, .inner-menu-leave-to {
            opacity: 0;
        }
        .inner-menu-enter-active, .inner-menu-leave-active {
            transition: 0.3s ease;
        }
        .fade-enter, .fade-leave-to {
            opacity: 0;
        }
        .fade-enter-active, .fade-leave-active {
            transition: 0.3s ease;
        }

        .exported-text-content {
            border: 1px solid var(--primary-light);
            padding: 1rem;
        }
    }

    @media screen and (max-width: 30rem) {
        .main > .top > .content > .inner-menu > .content {
            grid-template-columns: 100%;
        }
    }
</style>