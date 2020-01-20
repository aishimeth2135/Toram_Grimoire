<template>
    <svg class="DrawSkillTree--main" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        :width="width" :height="height">
        <defs v-once>
            <template v-for="(p, index) in skillIconPatternData">
                <pattern :id="p.id" :width="p.width" :height="p.height">
                    <template v-for="(q, index2) in p.elements">
                        <circle v-if="q.type == 'circle'" :cx="q.cx" :cy="q.cy" :r="q.r" :class="q.class" />
                        <image v-else-if="q.type == 'image'" @error="skillIconImageNotFound($event)"
                            :xlink:href="q.path" :x="q.x" :y="q.y" :width="q.width" :height="q.height" />
                    </template>
                </pattern>
            </template>
        </defs>
        <template v-for="(p, index) in drawTreeData">
            <circle v-if="p.type == 'skill-circle'" @click="skillCircleClick($event, p.skill)" :cx="p.cx" :cy="p.cy" :r="p.r" :class="p.class" :style="p.style" />
            <circle v-else-if="p.type == 'tree-dot'"
                :cx="p.cx" :cy="p.cy" :r="p.r" :class="p.class" />
            <text   v-else-if="p.type == 'skill-name'"
                :x="p.x" :y="p.y" :class="p.class">
                {{ p.innerText }}
            </text>
            <line   v-else-if="p.type == 'tree-line'"
                :x1="p.x1" :y1="p.y1" :x2="p.x2" :y2="p.y2" />
            <circle v-else-if="p.type == 'skill-level-circle' || p.type == 'star-gem-level-circle'"
                :cx="p.cx" :cy="p.cy" :r="p.r" :class="p.class" />
            <text   v-else-if="p.type == 'skill-level-text' || p.type == 'star-gem-level-text'"
                :x="p.x" :y="p.y" :class="p.class">
                {{ p.innerText }}
            </text>
        </template>
    </svg>
</template>

<script>
    import {computeDrawSkillTreeData, getSkillIconPatternData} from "../../DrawSkillTree.js";
    import {SkillTree, LevelSkillTree} from "../../SkillElements.js";

    function DoNothing(){
        // do nothing
    }

    export default {
        props: {
            skillTree: [SkillTree, LevelSkillTree],
            setSkillButtonExtraData: {
                type: Function,
                default: (skill, data) => [],
            },
            skillCircleClickListener: {
                type: Function,
                default: DoNothing
            },
            skillTreeType: {
                type: String,
                validator: v => ['normal', 'level-skill-tree'].indexOf(v) != -1
            }
        },
        data: function(){
            const self = this;
            return {
                width: 0,
                height: 0
            }
        },
        computed: {
            drawTreeData(){
                const t = computeDrawSkillTreeData(this.skillTree, {
                    setSkillButtonExtraData: this.setSkillButtonExtraData,
                    skillTreeType: this.skillTreeType
                });
                this.width = t.width;
                this.height = t.height;
                return t.data;
            },
            skillIconPatternData(){
                return getSkillIconPatternData(this.skillTree.base);
            }
        },
        methods: {
            skillCircleClick(e, skill){
                this.skillCircleClickListener(e, skill);
            },
            skillIconImageNotFound(e){
                e.target.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '../src/picture/skill_icons/unknow.svg');
            }
        }
    }
</script>

<style lang="less" scoped>
    circle.skill-level-circle {
        fill: #ff5fb7;
        stroke: none;
    }
    circle.skill-level-circle.is-zero {
        fill: #f7a8d3;
    }
    text.skill-level-text {
        fill: var(--primary-light-4);
        text-anchor: middle;
        stroke-width: 0;
        dominant-baseline: middle;
    }

    circle.star-gem-level-circle {
        fill: #2196f3;
        stroke: none;
    }
    circle.star-gem-level-circle.is-zero {
        fill: #9acbf3;
    }
    text.star-gem-level-text {
        fill: var(--primary-water-blue);
        text-anchor: middle;
        stroke-width: 0;
        dominant-baseline: middle;
    }
</style>