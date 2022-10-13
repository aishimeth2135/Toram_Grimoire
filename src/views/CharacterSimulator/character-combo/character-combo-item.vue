<template>
  <div class="border-l-2 border-primary-30 px-4 py-2">
    <!-- <div class="flex items-center justify-center">
      <div>
        <cy-icon-text icon="mdi-sword" color="red">{{ expectedDamageSum }}</cy-icon-text>
      </div>
    </div> -->
    <div class="flex max-w-full items-start overflow-x-auto">
      <div class="text-primary-30">
        <div class="mb-4">{{ `#${index + 1}` }}</div>
        <cy-button-icon
          icon="mdi-sword"
          color="cyan"
          :selected="damageCalcEnabled"
          @click="
            damageCalcEnabled =
              !damageCalcEnabled /* eslint-disable-line vue/no-mutating-props */
          "
        />
      </div>
      <CharacterComboItemSkill
        v-for="state in comboSkillStates"
        :key="state.itemId"
        :combo-skill-state="state"
        :damage-ratio="
          damageCalcEnabled && state.comboSkill.skill
            ? getDamageRatio(state.comboSkill.skill)
            : null
        "
      />
      <div class="flex w-28 justify-center">
        <div
          class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-1 border-primary-30 duration-200 hover:border-primary-50"
          @click="selectComboSkill(combo.appendSkill())"
        >
          <cy-icon-text icon="ic-round-add" icon-width="2.25rem" />
        </div>
      </div>
    </div>
    <div v-if="damageCalcEnabled" class="mt-3">
      <div
        class="relative flex items-center border-b border-violet-30 px-1 py-0.5"
      >
        <cy-icon-text
          icon="mdi-sword"
          icon-color="violet-30"
          text-color="violet-30"
          small
        >
          {{ t('character-simulator.combo.damage-calc.damage-sum-title') }}
        </cy-icon-text>
        <span class="ml-3 text-violet-60">{{ expectedDamageSum }}</span>
        <div class="absolute bottom-0 right-0 h-3 w-3 bg-violet-30" />
      </div>
      <div class="mt-1 divide-y divide-primary-30">
        <CharacterComboItemDamageItem
          v-for="{ resultsState, comboSkillState } in comboSkillStateItems"
          :key="resultsState.skill.skillId"
          ref="comboDamageItemRefs"
          :combo-skill-state="comboSkillState"
          :skill-results-state="resultsState"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { numberToFixed } from '@/shared/utils/number'
import { isNumberString } from '@/shared/utils/string'

import { CharacterCombo, ComboSkillState } from '@/lib/Character/CharacterCombo'
import { Skill } from '@/lib/Skill/Skill'
import { SkillBuffs } from '@/lib/Skill/SkillComputingContainer/enums'

import CharacterComboItemDamageItem from './character-combo-item-damage-item.vue'
import CharacterComboItemSkill from './character-combo-item-skill.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'
import { setupCharacterStore } from '../setup'

interface Props {
  index: number
  combo: CharacterCombo
}

const props = defineProps<Props>()

const damageCalcEnabled = computed({
  get() {
    return props.combo.config.damageCalc
  },
  set(value) {
    // eslint-disable-next-line vue/no-mutating-props
    props.combo.config.damageCalc = value
  },
})

const comboDamageItemRefs: Ref<
  InstanceType<typeof CharacterComboItemDamageItem>[]
> = ref([])

const expectedDamageSum = computed(() =>
  comboDamageItemRefs.value.reduce(
    (sum, item) => sum + item.expectedResultSum,
    0
  )
)
const { store } = setupCharacterStore()
const { t } = useI18n()

const getMpCost = (skill: Skill, previous: Skill | null) => {
  const states = store.damageSkillResultStates as SkillResultsState[]
  const resultState = states.find(
    state => state.skill.skillId === skill.skillId
  )
  if (!resultState || !resultState.basicContainer) {
    return 0
  }
  const previousResultState = previous
    ? store.nextSkillResultStates.find(
        state => state.skill.skillId === previous.skillId
      )
    : null
  const mpCost = resultState.basicContainer.getValue('mp_cost')
  if (isNumberString(mpCost)) {
    let value = parseInt(mpCost, 10)
    if (
      previousResultState?.results.some(result =>
        result.container.branchItem.buffs?.has(SkillBuffs.MpCostHalf)
      )
    ) {
      value = Math.ceil(value / 200) * 100
    }
    return value
  }
  return 0
}

const checkSkillValid = (skill: Skill) => {
  if (!store.skillItemStates.has(skill)) {
    return false
  }
  return store.skillItemStates.get(skill)!.effectItem.value !== null
}

const comboSkillStates = computed(() =>
  props.combo.getComboSkillStates({ getMpCost, checkSkillValid })
)

const comboSkillStateItems = computed(() => {
  const allResultsStates = store.damageSkillResultStates as SkillResultsState[]
  return comboSkillStates.value
    .map(comboSkillState => {
      const skill = comboSkillState.comboSkill.skill
      if (!skill) {
        return {
          comboSkillState,
          resultsState: null,
        }
      }
      const resultsState =
        allResultsStates.find(state => state.skill.skillId === skill.skillId) ??
        null
      return {
        comboSkillState,
        resultsState,
      }
    })
    .filter(item => item.resultsState !== null) as {
    comboSkillState: ComboSkillState
    resultsState: SkillResultsState
  }[]
})

const getDamageRatio = (skill: Skill) => {
  if (expectedDamageSum.value === 0) {
    return 0
  }
  const component = comboDamageItemRefs.value.find(item => item.skill === skill)
  return component
    ? numberToFixed(
        (component.expectedResultSum * 100) / expectedDamageSum.value,
        2
      )
    : 0
}

const { selectComboSkill } = inject(CharacterSimulatorInjectionKey)!
</script>
