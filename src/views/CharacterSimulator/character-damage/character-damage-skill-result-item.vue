<template>
  <div>
    <div class="flex items-center flex-wrap w-full">
      <cy-icon-text icon="ic:round-label" color="orange">
        {{ result.container.get('name') }}
      </cy-icon-text>
      <div class="flex items-center space-x-0.5 ml-3">
        <div v-if="valid" class="text-primary-50">
          {{ expectedResult }}
        </div>
        <div v-else class="text-primary-30">
          {{ t('character-simulator.character-damage.no-result') }}
        </div>
        <cy-icon-text
          v-if="frequencyVisible && result.container.get('frequency')"
          icon="ic-round-close"
        />
        <span
          v-if="frequencyVisible"
          class="attr-item"
          v-html="result.container.get('frequency')"
        />
      </div>
      <div v-if="valid && store.calculationOptions.armorBreakDisplay" class="flex items-baseline pl-2.5 ml-3 border-l border-primary-30">
        <div class="text-blue-30 text-sm mr-2">
          {{ t('character-simulator.character-damage.armor-break') }}
        </div>
        <div class="flex items-center space-x-0.5">
          <div class="text-blue-60">
            {{ armorBreakExpectedResult }}
          </div>
          <cy-icon-text
            v-if="frequencyVisible && result.container.get('frequency')"
            icon="ic-round-close"
          />
          <span
            v-if="frequencyVisible"
            class="attr-item"
            v-html="result.container.get('frequency')"
          />
        </div>
      </div>
      <cy-button-icon icon="majesticons:checkbox-list-detail-line" class="ml-auto" @click="toggle('contents/detail')" />
    </div>
    <div v-if="statExtraContainers.length > 0" class="pt-2 pb-1 pl-2 space-y-1">
      <div
        v-for="extraContainer in statExtraContainers"
        :key="extraContainer.instanceId"
        class="flex items-center"
      >
        <cy-button-toggle
          v-model:selected="store.getDamageCalculationSkillBranchState(extraContainer.branchItem.default).enabled"
        />
        <CharacterSkillItemStats
          v-if="extraContainer.statContainers.length > 0"
          :stat-containers="extraContainer.statContainers"
        />
        <div v-else-if="extraContainer.has('dual_element')" class="py-0 5 pl-1 flex items-center">
          <div v-if="extraContainer.has('condition')" class="text-primary-30 text-sm mr-3">{{ extraContainer.get('condition') }}</div>
          <div class="mr-2 text-orange-60">{{ t('skill-query.branch.dual-element-title') }}</div>
          <div class="text-violet-60">{{ extraContainer.get('dual_element') }}</div>
        </div>
      </div>
    </div>
    <div v-if="contents.detail" class="text-sm px-3 py-2 border-1 border-primary-30 mt-2 bg-white">
      <div
        v-for="item in calculationItems"
        :key="item.item.base.id"
        class="flex items-center space-x-2"
        :class="{ 'opacity-50': item.hidden }"
      >
        <div
          :class="{ 'text-orange-60': !item.valueValid }"
          v-html="markText(t('damage-calculation.item-base-titles.' + item.item.base.id))"
        ></div>
        <div
          v-if="item.valueValid"
          class="text-primary-50"
        >
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

import { markText } from '@/shared/utils/view'

import { CalcItem } from '@/lib/Calculation/Damage/Calculation'
import { ContainerTypes } from '@/lib/Calculation/Damage/Calculation/enums'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import ToggleService from '@/setup/ToggleService'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'

import { setupCharacterStore } from '../setup'
import { setupSkilResultExtraStats, setupStoreDamageCalculationExpectedResult } from './setup'


interface Props {
  result: SkillResult;
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const result = computed(() => props.result)

const { extraStats } = setupSkilResultExtraStats(result)

const { valid, calculation, expectedResult } = setupStoreDamageCalculationExpectedResult(result, extraStats)

const { expectedResult: armorBreakExpectedResult } = setupStoreDamageCalculationExpectedResult(result, extraStats, { armorBreak: true })

const frequencyVisible = computed(() => {
  return valid.value && props.result.container.branchItem.prop('title') === 'each'
})

const calculationItems = computed(() => {
  const containers = [...calculation.value.containers.values()]
  const items: {
    item: CalcItem;
    hidden: boolean;
    valueValid: boolean;
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
      items.push(...[...container.items.values()].map(item => ({
        item,
        hidden,
        valueValid,
      })))
    }
  })
  return items
})

const statExtraContainers = computed(() => {
  return props.result.suffixContainers
    .filter(suf => {
      if (!suf.branchItem.is(SkillBranchNames.Extra)) {
        return false
      }
      return suf.statContainers.length > 0 || suf.has('dual_element')
    })
})
</script>
