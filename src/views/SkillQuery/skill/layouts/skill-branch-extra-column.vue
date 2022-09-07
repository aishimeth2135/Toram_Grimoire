<template>
  <fieldset class="pt-1 pb-0.5 mt-1 pl-1.5 border-t-1 border-primary-30">
    <legend class="flex items-center px-2">
      <cy-icon-text :icon="icon" small color="red">
        <span v-html="title"></span>
      </cy-icon-text>
      <div v-if="titleProps" class="flex items-center text-sm text-emerald-60 space-x-1.5 ml-3">
        <span v-for="titleProp in titleProps" :key="titleProp" class="inline-block">
          {{ titleProp }}
        </span>
      </div>
    </legend>
    <div class="mb-1 flex items-center flex-wrap">
      <slot>
        <div v-if="text" class="py-0.5 pl-1" v-html="text" />
        <SkillBranchStats v-else-if="statContainers" :stat-containers="statContainers" />
      </slot>
    </div>
  </fieldset>
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

