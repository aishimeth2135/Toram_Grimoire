<template>
  <div>
    <div class="flex w-full flex-wrap items-center">
      <cy-icon-text icon="ic:round-label" />
      <div class="ml-2 text-primary-70">
        {{ result.container.get('name') }}
      </div>
      <div class="ml-3 flex items-center space-x-0.5">
        <div v-if="valid" class="text-primary-50">
          {{ expectedResult }}
        </div>
        <div v-else class="text-primary-30">
          {{ t('character-simulator.character-damage.no-result') }}
        </div>
        <cy-icon-text
          v-if="frequencyVisible && result.container.has('frequency')"
          icon="ic-round-close"
        />
        <SkillBranchPropValue
          v-if="frequencyVisible"
          :result="result.container.result('frequency')"
        />
      </div>
      <div
        v-if="valid && store.calculationOptions.armorBreakDisplay"
        class="ml-3 flex items-baseline border-l border-primary-30 pl-2.5"
      >
        <div class="mr-2 text-sm text-blue-30">
          {{ t('character-simulator.character-damage.armor-break') }}
        </div>
        <div class="flex items-center space-x-0.5">
          <div class="text-blue-60">
            {{ armorBreakExpectedResult }}
          </div>
          <cy-icon-text
            v-if="frequencyVisible && result.container.has('frequency')"
            icon="ic-round-close"
          />
          <SkillBranchPropValue
            v-if="frequencyVisible"
            :result="result.container.result('frequency')"
          />
        </div>
      </div>
      <cy-button-icon
        icon="majesticons:checkbox-list-detail-line"
        class="ml-auto"
        @click="toggle('contents/detail')"
      />
    </div>
    <div v-if="statExtraContainers.length > 0" class="space-y-1 pb-1 pl-2 pt-2">
      <div
        v-for="extraContainer in statExtraContainers"
        :key="extraContainer.instanceId"
        class="flex items-center"
      >
        <cy-button-toggle
          v-model:selected="
            store.getDamageCalculationSkillBranchState(
              extraContainer.branchItem.default
            ).enabled
          "
        />
        <CharacterSkillItemStats
          v-if="extraContainer.statContainers.length > 0"
          :stat-containers="extraContainer.statContainers"
        />
        <div
          v-else-if="extraContainer.has('dual_element')"
          class="5 flex items-center py-0 pl-1"
        >
          <div
            v-if="extraContainer.has('condition')"
            class="mr-3 text-sm text-primary-30"
          >
            {{ extraContainer.get('condition') }}
          </div>
          <div class="mr-2 text-orange-60">
            {{ t('skill-query.branch.dual-element-title') }}
          </div>
          <div class="text-violet-60">
            {{ extraContainer.get('dual_element') }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="contents.detail"
      class="mt-2 rounded border-1 border-primary-20 bg-white px-3 py-2 text-sm"
    >
      <div
        v-for="item in calculationItems"
        :key="item.item.base.id"
        class="flex items-center space-x-2"
        :class="{ 'opacity-50': item.hidden }"
      >
        <div
          :class="{ 'text-orange-60': !item.valueValid }"
          v-html="
            markText(
              t('damage-calculation.item-base-titles.' + item.item.base.id)
            )
          "
        ></div>
        <div v-if="item.valueValid" class="text-primary-50">
          {{ item.item.value + item.item.base.unit }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResult } from '@/stores/views/character/setup'

import ToggleService from '@/shared/setup/ToggleService'
import { markText } from '@/shared/utils/view'

import { CalcItem, ContainerTypes } from '@/lib/Damage/DamageCalculation'
import { SkillBranchNames } from '@/lib/Skill/Skill'

import SkillBranchPropValue from '@/views/SkillQuery/skill/layouts/skill-branch-prop-value.vue'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'

import { setupCharacterStore } from '../setup'
import {
  setupSkilResultExtraStats,
  setupStoreDamageCalculationExpectedResult,
} from './setup'

interface Props {
  result: SkillResult
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const result = computed(() => props.result)

const { extraStats } = setupSkilResultExtraStats(result)

const { valid, calculation, expectedResult } =
  setupStoreDamageCalculationExpectedResult(result, extraStats)

const { expectedResult: armorBreakExpectedResult } =
  setupStoreDamageCalculationExpectedResult(result, extraStats, {
    armorBreak: true,
  })

const frequencyVisible = computed(() => {
  return (
    valid.value && props.result.container.branchItem.prop('title') === 'each'
  )
})

const calculationItems = computed(() => {
  const containers = [...calculation.value.containers.values()]
  const items: {
    item: CalcItem
    hidden: boolean
    valueValid: boolean
  }[] = []
  containers.forEach(container => {
    const hidden = container.hidden
    const valueValid = container.base.controls.valueValid
    if (container.base.type === ContainerTypes.Options) {
      items.push({
        item: container.currentItem,
        hidden,
        valueValid,
      })
    } else {
      items.push(
        ...[...container.items.values()].map(item => ({
          item,
          hidden,
          valueValid,
        }))
      )
    }
  })
  return items
})

const statExtraContainers = computed(() => {
  return props.result.suffixContainers.filter(suf => {
    if (!suf.branchItem.is(SkillBranchNames.Extra)) {
      return false
    }
    return suf.statContainers.length > 0 || suf.has('dual_element')
  })
})
</script>
