<template>
  <div class="px-2">
    <div class="mb-3 border-b-1 border-primary-30 pb-2">
      <div
        class="flex cursor-pointer items-center border-l-2 py-1 px-2 duration-200 hover:border-primary-30"
        :class="contents.basicMenu ? 'border-primary-30' : 'border-primary-30'"
        @click="toggle('contents/basicMenu')"
      >
        <cy-icon-text icon="ic:round-format-list-bulleted" color="fuchsia">
          {{ t('character-simulator.character-damage.options-base-title') }}
        </cy-icon-text>
      </div>
      <div
        v-if="contents.basicMenu"
        class="space-y-1.5 border-l-2 border-primary-30 px-2 py-2"
      >
        <div>
          <cy-input-counter
            v-model:value="store.calculationOptions.proration"
            :range="[50, 250]"
          >
            <template #title>
              <cy-icon-text>{{
                t('damage-calculation.item-base-titles.proration')
              }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter
            v-model:value="store.calculationOptions.comboRate"
            :range="[10, 150]"
          >
            <template #title>
              <cy-icon-text>{{
                t('damage-calculation.item-base-titles.combo_multiplier')
              }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div class="pt-2">
          <cy-icon-text text-color="fuchsia-60" small>
            {{ t('character-simulator.character-damage.options-other-title') }}
          </cy-icon-text>
          <div>
            <cy-button-check
              v-model:selected="store.calculationOptions.armorBreakDisplay"
            >
              {{
                t('character-simulator.character-damage.armor-break-display')
              }}
            </cy-button-check>
          </div>
        </div>
      </div>
      <div
        class="mt-3 flex cursor-pointer items-center border-l-2 py-1 px-2 duration-200 hover:border-primary-30"
        :class="contents.targetMenu ? 'border-primary-30' : 'border-primary-30'"
        @click="toggle('contents/targetMenu')"
      >
        <cy-icon-text icon="ic:round-format-list-bulleted" color="fuchsia">
          {{ t('character-simulator.character-damage.target-options-title') }}
        </cy-icon-text>
      </div>
      <div
        v-if="contents.targetMenu"
        class="space-y-1.5 border-l-2 border-primary-30 px-2 py-2"
      >
        <div>
          <cy-input-counter v-model:value="store.targetProperties.level">
            <template #title>
              <cy-icon-text>{{
                t('damage-calculation.item-base-titles.target_level')
              }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.def">
            <template #title>
              <cy-icon-text>{{
                t('damage-calculation.item-base-titles.target_def')
              }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.mdef">
            <template #title>
              <cy-icon-text>{{
                t('damage-calculation.item-base-titles.target_mdef')
              }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter
            v-model:value="store.targetProperties.physicalResistance"
          >
            <template #title>
              <cy-icon-text>{{
                t(
                  'damage-calculation.item-base-titles.target_physical_resistance'
                )
              }}</cy-icon-text>
            </template>
            <template #unit>%</template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter
            v-model:value="store.targetProperties.magicResistance"
          >
            <template #title>
              <cy-icon-text>{{
                t('damage-calculation.item-base-titles.target_magic_resistance')
              }}</cy-icon-text>
            </template>
            <template #unit>%</template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.dodge">
            <template #title>
              <cy-icon-text>{{
                t('damage-calculation.item-base-titles.target_dodge')
              }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter
            v-model:value="store.targetProperties.criticalRateResistance"
          >
            <template #title>
              <cy-icon-text>{{
                t(
                  'damage-calculation.item-base-titles.target_critical_rate_resistance'
                )
              }}</cy-icon-text>
            </template>
            <template #unit>%</template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter
            v-model:value="store.targetProperties.criticalRateResistanceTotal"
          >
            <template #title>
              <cy-icon-text>{{
                t(
                  'damage-calculation.item-base-titles.target_critical_rate_resistance_total'
                )
              }}</cy-icon-text>
            </template>
            <template #unit>%</template>
          </cy-input-counter>
        </div>
        <div class="pt-2.5">
          <cy-icon-text text-color="fuchsia-60" small>
            {{ t('character-simulator.character-damage.range-damage-title') }}
          </cy-icon-text>
          <cy-button-radio-group
            v-model:value="store.targetProperties.rangeDamage"
            :options="rangeDamageOptions"
          />
        </div>
        <div class="pt-2">
          <cy-icon-text text-color="fuchsia-60" small>
            {{ t('character-simulator.enemy-elements.title') }}
          </cy-icon-text>
          <cy-button-radio-group
            v-model:value="store.targetProperties.element"
            :options="elementOptions"
          />
        </div>
      </div>
      <div class="space-y-1 pt-3 pb-2">
        <div>
          <cy-icon-text
            icon="ic-outline-info"
            text-color="primary-50"
            align-v="start"
            small
          >
            {{ t('character-simulator.character-damage.basic-tips.0') }}
          </cy-icon-text>
        </div>
        <div>
          <cy-icon-text
            icon="ic-outline-info"
            text-color="primary-50"
            align-v="start"
            small
          >
            {{ t('character-simulator.character-damage.test-version-tips') }}
          </cy-icon-text>
        </div>
      </div>
    </div>
    <div v-if="validResultStates.length > 0" class="w-full overflow-x-auto">
      <div style="min-width: 22.5rem">
        <CharacterDamageSkillItem
          v-for="skillResultsState in validResultStates"
          :key="skillResultsState.skill.skillId"
          :skill-results-state="skillResultsState"
        />
      </div>
    </div>
    <cy-default-tips v-else>
      {{ t('character-simulator.character-damage.no-any-skill-tips') }}
    </cy-default-tips>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterDamage',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'
import { EnemyElements } from '@/lib/Enemy/enums'

import ToggleService from '@/setup/ToggleService'

import CharacterDamageSkillItem from './character-damage-skill-item.vue'

import { setupCharacterSkillBuildStore, setupCharacterStore } from '../setup'

const { store } = setupCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['basicMenu', 'targetMenu'] as const,
})

const skillResultsStates = computed(
  () => store.damageSkillResultStates as SkillResultsState[]
)

const { currentSkillBuild } = setupCharacterSkillBuildStore()
const validResultStates = computed(() => {
  return skillResultsStates.value.filter(
    state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0
  )
})

const elementOptions: {
  text: string
  value: null | EnemyElements
}[] = [
  {
    text: t('character-simulator.character-damage.element-none'),
    value: null,
  },
  {
    text: t('character-simulator.enemy-elements.neutral'),
    value: EnemyElements.Neutral,
  },
  {
    text: t('character-simulator.enemy-elements.fire'),
    value: EnemyElements.Fire,
  },
  {
    text: t('character-simulator.enemy-elements.water'),
    value: EnemyElements.Water,
  },
  {
    text: t('character-simulator.enemy-elements.wind'),
    value: EnemyElements.Wind,
  },
  {
    text: t('character-simulator.enemy-elements.earth'),
    value: EnemyElements.Earth,
  },
  {
    text: t('character-simulator.enemy-elements.light'),
    value: EnemyElements.Light,
  },
  {
    text: t('character-simulator.enemy-elements.dark'),
    value: EnemyElements.Dark,
  },
]

const rangeDamageOptions: {
  text: string
  value: CalculationItemIds
}[] = [
  {
    text: t('damage-calculation.item-base-titles.short_range_damage'),
    value: CalculationItemIds.ShortRangeDamage,
  },
  {
    text: t('damage-calculation.item-base-titles.long_range_damage'),
    value: CalculationItemIds.LongRangeDamage,
  },
]
</script>
