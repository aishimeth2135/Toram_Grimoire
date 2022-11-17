<template>
  <div v-if="container" class="flex items-center">
    <div v-if="toggleable" class="mr-3 flex flex-shrink-0">
      <cy-button-toggle
        v-model:selected="branchItemState.enabled"
        :disabled="container.statContainers.length === 0"
      >
        <span v-html="container.get('condition')"></span>
      </cy-button-toggle>
    </div>
    <div class="flex items-center">
      <SkillBranchPropValue
        v-if="container.statContainers.length === 0"
        :result="container.result('caption')"
      />
      <CharacterSkillItemStats
        v-else
        :stat-containers="container.statContainers"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { SkillBranchItemSuffix } from '@/lib/Skill/SkillComputingContainer'

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/handle/DisplayDataContainer'
import SkillBranchPropValue from '@/views/SkillQuery/skill/layouts/skill-branch-prop-value.vue'

import CharacterSkillItemStats from './character-skill-item-stats.vue'

import { setupCharacterStore } from '../../setup'

interface Props {
  container: DisplayDataContainer<SkillBranchItemSuffix>
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()

const branchItemState = computed(() =>
  store.getSkillBranchState(props.container.branchItem.default)
)

const toggleable = computed(
  () => props.container.branchItem.prop('condition') !== 'auto'
)
</script>
