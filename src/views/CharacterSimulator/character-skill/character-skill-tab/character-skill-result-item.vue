<template>
  <div>
    <div class="flex items-center">
      <div v-if="!hideName" class="flex mr-3 flex-shrink-0">
        <cy-button-toggle
          v-model:selected="branchItemState.enabled"
          :disabled="container.statContainers.length === 0"
        >
          {{ container.get('name') || t('skill-query.branch.effect.base-name') }}
        </cy-button-toggle>
      </div>
      <div>
        <div v-if="container.statContainers.length === 0" v-html="container.get('caption')"></div>
        <CharacterSkillItemStats
          v-else
          :stat-containers="container.statContainers"
        />
      </div>
    </div>
    <div class="pl-4">
      <CharacterSkillResultSuffixItem
        v-for="suffixContainer in result.suffixContainers"
        :key="suffixContainer.instanceId"
        :container="suffixContainer"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResult } from '@/stores/views/character/setup'

import CharacterSkillItemStats from './character-skill-item-stats.vue'
import CharacterSkillResultSuffixItem from './character-skill-result-suffix-item.vue'

import { setupCharacterStore } from '../../setup'


interface Props {
  result: SkillResult;
  hideName?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hideName: false,
})

const { store } = setupCharacterStore()
const { t } = useI18n()

const container = computed(() => props.result.container)

const branchItemState = computed(() => store.getSkillBranchItemState(container.value.branchItem.default))
</script>
