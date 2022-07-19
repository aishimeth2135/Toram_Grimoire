<template>
  <div>
    <div class="flex items-center flex-wrap w-full">
      <cy-button-check v-model:selected="enabled" color="orange" inline>
        {{ result.container.get('name') }}
      </cy-button-check>
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
    <div v-if="statExtraContainers.length > 0" class="pt-2 pb-1 pl-2 space-y-1">
      <div
        v-for="extraContainer in statExtraContainers"
        :key="extraContainer.instanceId"
        class="flex items-center"
      >
        <cy-button-toggle
          v-model:selected="store.getDamageCalculationSkillBranchState(extraContainer.branchItem.default).enabled"
        />
        <CharacterSkillItemStats :stat-containers="extraContainer.statContainers" />
      </div>
    </div>
    <div v-if="contents.detail" class="text-sm px-3 py-2 border-1 border-light mt-2 bg-white">
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResult } from '@/stores/views/character/setup'

import { markText } from '@/shared/utils/view'

import { CalcItem } from '@/lib/Calculation/Damage/Calculation'
import { ContainerTypes } from '@/lib/Calculation/Damage/Calculation/enums'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { SkillBranch } from '@/lib/Skill/Skill'
import { StatRecorded } from '@/lib/Character/Stat'

import ToggleService from '@/setup/ToggleService'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'

import { setupCharacterStore } from '../setup'
import { setupSkilResultExtraStats } from '../character-damage/setup'

interface Props {
  result: SkillResult;
  comboRate: number;
  unselectedBranches: SkillBranch[];
  extraStats: StatRecorded[];
}
interface Emits {
  (evt: 'update:unselected-branches', value: SkillBranch[]): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const enabled = computed({
  get() {
    return !props.unselectedBranches.includes(props.result.container.branchItem.default)
  },
  set(value) {
    const unselectedBranches = props.unselectedBranches?.slice()
    if (unselectedBranches) {
      const branch = props.result.container.branchItem.default
      if (value) {
        const idx = unselectedBranches.indexOf(branch)
        unselectedBranches.splice(idx, 1)
      } else {
        unselectedBranches.push(branch)
      }
      emit('update:unselected-branches', unselectedBranches)
    }
  },
})

const { store } = setupCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const result = computed(() => props.result)

const { extraStats: baseExtraStats } = setupSkilResultExtraStats(result)
const extraStats = computed(() => [...baseExtraStats.value, ...props.extraStats])

const { valid, calculation, expectedResult } = store.setupDamageCalculationExpectedResult(
  result,
  extraStats,
  computed(() => store.targetProperties),
  computed(() => ({
    ...store.calculationOptions,
    comboRate: props.comboRate,
  })),
)

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
    .filter(suf => suf.branchItem.is(SkillBranchNames.Extra) && suf.statContainers.length > 0)
})

defineExpose({
  valid,
  calculation,
  expectedResult: computed(() => enabled.value ? expectedResult.value : 0),
})
</script>
