<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillResult } from '@/stores/views/character/setup'

import { getDamageSource } from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from '@/views/Character/SkillQuery/skill/layouts/skill-branch-prop-value.vue'
import CommonSearchableItems from '@/views/CharacterSimulator/common/common-searchable-items.vue'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'

interface Props {
  result: SkillResult
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()
const { t } = useI18n()
const searchText = ref('')
const hasDamageSource = computed(() => !!getDamageSource(props.result.container.branchItem))

const branchState = computed(() =>
  characterStore.currentCharacterState.skillBuild!.getSkillBranchState(
    props.result.container.branchItem
  )
)
const selectedIds = computed(() => branchState.value.selectedBuffIds ?? [])
const allOptions = computed(() =>
  characterStore.availableBuffResults.map(result => ({
    id: result.container.branchItem.defaultBranchId,
    name: `${result.root.skill.name} · ${result.container.get('name') || t('skill-query.branch.effect.base-name')}`,
    result,
  }))
)
const options = computed(() =>
  allOptions.value.filter(option =>
    option.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
)
const selectedOptions = computed(() =>
  allOptions.value.filter(option => selectedIds.value.includes(option.id))
)

const toggleOption = (option: (typeof allOptions.value)[number]) => {
  const ids = selectedIds.value
  branchState.value.selectedBuffIds = ids.includes(option.id)
    ? ids.filter(id => id !== option.id)
    : [...ids, option.id]
}
</script>

<template>
  <div v-if="!hasDamageSource && allOptions.length > 0" class="pl-2 pt-2">
    <cy-popover placement="top-start" custom>
      <cy-button-plain icon="mdi:plus-circle-outline">
        {{ t('character-simulator.character-damage.select-buffs') }}
      </cy-button-plain>
      <template #popper>
        <div class="flex max-h-96 flex-col bg-white">
          <CommonSearchableItems
            v-model:search-text="searchText"
            :items="options"
            :selected-item-ids="selectedIds"
            class="max-h-none! min-h-0 grow"
            @select-item="toggleOption"
          >
            <template #item="{ item }">{{ item.name }}</template>
          </CommonSearchableItems>
        </div>
      </template>
    </cy-popover>
    <div
      v-for="option in selectedOptions"
      :key="option.id"
      class="flex items-start gap-2 py-1 text-sm"
    >
      <cy-icon icon="mdi:creation" class="text-primary-40 mt-0.5 shrink-0" />
      <div class="flex flex-col gap-1">
        <div class="text-primary-70">{{ option.name }}</div>
        <CharacterSkillItemStats :stat-containers="option.result.container.statContainers" />
        <SkillBranchPropValue
          v-if="option.result.container.has('buffs/guaranteed_critical')"
          :result="option.result.container.result('buffs/guaranteed_critical')"
        />
        <SkillBranchPropValue
          v-if="option.result.container.has('buffs/mp_cost_half')"
          :result="option.result.container.result('buffs/mp_cost_half')"
        />
        <div v-for="suffix in option.result.suffixContainers" :key="suffix.instanceId">
          <CharacterSkillItemStats :stat-containers="suffix.statContainers" />
          <SkillBranchPropValue :result="suffix.result('caption')" />
        </div>
      </div>
    </div>
  </div>
</template>
