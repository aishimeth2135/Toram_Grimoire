<template>
    <article>
        <div class="main">
            <div class="Cyteria Layout sticky-header transparent top">
                <div class="content">
                    <cy-left-menu>
                        <div class="column">
                            <template v-for="(state, i) in skillRootStates">
                                <transition name="fade">
                                    <span class="Cyteria Button line selection"
                                        :class="{'selected': currentSkillRootStateIndex == i}"
                                        @click="selectCurrentSkillRootState(i)">
                                        <iconify-icon name="si-glyph:book-3"></iconify-icon>
                                        <span v-show="!state.editName" class="text build-name">{{ state.name }}</span>
                                        <input v-show="state.editName" type="text" class="Cyteria input text w8" v-model="state.name" @click.stop />
                                        <iconify-icon class="content-right" @click.native.stop="editBuildName(i)"
                                            :name="state.editName ? 'mdi:done' : 'ic:round-edit'"></iconify-icon>
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
                    <span class="Cyteria Button icon-only button start" @click="openMenuWindow()">
                        <iconify-icon name="mdi:cube-outline"></iconify-icon>
                    </span>
                    <span class="Cyteria Button icon-only button" @click="openJumpSkillTree()"
                        :class="{selected: jumpSkillTreeVisible}"
                        data-user-guide-set="2-1">
                        <iconify-icon name="dashicons:flag"></iconify-icon>
                    </span>
                    <span class="Cyteria Button icon-only button" @click="openSelectSkillTree()"
                        :class="{selected: selectSkillTreeVisible}"
                        data-user-guide-set="1-1">
                        <iconify-icon name="ic:round-library-add"></iconify-icon>
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
                            <div class="top Cyteria line-space-bottom" v-if="!noSkillTreeSelected">
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
                            <template v-for="(stc, index) in currentSkillRootState.skillTreeCategoryStates">
                                <div class="title" v-show="stc.visible">{{ stc.origin.name }}</div>
                                <div class="content" v-show="stc.visible">
                                    <template v-for="(st, index2) in stc.skillTreeStates"
                                        v-if="st.visible">
                                        <span v-show="jumpSkillTreeShowDetail"
                                            @click="jumpToSkillTree(st.origin)"
                                            class="Cyteria Button line icon-small multiple-line">
                                            <div class="content">
                                                <svg-icon icon-id="rabbit-book"></svg-icon>
                                                <span class="text">{{ st.origin.name }}</span>
                                            </div>
                                            <div class="extra-line">
                                                <span class="Cyteria scope-icon text-small space-right">
                                                    <iconify-icon name="simple-line-icons:magic-wand"></iconify-icon>
                                                    <span class="text">{{ skillTreeSkillPointCost(st) }}</span>
                                                </span>
                                                <span class="Cyteria scope-icon text-small">
                                                    <iconify-icon name="mdi:judaism"></iconify-icon>
                                                    <span class="text">{{ skillTreeStarGemSkillPoint(st) }}</span>
                                                </span>
                                            </div>
                                        </span>
                                        <span v-show="!jumpSkillTreeShowDetail"
                                            @click="jumpToSkillTree(st.origin)"
                                            class="Cyteria Button line icon-small">
                                            <svg-icon icon-id="rabbit-book"></svg-icon>
                                            <span class="text">{{ st.origin.name }}</span>
                                        </span>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </transition>
                </div>
            </div>
            <skill-root :skill-root-state="currentSkillRootState"></skill-root>
            <div class="bottom-menu">
                <div class="skill-point-information">
                    <span class="Cyteria scope-icon space-right" data-user-guide-set="4-1">
                        <iconify-icon name="simple-line-icons:magic-wand"></iconify-icon>
                        <span class="text">{{ skillPointCostSum }}</span>
                    </span>
                    <span class="Cyteria scope-icon" data-user-guide-set="5-1">
                        <iconify-icon name="mdi:judaism"></iconify-icon>
                        <span class="text">{{ starGemSkillPointSum }}</span>
                    </span>
                </div>
                <div class="content">
                    <span v-for="(state, index) in setButtonStates"
                        @click="openSetButtonMenu(state.type)"
                        :class="{selected: state.selected}"
                        class="set-button" data-user-guide-set="3-1">
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
                            <span class="text">{{ state.texts[state.currentIndex] }}</span>
                        </span>
                    </span>
                </div>
            </div>
            <cy-window title-lang-id="global/menu" :visible="mainMenuVisible" @close-window="closeMenuWindow">
                
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
                selectSkillTreeVisible: false,
                jumpSkillTreeShowDetail: false,
                jumpSkillTreeVisible: false,
                mainMenuVisible: false,
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
                        this.skillTreeStates.forEach(sr => {
                            const p1 = createColumn(), n1 = 'skillRoot';
                            p1[index[type]] = type[n1];
                            p1[index[n1]['name']] = sr.name;
                            sr.skillTreeCategoryStates.forEach(stc => {
                                if ( !stc.visible ) return;
                                const p2 = createColumn(), n2 = 'skillTreeCategory';
                                p2[index[type]] = type[n2];
                                p2[index[n2]['id']] = stc.origin.id;
                                stc.skillTreeStates.forEach(st => {
                                    if ( !st.visible ) return;
                                    const p3 = createColumn(), n3 = 'levelSkillTree';
                                    p3[index[type]] = type[n3];
                                    p3[index[n3]['id']] = st.origin.id;
                                    st.levelSkillTree.levelSkills.forEach(skill => {
                                        const p4 = createColumn(), n4 = 'levelSkill';
                                        p4[index[type]] = type[n4];
                                        p4[index[n4]['id']] = skill.base.id;
                                        p4[index[n4]['level']] = skill.level();
                                        p4[index[n4]['starGemLevel']] = skill.starGemLevel();
                                    });
                                });
                            });
                        });
                    },
                    loadData: str => {
                        const {type, index} = this.saveSetting();
                        let hasInit = false;
                        let cur, cur_stc, cur_st;
                        Papa.parse(str).forEach(p => {
                            let _type;
                            Object.keys(type).find(k => {
                                if ( type[k] == p[index[type]] ){
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
                            }
                        });
                    }
                }
            };
        },
        created(){
            this.createBuild();
        },
        computed: {
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
                    'skill': 3
                };
                const index = {
                    type: 0,
                    'skillRoot': {
                        name: 1
                    },
                    'skillTreeCategory': {
                        id: 1
                    },
                    'levelSkillTree': {
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
            editBuildName(i){
                if ( this.skillRootStates[i].editName ){
                    this.skillRootStates[i].editName = false;
                    return;
                }
                this.skillRootStates.forEach((p, j) => p.editName = (j == i));
            },
            createBuild(){
                const r = this.skillRoot;
                const newState = {
                    name: Lang('build') + ' ' + (this.skillRootStates.length + 1),
                    editName: false,
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

                return newState;
            },
            openMenuWindow(){
                this.mainMenuVisible = true;
            },
            closeMenuWindow(){
                this.mainMenuVisible = false;
            },
            skillTreeStarGemSkillPoint(st){
                if ( !st.visible ) return 0;
                return st.levelSkillTree.levelSkills
                    .reduce((c, skill) => c + Math.max(0, skill.starGemLevel() - skill.level()), 0);
            },
            skillTreeSkillPointCost(st){
                if ( !st.visible ) return 0;
                return st.levelSkillTree.levelSkills
                    .reduce((c, skill) => c + skill.level(), 0);
            },
            toggleJumpSkillTreeShowDetail(){
                this.jumpSkillTreeShowDetail = !this.jumpSkillTreeShowDetail;
            },
            openSelectSkillTree(){
                this.selectSkillTreeVisible = !this.selectSkillTreeVisible;
                this.jumpSkillTreeVisible = false;
            },
            openJumpSkillTree(){
                this.jumpSkillTreeVisible = !this.jumpSkillTreeVisible;
                this.selectSkillTreeVisible = false;
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
                console.log('skill-tree--' + getSkillElementId(st));
                document.getElementById('skill-tree--' + getSkillElementId(st)).scrollIntoView();
                this.selectSkillTreeVisible = false;
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
                        width: 0.6rem;
                    }
                    &::-webkit-scrollbar-thumb {
                        background-color: var(--primary-light-2);
                        border-radius: 0.3rem;
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
                
                & > .set-button {
                    position: relative;
                    z-index: 5;

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
            transition: 0.4s ease;
        }
        .fade-enter, .fade-leave-to {
            opacity: 0;
        }
        .fade-enter-active, .fade-leave-active {
            transition: 0.4s ease;
        }
    }
    .build-name  {
        max-width: 8rem;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    @media screen and (max-width: 25rem) {
        .main > .top > .content > .inner-menu > .content {
            grid-template-columns: 100%;
        }
    }
</style>