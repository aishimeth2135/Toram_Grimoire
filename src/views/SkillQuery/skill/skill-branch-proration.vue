<template>
  <div>
    <div
      class="flex flex-wrap items-center rounded-sm border-1 border-primary-10 bg-white px-4 py-0.5"
    >
      <div class="my-1 flex items-center">
        <cy-icon icon="mdi-sword" />
        <div class="ml-1 text-primary-80">
          {{ container.title('proration') }}
        </div>
        <SkillBranchPropValue
          class="ml-2 text-primary-60"
          :result="container.result('proration')"
        />
      </div>
      <div class="mx-4 h-6 border-l border-primary-10" />
      <div class="my-1 flex items-center">
        <cy-icon icon="mdi-sword" />
        <div class="ml-1 text-primary-80">
          {{ container.title('damage') }}
        </div>
        <SkillBranchPropValue class="ml-2 text-primary-60" :result="container.result('damage')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import ProrationHandler from './branch-handlers/ProrationHandler'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => ProrationHandler(props.computing, branchItem.value))
</script>
