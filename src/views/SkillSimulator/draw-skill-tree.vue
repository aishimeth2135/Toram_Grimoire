<template>
  <svg class="app--draw-skill-tree" xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="width" :height="height">
    <defs>
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
      <text v-else-if="p.type == 'skill-name'"
        :x="p.x" :y="p.y" :class="p.class">
        {{ p.innerText }}
      </text>
      <line v-else-if="p.type == 'tree-line'"
        :x1="p.x1" :y1="p.y1" :x2="p.x2" :y2="p.y2" />
      <circle v-else-if="p.type == 'skill-level-circle' || p.type == 'star-gem-level-circle'"
        :cx="p.cx" :cy="p.cy" :r="p.r" :class="p.class" />
      <text v-else-if="p.type == 'skill-level-text' || p.type == 'star-gem-level-text'"
        :x="p.x" :y="p.y" :class="p.class">
        {{ p.innerText }}
      </text>
    </template>
  </svg>
</template>

<script>
  import CY from "@global-modules/cyteria.js";
  import {computeDrawSkillTreeData, getSkillIconPatternData, createDrawSkillTreeDefs} from "@lib/SkillSystem/module/DrawSkillTree.js";
  import {SkillTree, LevelSkillTree} from "@lib/SkillSystem/module/SkillElements.js";

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
    beforeCreate(){
      if ( !document.getElementById('app--draw-skill-tree-defs') ){
        const svg = CY.svg.create();
        svg.append(createDrawSkillTreeDefs());
        document.body.append(svg);
      }
    },
    data(){
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
        const st = this.skillTreeType == 'level-skill-tree' ? this.skillTree.base : this.skillTree;
        return getSkillIconPatternData(st);
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
  .app--draw-skill-tree {
    stroke: var(--primary-light);
    stroke-width: 2px;

    > circle.dot {
      fill: var(--primary-light);
    }

    > circle.skill-circle {
      fill: #FFF;
      z-index: 5;
      stroke: #ff5fb7;
      stroke-width: 2px;
      cursor: pointer;
      transition: 0.3s;

      &:hover, &.cur {
        stroke: var(--primary-water-blue);
      }

      &.disable {
        stroke: #BBB;
      }

      &:not(.disable):hover + text.skill-name {
        display: block;
      }

      &.lock {
        fill: url(#skill-icon-lock);
        stroke: var(--primary-light);
      }
    }
    > text.skill-name {
      text-anchor: middle;
      stroke-width: 0;
      fill: var(--primary-purple);
      transition: 0.3s;
      display: none;
    }

    .skill-icon-pattern-bg {
      fill: url(#skill-icon-bg);
      stroke-width: 0;
    }

    > circle.skill-level-circle {
      fill: #ff5fb7;
      stroke: none;

      &.is-zero {
        fill: #f7a8d3;
      }
    }

    > text.skill-level-text {
      fill: var(--primary-light-4);
      text-anchor: middle;
      stroke-width: 0;
      dominant-baseline: middle;
    }
    > circle.star-gem-level-circle {
      fill: #2196f3;
      stroke: none;
    }
    > circle.star-gem-level-circle.is-zero {
      fill: #9acbf3;
    }
    > text.star-gem-level-text {
      fill: var(--primary-water-blue);
      text-anchor: middle;
      stroke-width: 0;
      dominant-baseline: middle;
    }
  }
</style>