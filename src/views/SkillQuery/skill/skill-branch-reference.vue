<template>
  <div class="px-3 py-1 w-full flex items-center flex-wrap space-x-4">
    <cy-icon-text
      icon="entypo-link"
      small
      text-color="purple"
    >
      {{ t('skill-query.branch.reference.base-title') }}
    </cy-icon-text>
    <div v-if="container.has('text')">
      {{ container.get('text') }}
    </div>
    <div>
      <a target="_blank" :href="container.get('url')" class="text-light-3 underline">{{ container.get('url_text') }}</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import ReferenceHandler from './branch-handlers/ReferenceHandler'

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => ReferenceHandler(branchItem.value))

const { t } = useI18n()
</script>

