<template>
  <div class="flex items-start pb-2 pl-2.5">
    <div class="flex bg-white border border-primary-20 rounded-full p-1.5 flex-shrink-0">
      <cy-icon-text :icon="icon" icon-color="red-30" />
    </div>
    <div class="pl-3 pt-1">
      <div class="flex items-center">
        <div class="text-red-60" v-html="title"></div>
        <div v-if="titleProps" class="flex items-center text-sm text-emerald-60 space-x-1.5 ml-3">
          <span v-for="titleProp in titleProps" :key="titleProp" class="inline-block">
            {{ titleProp }}
          </span>
        </div>
      </div>
      <div class="flex items-center flex-wrap">
        <slot>
          <div v-if="text" class="py-0.5" style="min-height: 2.125rem" v-html="text" />
          <SkillBranchStats v-else-if="statContainers" :stat-containers="statContainers" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

import SkillBranchStats from './skill-branch-stats.vue'

interface Props {
  icon: string;
  title: string;
  titleProps?: string[];
  text?: string;
  statContainers?: ResultContainerStat[];
}

defineProps<Props>()
</script>

