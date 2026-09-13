<template>
  <div class="flex w-full flex-wrap items-center space-x-4 px-3 py-1">
    <cy-icon icon="entypo-link" small class="mr-1" />
    <span class="text-primary-30 mr-2.5 text-sm">
      {{ t('skill-query.branch.reference.base-title') }}
    </span>
    <span v-if="container.has('text')">
      {{ container.get('text') }}
    </span>
    <div>
      <a target="_blank" :href="container.get('url')" class="text-primary-50 underline">
        {{ container.get('url_text') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import ReferenceHandler from './branch-handlers/ReferenceHandler'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => ReferenceHandler(props.computing, branchItem.value))

const { t } = useI18n()
</script>
