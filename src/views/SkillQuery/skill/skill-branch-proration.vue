<template>
  <div>
    <div
      class="flex flex-wrap items-center rounded border-1 border-primary-10 bg-white py-0.5 px-4"
    >
      <div class="my-1 flex items-center">
        <cy-icon-text icon="mdi-sword" block>
          {{ container.title('proration') }}
        </cy-icon-text>
        <SkillBranchPropValue
          class="ml-1.5 text-primary-50"
          :result="container.result('proration')"
        />
      </div>
      <div class="mx-4 h-5 border-l-1 border-primary-20" />
      <div class="my-1 flex items-center">
        <cy-icon-text icon="mdi-sword" block>
          {{ container.title('damage') }}
        </cy-icon-text>
        <SkillBranchPropValue
          class="ml-1.5 text-primary-50"
          :result="container.result('damage')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import SkillComputingContainer, {
  SkillBranchItem,
} from '@/lib/Skill/SkillComputingContainer'

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import ProrationHandler from './branch-handlers/ProrationHandler'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() =>
  ProrationHandler(props.computing, branchItem.value)
)
</script>
