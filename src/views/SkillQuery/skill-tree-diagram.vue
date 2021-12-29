<template>
  <svg
    class="app--draw-skill-tree"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="drawTreeData.width"
    :height="drawTreeData.height"
  >
    <defs>
      <pattern
        v-for="data in skillIconPatternData"
        :id="data.id"
        :key="data.id"
        :width="data.width"
        :height="data.height"
      >
        <template v-for="el in data.elements">
          <circle
            v-if="el.type === 'circle'"
            :key="`${el.type}x${el.cx}y${el.cy}`"
            :cx="el.cx"
            :cy="el.cy"
            :r="el.r"
            :class="el.class"
          />
          <image
            v-else-if="el.type === 'image'"
            :key="`${el.type}x${el.x}y${el.y}`"
            :xlink:href="el.path"
            :x="el.x"
            :y="el.y"
            :width="el.width"
            :height="el.height"
          />
        </template>
      </pattern>
    </defs>
    <template v-for="data in drawOtherData">
      <circle
        v-if="data.type === 'tree-dot'"
        :key="`dot-${data.type}x${data.cx}y${data.cy}`"
        :cx="data.cx"
        :cy="data.cy"
        :r="data.r"
        :class="data.class"
      />
      <line
        v-else-if="data.type === 'tree-line'"
        :key="`line-${data.type}x1${data.x1}y1${data.y1}x2${data.x2}y2${data.y2}`"
        :x1="data.x1"
        :y1="data.y1"
        :x2="data.x2"
        :y2="data.y2"
      />
      <circle
        v-else-if="data.type === 'skill-level-circle' || data.type === 'star-gem-level-circle'"
        :key="`circle-${data.type}x${data.cx}y${data.cy}`"
        :cx="data.cx"
        :cy="data.cy"
        :r="data.r"
        :class="data.class"
      />
      <text
        v-else-if="data.type === 'skill-level-text' || data.type === 'star-gem-level-text'"
        :key="`text-${data.type}x${data.x}y${data.y}`"
        :x="data.x"
        :y="data.y"
        :class="data.class"
      >
        {{ data.innerText }}
      </text>
    </template>
    <template
      v-for="(data, i) in drawCircleData"
      :key="data.skill.id"
    >
      <circle
        :cx="data.cx"
        :cy="data.cy"
        :r="data.r"
        :class="handleSkillCircleClass(data)"
        :style="data.style"
        @click="$emit('skill-click', data.skill)"
      />
      <text
        :x="drawNameData[i].x"
        :y="drawNameData[i].y"
        :class="drawNameData[i].class"
      >
        {{ drawNameData[i].innerText }}
      </text>
    </template>
  </svg>
</template>

<script>
import CY from '@/shared/utils/Cyteria';

import { Skill, SkillTree, LevelSkill, LevelSkillTree } from '@/lib/Skill/Skill';
import { computeDrawSkillTreeData, getSkillIconPatternData, createDrawSkillTreeDefs } from '@/lib/Skill/utils/DrawSkillTree';

export default {
  emits: ['skill-click'],
  props: {
    skillTree: [SkillTree, LevelSkillTree],
    setSkillButtonExtraData: {
      type: Function,
      default: (skill, data) => [], // eslint-disable-line
    },
    skillTreeType: {
      type: String,
      validator: v => ['normal', 'level-skill-tree'].indexOf(v) !== -1,
    },
    currentSkill: {
      type: [Skill, LevelSkill],
      default: null,
    },
  },
  computed: {
    drawTreeData() {
      return computeDrawSkillTreeData(this.skillTree, {
        setSkillButtonExtraData: this.setSkillButtonExtraData,
        skillTreeType: this.skillTreeType,
      });
    },
    skillIconPatternData() {
      const st = this.skillTreeType === 'level-skill-tree' ? this.skillTree.base : this.skillTree;
      return getSkillIconPatternData(st);
    },
    drawCircleData() {
      return this.drawTreeData.data
        .filter(data => data.type === 'skill-circle');
    },
    drawNameData() {
      return this.drawTreeData.data
        .filter(data => data.type === 'skill-name');
    },
    drawOtherData() {
      return this.drawTreeData.data.filter(data => data.type !== 'skill-circle' && data.type !== 'skill-name');
    },
  },
  beforeCreate() {
    if (!document.getElementById('app--draw-skill-tree-defs')) {
      const svg = CY.svg.create();
      svg.append(createDrawSkillTreeDefs());
      document.body.append(svg);
    }
  },
  methods: {
    handleSkillCircleClass(data) {
      const ary = data.class.slice();
      if (this.currentSkill === data.skill)
        ary.push('selected');
      return ary;
    },
  },
};
</script>

<style lang="postcss" scoped>
.app--draw-skill-tree {
  stroke: var(--primary-light);
  stroke-width: 2px;

  & > circle.dot {
    fill: var(--primary-light);
  }

  & > circle.skill-circle {
    fill: #FFF;
    z-index: 5;
    stroke: #ff5fb7;
    stroke-width: 2px;
    cursor: pointer;
    transition: 0.3s;

    &:hover, &.cur, &.selected {
      stroke: var(--primary-water-blue);
    }

    &.disabled {
      stroke: #BBB;
    }

    &:not(.disabled):hover + text.skill-name, &.selected + text.skill-name {
      display: block;
    }

    &.lock {
      fill: url(#skill-icon-lock);
      stroke: var(--primary-light);
    }
  }
  & > text.skill-name {
    text-anchor: middle;
    stroke-width: 0;
    fill: var(--primary-purple);
    transition: 0.3s;
    display: none;
  }

  & .skill-icon-pattern-bg {
    fill: url(#skill-icon-bg);
    stroke-width: 0;
  }

  & > circle.skill-level-circle {
    fill: #ff5fb7;
    stroke: none;

    &.is-zero {
      fill: #f7a8d3;
    }
  }

  & > text.skill-level-text {
    fill: var(--primary-light-4);
    text-anchor: middle;
    stroke-width: 0;
    dominant-baseline: middle;
  }
  & > circle.star-gem-level-circle {
    fill: #2196f3;
    stroke: none;
  }
  & > circle.star-gem-level-circle.is-zero {
    fill: #9acbf3;
  }
  & > text.star-gem-level-text {
    fill: var(--primary-water-blue);
    text-anchor: middle;
    stroke-width: 0;
    dominant-baseline: middle;
  }
}
</style>
