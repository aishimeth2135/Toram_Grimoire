<template>
  <div>
    <div class="flex items-center flex-wrap py-0.5 px-4 rounded border-1 border-primary-10 bg-white">
      <div class="flex items-center my-1">
        <cy-icon-text icon="mdi-sword" block>
          {{ t('skill-query.branch.proration.proration: title') }}
        </cy-icon-text>
        <div class="text-primary-50 ml-1.5" v-html="container.get('proration')"></div>
      </div>
      <div class="border-l-1 border-primary-20 h-5 mx-4" />
      <div class="flex items-center my-1">
        <cy-icon-text icon="mdi-sword" block>
          {{ t('skill-query.branch.proration.damage: title') }}
        </cy-icon-text>
        <div class="text-primary-50 ml-1.5" v-html="container.get('damage')"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import ProrationHandler from './branch-handlers/ProrationHandler'

interface Props {
  computing: SkillComputingContainer;
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => ProrationHandler(props.computing, branchItem.value))

const { t } = useI18n()

// const nextBranch = computed(() => {
//   const bchs = branchItem.value.parent.branchItems
//   const idx = bchs.indexOf(branchItem.value)
//   if (idx === -1 || idx === bchs.length - 1) {
//     return null
//   }
//   return bchs[idx + 1]
// })
</script>

