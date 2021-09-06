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
        v-for="(p) in skillIconPatternData"
        :id="p.id"
        :key="p.id"
        :width="p.width"
        :height="p.height"
      >
        <template v-for="(q) in p.elements">
          <circle
            v-if="q.type == 'circle'"
            :key="`${q.type}x${p.cx}y${q.cy}`"
            :cx="q.cx"
            :cy="q.cy"
            :r="q.r"
            :class="q.class"
          />
          <image
            v-else-if="q.type == 'image'"
            :key="`${q.type}x${p.x}y${q.y}`"
            :xlink:href="q.path"
            :x="q.x"
            :y="q.y"
            :width="q.width"
            :height="q.height"
            @error="skillIconImageNotFound($event)"
          />
        </template>
      </pattern>
    </defs>
    <template v-for="p in drawOtherData">
      <circle
        v-if="p.type === 'tree-dot'"
        :key="`dot-${p.type}x${p.cx}y${p.cy}`"
        :cx="p.cx"
        :cy="p.cy"
        :r="p.r"
        :class="p.class"
      />
      <line
        v-else-if="p.type === 'tree-line'"
        :key="`line-${p.type}x1${p.x1}y1${p.y1}x2${p.x2}y2${p.y2}`"
        :x1="p.x1"
        :y1="p.y1"
        :x2="p.x2"
        :y2="p.y2"
      />
      <circle
        v-else-if="p.type === 'skill-level-circle' || p.type === 'star-gem-level-circle'"
        :key="`circle-${p.type}x${p.cx}y${p.cy}`"
        :cx="p.cx"
        :cy="p.cy"
        :r="p.r"
        :class="p.class"
      />
      <text
        v-else-if="p.type === 'skill-level-text' || p.type === 'star-gem-level-text'"
        :key="`text-${p.type}x${p.x}y${p.y}`"
        :x="p.x"
        :y="p.y"
        :class="p.class"
      >
        {{ p.innerText }}
      </text>
    </template>
    <template
      v-for="(p, i) in drawCircleData"
      :key="p.skill.id"
    >
      <circle
        :cx="p.cx"
        :cy="p.cy"
        :r="p.r"
        :class="handleSkillCircleClass(p)"
        :style="p.style"
        @click="skillCircleClick($event, p.skill)"
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
import { computeDrawSkillTreeData, getSkillIconPatternData, createDrawSkillTreeDefs } from '@/lib/Skill/utils/DrawSkillTree';
import { Skill, SkillTree, LevelSkill, LevelSkillTree } from '@/lib/Skill/Skill';

function DoNothing() {
  // do nothing
}

export default {
  props: {
    skillTree: [SkillTree, LevelSkillTree],
    setSkillButtonExtraData: {
      type: Function,
      default: (skill, data) => [], // eslint-disable-line
    },
    skillCircleClickListener: {
      type: Function,
      default: DoNothing,
    },
    skillTreeType: {
      type: String,
      validator: v => ['normal', 'level-skill-tree'].indexOf(v) != -1,
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
      const st = this.skillTreeType == 'level-skill-tree' ? this.skillTree.base : this.skillTree;
      return getSkillIconPatternData(st);
    },
    drawCircleData() {
      return this.drawTreeData.data
        .filter(p => p.type == 'skill-circle');
    },
    drawNameData() {
      return this.drawTreeData.data
        .filter(p => p.type == 'skill-name');
    },
    drawOtherData() {
      return this.drawTreeData.data.filter(p => p.type != 'skill-circle' && p.type != 'skill-name');
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
      if (this.currentSkill == data.skill)
        ary.push('selected');
      return ary;
    },
    skillCircleClick(e, skill) {
      this.skillCircleClickListener(e, skill);
    },
    skillIconImageNotFound(e) {
      e.target.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/imgs/skill_icons/unknow.svg');
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
