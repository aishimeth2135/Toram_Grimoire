<template>
  <div>
    <div class="border-b-1 border-light-2 pb-2 mb-3">
      <cy-icon-text text-color="purple" size="small">
        {{ t('character-simulator.character-damage.options-base-title') }}
      </cy-icon-text>
      <div class="space-y-1.5 pb-3 px-2 pt-1">
        <div>
          <cy-input-counter v-model:value="store.calculationOptions.proration" :range="[50, 250]">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.proration') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.calculationOptions.comboMultiplier" :range="[10, 150]">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.combo_multiplier') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </div>
      <div
        class="flex items-center cursor-pointer py-2 border-t-1 border-light px-2"
        @click="toggle('contents/targetMenu')"
      >
        <cy-icon-text icon="ant-design:build-outlined" main-color="orange">
          {{ t('character-simulator.character-damage.target-options-title') }}
        </cy-icon-text>
        <cy-button-icon
          class="ml-auto"
          :icon="contents.targetMenu ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
          :selected="contents.targetMenu"
        />
      </div>
      <div v-if="contents.targetMenu" class="space-y-1.5 px-2">
        <div>
          <cy-input-counter v-model:value="store.targetProperties.level">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.target_level') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.def">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.target_def') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.mdef">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.target_mdef') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.physicalResistance">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.target_physical_resistance') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.magicResistance">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.target_magic_resistance') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div>
          <cy-input-counter v-model:value="store.targetProperties.dodge">
            <template #title>
              <cy-icon-text>{{ t('damage-calculation.item-base-titles.target_dodge') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div class="pt-2">
          <cy-icon-text text-color="purple" size="small">
            {{ t('character-simulator.enemy-elements.title') }}
          </cy-icon-text>
          <cy-button-check-group
            v-model:value="store.targetProperties.element"
            :options="elementOptions"
          />
        </div>
      </div>
    </div>
    <div>
      <CharacterDamageSkillItem
        v-for="skillResultsState in validResultStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </div>
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

import { EnemyElements } from '@/lib/Enemy/enums'

import ToggleService from '@/setup/ToggleService'

import CharacterDamageSkillItem from './character-damage-skill-item.vue'

import { setupCharacterSkillBuildStore, setupCharacterStore } from '../setup'

const { store } = setupCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['targetMenu'] as const,
})

const skillResultsStates = computed(() => {
  return store.damageSkillResultStates as SkillResultsState[]
})

const { currentSkillBuild } = setupCharacterSkillBuildStore()
const validResultStates = computed(() => {
  return skillResultsStates.value
    .filter(state => {
      const skillState = currentSkillBuild.value!.getSkillState(state.skill)
      return skillState.level > 0 || skillState.starGemLevel > 0
    })
})

const elementOptions: {
  text: string;
  value: null | EnemyElements;
}[] = [{
  text: t('character-simulator.character-damage.element-none'),
  value: null,
}, {
  text: t('character-simulator.enemy-elements.neutral'),
  value: EnemyElements.Neutral,
}, {
  text: t('character-simulator.enemy-elements.fire'),
  value: EnemyElements.Fire,
}, {
  text: t('character-simulator.enemy-elements.water'),
  value: EnemyElements.Water,
}, {
  text: t('character-simulator.enemy-elements.wind'),
  value: EnemyElements.Wind,
}, {
  text: t('character-simulator.enemy-elements.earth'),
  value: EnemyElements.Earth,
}, {
  text: t('character-simulator.enemy-elements.light'),
  value: EnemyElements.Light,
}, {
  text: t('character-simulator.enemy-elements.dark'),
  value: EnemyElements.Dark,
}]
</script>
