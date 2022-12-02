<template>
  <div class="flex items-start pb-0.5 pl-2.5">
    <IconCircle :icon="icon" />
    <div class="pl-3 pt-1">
      <div class="flex items-center">
        <div class="text-red-60" v-html="title"></div>
        <div
          v-if="titleProps"
          class="ml-3 flex items-center space-x-1.5 text-sm text-emerald-60"
        >
          <span
            v-for="titleProp in titleProps"
            :key="titleProp"
            class="inline-block"
          >
            {{ titleProp }}
          </span>
        </div>
      </div>
      <div class="flex flex-wrap items-center" style="min-height: 2rem">
        <slot>
          <SkillBranchPropValue v-if="result" :result="result" />
          <SkillBranchStats
            v-else-if="statContainers"
            :stat-containers="statContainers"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  SkillBranchResultBase,
  SkillBranchStatResult,
} from '@/lib/Skill/SkillComputingContainer/SkillBranchResult'

import IconCircle from './skill-branch-layout-icon-circle.vue'
import SkillBranchPropValue from './skill-branch-prop-value.vue'
import SkillBranchStats from './skill-branch-stats.vue'

interface Props {
  icon: string
  title: string
  titleProps?: string[]
  result?: SkillBranchResultBase | null
  statContainers?: SkillBranchStatResult[]
}

defineProps<Props>()
</script>
