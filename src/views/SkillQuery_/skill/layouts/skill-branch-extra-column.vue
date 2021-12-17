<template>
  <fieldset class="extra-column">
    <legend class="flex items-center px-2">
      <cy-icon-text :icon="icon" size="small" text-color="light-3">
        <span v-html="title"></span>
      </cy-icon-text>
      <span v-for="titleProp in titleProps" :key="titleProp" class="title-prop">
        {{ titleProp }}
      </span>
    </legend>
    <div class="mb-1 flex items-center flex-wrap">
      <div v-if="text" class="py-0.5 pl-1" v-html="text" />
      <SkillBranchStats v-else-if="statContainers" :stat-containers="statContainers" />
    </div>
  </fieldset>
</template>

<script lang="ts" setup>
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer';

import SkillBranchStats from './skill-branch-stats.vue';

interface Props {
  icon: string;
  title: string;
  titleProps?: string[];
  text?: string;
  statContainers?: ResultContainerStat[];
}

withDefaults(defineProps<Props>(), {
  titleProps: () => [],
});
</script>

<style lang="postcss" scoped>
fieldset.extra-column {
  @apply pt-1 pb-0.5 mt-1 pl-1.5 border-t-1 border-light-2;
}

.title-prop {
  background-color: var(--primary-dark);
  color: var(--white);
  display: inline-block;
  padding: 0.1rem 0.3rem;
  font-size: 0.9rem;
  border-radius: 0.2rem;
  margin-right: 0.3rem;
}
</style>
