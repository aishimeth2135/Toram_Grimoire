<template>
  <div class="py-2 px-0.5">
    <div class="flex items-center">
      <div
        class="mr-3 flex flex-shrink-0"
        style="min-width: 10rem"
      >
        <cy-icon-text :icon="skillIconPath" icon-src="image" color="purple">
          {{ skillResultsState.skill.name }}
        </cy-icon-text>
      </div>
      <div v-if="skillResultsState.stackContainers.length > 0" class="ml-auto inline-flex">
        <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
      </div>
    </div>
    <div class="pl-1 pb-1">
      <div class="pt-2 pl-2 space-y-2">
        <div v-for="result in skillResultsState.results" :key="result.container.instanceId">
          <CharacterComboItemDamageResultItem
            ref="resultItemRefs"
            v-model:unselected-branches="comboSkillState.comboSkill.parent.config.unselectedBranches/* eslint-disable-line vue/no-mutating-props */"
            :result="result"
            :extra-stats="extraStats"
            :combo-rate="comboSkillState.rate"
          />
        </div>
      </div>
    </div>
    <div v-if="previousSkillNextResultsState" class="pt-1">
      <cy-icon-text text-color="light-2" small>
        {{ t('character-simulator.combo.damage-calc.previous-skill-next-title') }}
      </cy-icon-text>
      <div class="pl-5">
        <CharacterComboItemResultItem
          v-for="result in previousSkillNextResultsState.results"
          :key="result.container.instanceId"
          :result="result"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'
import { ComboSkillState } from '@/lib/Character/CharacterCombo'
import { Skill } from '@/lib/Skill/Skill'
import { Stat } from '@/lib/Character/Stat'

import CharacterComboItemDamageResultItem from './character-combo-item-damage-result-item.vue'
import CharacterSkillItemOptions from '../character-skill/character-skill-tab/character-skill-item-options.vue'
import CharacterComboItemResultItem from './character-combo-item-result-item.vue'

import { setupCharacterStore } from '../setup'
import { getContainerStats } from '../character-damage/setup'

interface Props {
  comboSkillState: ComboSkillState;
  skillResultsState: SkillResultsState;
}

const props = defineProps<Props>()
const { store } = setupCharacterStore()
const { t } = useI18n()

const resultItemRefs: Ref<InstanceType<typeof CharacterComboItemDamageResultItem>[]> = ref([])

const expectedResultSum = computed(() => {
  return resultItemRefs.value.reduce((cur, item) => cur + item.expectedResult, 0)
})

const skillIconPath = computed(() => getSkillIconPath(props.skillResultsState.skill))

const previousSkillNextResultsState = computed(() => {
  const previousSkill = props.comboSkillState.comboSkill.previousSkill?.skill
  if (!previousSkill) {
    return null
  }
  const resultsState = store.nextSkillResultStates.find(state => (state.skill as Skill) === previousSkill) as (SkillResultsState | undefined)
  return resultsState ?? null
})

const extraStats = computed(() => {
  if (!previousSkillNextResultsState.value) {
    return []
  }
  const stats: Stat[] = []
  previousSkillNextResultsState.value.results.forEach(result => {
    stats.push(...getContainerStats(store, result.container))
    result.suffixContainers.forEach(sufContainer => {
      stats.push(...getContainerStats(store, sufContainer))
    })
  })
  return stats
})

defineExpose({
  expectedResultSum,
  skill: computed(() => props.skillResultsState.skill),
})
</script>

<style lang="postcss" scoped>
:deep(.result-value--stack) {
  @apply text-water-blue;

  &.value-dark {
    @apply text-blue-green;
  }
}
</style>
