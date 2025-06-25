<template>
  <div class="flex items-start py-0.5">
    <div v-if="!hideName" class="flex shrink-0 pr-1.5">
      <cy-button-check
        v-model:selected="branchItemState.enabled"
        :disabled="container.statContainers.length === 0"
      />
    </div>
    <div class="w-full">
      <div v-if="!hideName" class="pt-0.5 text-primary-70">
        {{ container.get('name') || t('skill-query.branch.effect.base-name') }}
      </div>
      <div class="py-0.5">
        <SkillBranchPropValue
          v-if="container.statContainers.length === 0"
          :result="container.result('caption')"
        />
        <CharacterSkillItemStats v-else :stat-containers="container.statContainers" />
      </div>
      <div class="pt-1">
        <CharacterSkillResultSuffixItem
          v-for="suffixContainer in result.suffixContainers"
          :key="suffixContainer.instanceId"
          :container="suffixContainer"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillResult } from '@/stores/views/character/setup'

import SkillBranchPropValue from '@/views/SkillQuery/skill/layouts/skill-branch-prop-value.vue'

import CharacterSkillItemStats from './character-skill-item-stats.vue'
import CharacterSkillResultSuffixItem from './character-skill-result-suffix-item.vue'

interface Props {
  result: SkillResult
  hideName?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hideName: false,
})

const characterStore = useCharacterStore()
const { t } = useI18n()

const container = computed(() => props.result.container)

const branchItemState = computed(() =>
  characterStore.getSkillBranchState(container.value.branchItem.default)
)
</script>
