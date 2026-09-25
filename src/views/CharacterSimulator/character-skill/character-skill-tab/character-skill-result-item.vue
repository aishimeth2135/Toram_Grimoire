<template>
  <div class="flex items-start py-0.5">
    <div v-if="!hideName" class="flex shrink-0">
      <cy-button-check
        v-model:selected="branchItemState.enabled"
        :disabled="
          container.statContainers.length === 0 && !container.has('buffs/guaranteed_critical')
        "
      />
    </div>
    <div class="grow">
      <div v-if="!hideName" class="text-primary-70 pt-0.5">
        {{ container.get('name') || t('skill-query.branch.effect.base-name') }}
      </div>
      <div class="py-0.5">
        <SkillBranchPropValue
          v-if="container.statContainers.length === 0"
          :result="container.result('caption')"
        />
        <CharacterSkillItemStats v-else :stat-containers="container.statContainers" />
        <SkillBranchPropValue
          v-if="container.has('buffs/guaranteed_critical')"
          class="block"
          :result="container.result('buffs/guaranteed_critical')"
        />
        <SkillBranchPropValue
          v-if="container.has('buffs/mp_cost_half')"
          class="block"
          :result="container.result('buffs/mp_cost_half')"
        />
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

import SkillBranchPropValue from '@/views/Character/SkillQuery/skill/layouts/skill-branch-prop-value.vue'

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
  characterStore.currentCharacterState.skillBuild!.getSkillBranchState(container.value.branchItem)
)
</script>
