<template>
  <div v-if="container" class="flex items-center">
    <div v-if="toggleable" class="mr-1 flex shrink-0">
      <cy-button-check
        v-model:selected="branchItemState.enabled"
        :disabled="container.statContainers.length === 0"
      >
        <span v-html="container.get('condition')"></span>
      </cy-button-check>
    </div>
    <div class="flex items-center">
      <SkillBranchPropValue
        v-if="container.statContainers.length === 0"
        :result="container.result('caption')"
      />
      <CharacterSkillItemStats v-else :stat-containers="container.statContainers" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import { SkillBranchItemSuffix } from '@/lib/Skill/SkillComputing'
import { DisplayDataContainer } from '@/lib/Skill/SkillDisplay'

import SkillBranchPropValue from '@/components/views/skill/branch/layouts/skill-branch-prop-value.vue'

import CharacterSkillItemStats from './character-skill-item-stats.vue'

interface Props {
  container: DisplayDataContainer<SkillBranchItemSuffix>
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()

const branchItemState = computed(() =>
  characterStore.currentCharacterState.skillBuild!.getSkillBranchState(props.container.branchItem)
)

const toggleable = computed(() => props.container.branchItem.prop('condition') !== 'auto')
</script>
