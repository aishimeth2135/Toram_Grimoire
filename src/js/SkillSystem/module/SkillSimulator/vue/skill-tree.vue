<template>
    <div class="skill-tree" :id="skillTreeId">
        <div class="Cyteria Layout sticky-header top">
            <div class="content">
                <span class="Cyteria scope-icon">
                    <svg-icon icon-id="rabbit-book"></svg-icon>
                    <span class="text">{{ skillTreeState.origin.name }}</span>
                </span>
            </div>
        </div>
        <div class="tree-content">
            <draw-skill-tree v-bind="skillTreeState.drawOptions"></draw-skill-tree>
        </div>
    </div>
</template>

<script>
    import vue_iconifyIcon from "global-vue-components/iconify-icon.vue";
    import vue_svgIcon from "global-vue-components/svg-icon.vue";
    import vue_langText from "global-vue-components/lang-text.vue";

    import vue_drawSkillTree from "./draw-skill-tree.vue";

    import {getSkillElementId} from "../../SkillElementMethods.js";

    export default {
        props: ['skillTreeState'],
        computed: {
            skillTreeId(){
                return 'skill-tree--' + getSkillElementId(this.skillTreeState.origin);
            }
        },
        components: {
            'draw-skill-tree': vue_drawSkillTree,
            'iconify-icon': vue_iconifyIcon,
            'svg-icon': vue_svgIcon
        }
    };
</script>

<style lang="less" scoped>
    .skill-tree {
        border-top: 1px solid var(--primary-light);
    }
    .top > .content {
        padding-left: 2.4rem;
    }
    .tree-content {
        overflow-y: auto;
        width: 100%;
    }
</style>