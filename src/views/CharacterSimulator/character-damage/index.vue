<template>
  <SideFloat
    :visible="visible"
    content-class="pt-2 pb-4 px-2"
    @update:visible="emit('close')"
  >
    <cy-tabs v-model="tabIndex" class="mx-2 mb-4">
      <cy-tab :value="0">
        {{ t('character-simulator.character-damage.title') }}
      </cy-tab>
      <cy-tab :value="1">
        {{ t('character-simulator.character-damage.options-base-title') }}
      </cy-tab>
    </cy-tabs>
    <div v-if="tabIndex === 0" class="px-3">
      <div class="mt-4">
        <cy-button-check
          v-model:selected="store.calculationOptions.forceCritical"
        >
          {{ t('character-simulator.character-damage.force-critical') }}
        </cy-button-check>
      </div>
      <div
        v-if="validResultStates.length > 0"
        class="w-full overflow-x-auto py-4"
      >
        <CardRowsWrapper>
          <CardRows>
            <CharacterDamageSkillItem
              v-for="skillResultsState in validResultStates"
              :key="skillResultsState.skill.skillId"
              :skill-results-state="skillResultsState"
            />
          </CardRows>
        </CardRowsWrapper>
      </div>
      <cy-default-tips v-else>
        {{ t('character-simulator.character-damage.no-any-skill-tips') }}
      </cy-default-tips>
      <div class="mt-4 space-y-1">
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
    <div v-if="tabIndex === 1" class="px-3">
      <RenderSectionHeader
        :title="t('character-simulator.character-damage.options-base-title')"
      />
      <div class="mt-3 space-y-2">
        <cy-input-counter
          v-model:value="store.calculationOptions.proration"
          :range="[50, 250]"
          :title="t('damage-calculation.item-base-titles.proration')"
        />
        <cy-input-counter
          v-model:value="store.calculationOptions.comboRate"
          :range="[10, 150]"
          :title="t('damage-calculation.item-base-titles.combo_multiplier')"
        />
      </div>
      <RenderSectionHeader
        :title="t('character-simulator.character-damage.options-other-title')"
      />
      <div class="mt-3">
        <cy-button-check
          v-model:selected="store.calculationOptions.armorBreakDisplay"
        >
          {{ t('character-simulator.character-damage.armor-break-display') }}
        </cy-button-check>
      </div>
      <RenderSectionHeader
        :title="t('character-simulator.character-damage.target-options-title')"
      />
      <div class="mt-3 space-y-2">
        <cy-input-counter
          v-model:value="store.targetProperties.level"
          :title="t('damage-calculation.item-base-titles.target_level')"
        />
        <cy-input-counter
          v-model:value="store.targetProperties.def"
          :title="t('damage-calculation.item-base-titles.target_def')"
        />
        <cy-input-counter
          v-model:value="store.targetProperties.mdef"
          :title="t('damage-calculation.item-base-titles.target_mdef')"
        />
        <cy-input-counter
          v-model:value="store.targetProperties.physicalResistance"
          :title="
            t('damage-calculation.item-base-titles.target_physical_resistance')
          "
          unit="%"
        />
        <cy-input-counter
          v-model:value="store.targetProperties.magicResistance"
          :title="
            t('damage-calculation.item-base-titles.target_magic_resistance')
          "
          unit="%"
        />
        <cy-input-counter
          v-model:value="store.targetProperties.dodge"
          :title="t('damage-calculation.item-base-titles.target_dodge')"
        />
        <cy-input-counter
          v-model:value="store.targetProperties.criticalRateResistance"
          :title="
            t(
              'damage-calculation.item-base-titles.target_critical_rate_resistance'
            )
          "
          unit="%"
        />

        <cy-input-counter
          v-model:value="store.targetProperties.criticalRateResistanceTotal"
          :title="
            t(
              'damage-calculation.item-base-titles.target_critical_rate_resistance_total'
            )
          "
          unit="%"
        />
      </div>
      <RenderSectionHeader
        :title="t('character-simulator.character-damage.range-damage-title')"
      />
      <div class="mt-2">
        <cy-button-radio-group
          v-model:value="store.targetProperties.rangeDamage"
          :options="rangeDamageOptions"
        />
      </div>
      <RenderSectionHeader
        :title="t('character-simulator.enemy-elements.title')"
      />
      <div class="mt-2">
        <cy-button-radio-group
          v-model:value="store.targetProperties.element"
          :options="elementOptions"
        />
      </div>
    </div>
  </SideFloat>
</template>

<script lang="tsx" setup>
import { computed } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { CalculationItemIds } from '@/lib/Damage/DamageCalculation'
import { EnemyElements } from '@/lib/Enemy/Enemy'

import SideFloat from '@/components/app-layout/side-float/side-float.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

// import CardContent from '@/components/card/card-content.vue'
import CharacterDamageSkillItem from './character-damage-skill-item.vue'

import { setupCharacterSkillBuildStore, setupCharacterStore } from '../setup'

interface Props {
  visible: boolean
}
interface Emits {
  (evt: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

defineOptions({
  name: 'CharacterDamage',
})

const { store } = setupCharacterStore()
const { t } = useI18n()

const tabIndex = ref(0)

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

const RenderSectionHeader = ({ title }: { title: string }) => {
  return (
    <div class="mt-6 flex items-center text-sm text-stone-40">
      <cy-icon
        icon="ic:round-format-list-bulleted"
        color="stone"
        small
        class="mr-3"
      />
      {title}
    </div>
  )
}
</script>
