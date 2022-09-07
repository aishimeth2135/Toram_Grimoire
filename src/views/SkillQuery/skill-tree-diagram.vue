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
    <template v-for="data in drawOtherDatas">
      <circle
        v-if="data.type === DrawSkillTreeDataTypes.TreeDot"
        :key="`dot-${data.type}x${data.cx}y${data.cy}`"
        :cx="data.cx"
        :cy="data.cy"
        :r="data.r"
        :class="data.class"
      />
      <line
        v-else-if="data.type === DrawSkillTreeDataTypes.TreeLine"
        :key="`line-${data.type}x1${data.x1}y1${data.y1}x2${data.x2}y2${data.y2}`"
        :x1="data.x1"
        :y1="data.y1"
        :x2="data.x2"
        :y2="data.y2"
      />
      <text
        v-else-if="data.type === DrawSkillTreeDataTypes.SkillLevelText || data.type === DrawSkillTreeDataTypes.StarGemLevelText"
        :key="`level-text-${data.type}x${data.x}y${data.y}`"
        :x="data.x"
        :y="data.y"
        :class="data.class"
      >
        {{ data.innerText }}
      </text>
    </template>
    <template
      v-for="(data, idx) in drawCircleDatas"
      :key="data.skill.id"
    >
      <circle
        :cx="data.cx"
        :cy="data.cy"
        :r="data.r"
        :class="handleSkillCircleClass(data)"
        :style="data.style"
        @click="emit('skill-click', data.skill!)"
      />
      <text
        :x="drawNameDatas[idx].x"
        :y="drawNameDatas[idx].y"
        :class="drawNameDatas[idx].class"
      >
        {{ drawNameDatas[idx].innerText }}
      </text>
    </template>
  </svg>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import CY from '@/shared/utils/Cyteria'

import { Skill, SkillTree } from '@/lib/Skill/Skill'
import { computeDrawSkillTreeData, getSkillIconPatternData, createDrawSkillTreeDefs, DrawSkillTreeData, SetSkillButtonExtraDataHandle, GetSkillLevelHandler } from '@/lib/Skill/utils/DrawSkillTree'
import { DrawSkillTreeDataTypes } from '@/lib/Skill/utils/enums'

interface Props {
  skillTree: SkillTree;
  setSkillButtonExtraData?: SetSkillButtonExtraDataHandle;
  getSkillLevel?: GetSkillLevelHandler;
  currentSkill?: Skill | null;
}

interface Emits {
  (evt: 'skill-click', skill: Skill): void;
}

const props = withDefaults(defineProps<Props>(), {
  setSkillButtonExtraData: undefined,
  getSkillLevel: undefined,
  currentSkill: null,
})

const emit = defineEmits<Emits>()

if (!document.getElementById('app--draw-skill-tree-defs')) {
  const svg = CY.svg.create()
  svg.append(createDrawSkillTreeDefs())
  document.body.append(svg)
}

const { skillTree, setSkillButtonExtraData, currentSkill, getSkillLevel } = toRefs(props)

const drawTreeData = computed(() => {
  return computeDrawSkillTreeData(skillTree.value, {
    setSkillButtonExtraData: setSkillButtonExtraData.value,
    getSkillLevel: getSkillLevel.value,
  })
})

const skillIconPatternData = computed(() => getSkillIconPatternData(skillTree.value))

const drawCircleDatas = computed(() => drawTreeData.value.data.filter(item => item.type === DrawSkillTreeDataTypes.SkillCircle))

const drawNameDatas = computed(() => drawTreeData.value.data.filter(item => item.type === DrawSkillTreeDataTypes.SkillName))

const drawOtherDatas = computed(() => drawTreeData.value.data.filter(item => item.type !== DrawSkillTreeDataTypes.SkillName && item.type !== DrawSkillTreeDataTypes.SkillCircle))

const handleSkillCircleClass = (data: DrawSkillTreeData) => {
  const classList = data.class?.slice() ?? []
  if (currentSkill.value === data.skill) {
    classList.push('selected')
  }
  return classList
}
</script>

<style lang="postcss" scoped>
.app--draw-skill-tree {
  stroke: var(--app-primary-30);
  stroke-width: 2px;

  & > circle.dot {
    fill: var(--app-primary-30);
  }

  & > circle.skill-circle {
    fill: #FFF;
    z-index: 5;
    stroke: #ff5fb7;
    stroke-width: 2px;
    cursor: pointer;
    transition: 0.3s;

    &:hover, &.cur, &.selected {
      stroke: var(--app-blue-60);
    }

    &.disabled {
      stroke: #BBB;
    }

    &:not(.disabled):hover + text.skill-name, &.selected + text.skill-name {
      display: block;
    }

    &.lock {
      fill: url(#skill-icon-lock);
      stroke: var(--app-primary-30);
    }
  }
  & > text.skill-name {
    text-anchor: middle;
    stroke-width: 0;
    fill: var(--app-fuchsia-60);
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
    fill: var(--app-primary-60);
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
    fill: var(--app-blue-60);
    text-anchor: middle;
    stroke-width: 0;
    dominant-baseline: middle;
  }
}
</style>
