<template>
  <div v-if="container" class="flex items-center">
    <div v-if="toggleable" class="flex mr-3 flex-shrink-0">
      <cy-button-switch
        v-model:selected="branchItemState.enabled"
        :disabled="container.statContainers.length === 0"
        inline
      >
        <span v-html="container.get('condition')"></span>
      </cy-button-switch>
    </div>
    <div class="flex items-center">
      <cy-icon-text icon="ic:round-label-important" class="mr-2" />
      <div v-if="container.statContainers.length === 0" v-html="container.get('caption')"></div>
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

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/utils/DisplayDataContainer'

import CharacterSkillItemStats from './character-skill-item-stats.vue'

import { setupCharacterStore } from '../../setup'

interface Props {
  container: DisplayDataContainer<SkillBranchItemSuffix>;
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()

const branchItemState = computed(() => store.getSkillBranchItemState(props.container.branchItem.default))

const toggleable = computed(() => props.container.branchItem.prop('condition') !== 'auto')
</script>
