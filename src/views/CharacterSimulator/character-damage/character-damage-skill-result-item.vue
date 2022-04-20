<template>
  <div>
    <div class="flex items-center w-full">
      <cy-icon-text icon="ic:round-label" main-color="orange">
        {{ result.container.get('name') }}
      </cy-icon-text>
      <div class="flex items-center space-x-0.5 ml-3">
        <div v-if="valid" class="text-light-3">
          {{ expectedResult }}
        </div>
        <div v-else class="text-light-2">
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
      <cy-button-icon icon="majesticons:checkbox-list-detail-line" class="ml-auto" @click="toggle('contents/detail')" />
    </div>
    <div v-if="statExtraContainers.length > 0" class="py-1 pl-2">
      <div
        v-for="extraContainer in statExtraContainers"
        :key="extraContainer.instanceId"
        class="flex items-center"
      >
        <cy-button-switch
          :selected="getSuffixBranchState(extraContainer.branchItem).enabled"
          @click="toggleSuffixBranchEnabled(extraContainer.branchItem)"
        />
        <CharacterSkillItemStats :stat-containers="extraContainer.statContainers" />
      </div>
    </div>
    <div v-if="contents.detail" class="text-sm px-4 py-2 border-1 border-light mt-2">
      <div
        v-for="item in calculationItems"
        :key="item.item.base.id"
        class="flex items-center space-x-2"
        :class="{ 'opacity-50': item.hidden }"
      >
        <div
          :class="{ 'text-orange': !item.valueValid }"
          v-html="markText(t('damage-calculation.item-base-titles.' + item.item.base.id))"
        ></div>
        <div
          v-if="item.valueValid"
          class="text-light-3"
        >
          {{ item.item.value + item.item.base.unit }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResult } from '@/stores/views/character/setup'

import { markText } from '@/shared/utils/view'
import { isNumberString } from '@/shared/utils/string'

import { CalcItem } from '@/lib/Calculation/Damage/Calculation'
import { ContainerTypes } from '@/lib/Calculation/Damage/Calculation/enums'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { Stat } from '@/lib/Character/Stat'
import { SkillBranch } from '@/lib/Skill/Skill'
import { SkillBranchItem, SkillBranchItemSuffix, SkillEffectItem } from '@/lib/Skill/SkillComputingContainer'

import ToggleService from '@/setup/ToggleService'

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/utils/DisplayDataContainer'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'

import { setupCharacterStore } from '../setup'


interface Props {
  result: SkillResult;
  basicContainer: DisplayDataContainer<SkillBranchItem<SkillEffectItem>>  | null;
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const suffixBranchStates = ref(new Map<SkillBranch, { enabled: boolean }>())

watch(() => props.result, newValue => {
  const current = newValue.suffixContainers.filter(sufContainer => sufContainer.statContainers.length > 0)
  for (const key of suffixBranchStates.value.keys()) {
    if (!current.some(sufContainer => sufContainer.branchItem.default === key)) {
      suffixBranchStates.value.delete(key)
    }
  }
})

const getSuffixBranchState = (branchItem: SkillBranchItemSuffix) => {
  if (!suffixBranchStates.value.has(branchItem.default)) {
    suffixBranchStates.value.set(branchItem.default, { enabled: true })
  }
  return suffixBranchStates.value.get(branchItem.default)!
}

const toggleSuffixBranchEnabled = (branchItem: SkillBranchItemSuffix) => {
  const state = getSuffixBranchState(branchItem)
  state.enabled = !state.enabled
}

const extraStats = computed(() => {
  const stats: Stat[] = []
  props.result.suffixContainers.forEach(sufContainer => {
    if (!suffixBranchStates.value.get(sufContainer.branchItem.default)?.enabled) {
      return
    }
    sufContainer.statContainers.forEach(statContainer => {
      if (isNumberString(statContainer.value)) {
        stats.push(statContainer.stat.toStat(parseFloat(statContainer.value)))
      }
    })
  })
  return stats
})

const { valid, calculation, expectedResult } = store.setupDamageCalculationExpectedResult(
  computed(() => props.result),
  computed(() => props.basicContainer),
  extraStats,
  computed(() => store.targetProperties),
  computed(() => store.calculationOptions),
)

const frequencyVisible = computed(() => {
  return props.result.container.branchItem.attr('title') === 'each'
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
    .filter(suf => suf.branchItem.checkBranchName(SkillBranchNames.Extra) && suf.statContainers.length > 0)
})
</script>
