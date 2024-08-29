<template>
  <div class="px-0.5 py-2">
    <div class="flex items-center">
      <div class="mr-3 flex flex-shrink-0" style="min-width: 10rem">
        <cy-icon-text :icon="skillIconPath" color="fuchsia">
          {{ skillResultsState.skill.name }}
        </cy-icon-text>
      </div>
      <div v-if="skillResultsState.hasOptions" class="ml-auto inline-flex">
        <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
      </div>
    </div>
    <div class="pb-1 pl-1">
      <div class="space-y-2 pl-2 pt-2">
        <div
          v-for="result in skillResultsState.results"
          :key="result.container.instanceId"
        >
          <CharacterComboItemDamageResultItem
            ref="resultItemRefs"
            v-model:unselected-branches="
              /* eslint-disable-next-line vue/no-mutating-props */
              comboSkillState.comboSkill.parent.config.unselectedBranches
            "
            :result="result"
            :extra-stats="extraStats"
            :combo-rate="comboSkillState.rate"
          />
        </div>
      </div>
    </div>
    <div v-if="previousSkillNextResultsState" class="pt-1">
      <cy-icon-text text-color="primary-30" small>
        {{
          t('character-simulator.combo.damage-calc.previous-skill-next-title')
        }}
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
import { type Ref, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { type SkillResultsState } from '@/stores/views/character/setup'

import { type ComboSkillState } from '@/lib/Character/CharacterCombo'
import { StatRecorded } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import CharacterSkillItemOptions from '../character-skill/character-skill-tab/character-skill-item-options.vue'
import CharacterComboItemDamageResultItem from './character-combo-item-damage-result-item.vue'
import CharacterComboItemResultItem from './character-combo-item-result-item.vue'

import { getContainerStats } from '../character-damage/setup'

interface Props {
  comboSkillState: ComboSkillState
  skillResultsState: SkillResultsState
}

const props = defineProps<Props>()
const characterStore = useCharacterStore()
const { t } = useI18n()

const resultItemRefs: Ref<
  InstanceType<typeof CharacterComboItemDamageResultItem>[]
> = ref([])

const expectedResultSum = computed(() => {
  return resultItemRefs.value.reduce(
    (cur, item) => cur + item.expectedResult,
    0
  )
})

const skillIconPath = computed(() =>
  getSkillIconPath(props.skillResultsState.skill)
)

const previousSkillNextResultsState = computed(() => {
  const previousSkill = props.comboSkillState.comboSkill.previousSkill?.skill
  if (!previousSkill) {
    return null
  }
  const resultsState = characterStore.nextSkillResultStates.find(
    state => (state.skill as Skill) === previousSkill
  ) as SkillResultsState | undefined
  return resultsState ?? null
})

const extraStats = computed(() => {
  if (!previousSkillNextResultsState.value) {
    return []
  }
  const stats: StatRecorded[] = []
  previousSkillNextResultsState.value.results.forEach(result => {
    stats.push(...getContainerStats(characterStore, result.container))
    result.suffixContainers.forEach(sufContainer => {
      stats.push(...getContainerStats(characterStore, sufContainer))
    })
  })
  return stats
})

defineExpose({
  expectedResultSum,
  skill: computed(() => props.skillResultsState.skill),
})
</script>
