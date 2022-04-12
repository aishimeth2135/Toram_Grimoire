<template>
  <div class="flex items-center flex-wrap">
    <div class="text-light-2 flex items-center mt-1 pl-2 pr-3 py-0.5 border border-light rounded-sm bg-white mr-3">
      <cy-icon-text icon="mdi-sword" display-block>
        {{ t('skill-query.branch.proration.proration: title') }}
      </cy-icon-text>
      <div class="text-light-3 ml-1.5" v-html="container.get('proration')"></div>
    </div>
    <div class="text-light-2 flex items-center mt-1 pl-2 pr-3 py-0.5 border border-light rounded-sm bg-white">
      <cy-icon-text icon="mdi-sword" display-block>
        {{ t('skill-query.branch.proration.damage: title') }}
      </cy-icon-text>
      <div class="text-light-3 ml-1.5" v-html="container.get('damage')"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import ProrationHandler from './branch-handlers/ProrationHandler'

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => ProrationHandler(branchItem.value))

const { t } = useI18n()
</script>

