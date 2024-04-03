<template>
  <div>
    <div class="flex w-full flex-wrap items-center">
      <cy-button-check v-model:selected="enabled" color="orange" inline>
        {{ result.container.get('name') }}
      </cy-button-check>
      <div class="ml-3 flex items-center space-x-0.5">
        <div v-if="valid" class="text-primary-50">
          {{ expectedResult }}
        </div>
        <div v-else class="text-primary-30">
          {{ t('character-simulator.character-damage.no-result') }}
        </div>
        <cy-icon
          v-if="frequencyVisible && result.container.get('frequency')"
          icon="ic-round-close"
        />
        <span
          v-if="frequencyVisible"
          class="attr-item"
          v-html="result.container.get('frequency')"
        />
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
            characterStore.getDamageCalculationSkillBranchState(
              extraContainer.branchItem.default
            ).enabled
          "
        />
        <CharacterSkillItemStats
          :stat-containers="extraContainer.statContainers"
        />
      </div>
    </div>
    <div
      v-if="contents.detail"
      class="mt-2 border-1 border-primary-30 bg-white px-3 py-2 text-sm"
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

import { useCharacterStore } from '@/stores/views/character'
import { SkillResult } from '@/stores/views/character/setup'

import ToggleService from '@/shared/setup/ToggleService'
import { markText } from '@/shared/utils/view'

import { StatRecorded } from '@/lib/Character/Stat'
import { CalcItem, ContainerTypes } from '@/lib/Damage/DamageCalculation'
import { SkillBranch } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'

import { setupSkilResultExtraStats } from '../character-damage/setup'

interface Props {
  result: SkillResult
  comboRate: number
  unselectedBranches: SkillBranch[]
  extraStats: StatRecorded[]
}
interface Emits {
  (evt: 'update:unselected-branches', value: SkillBranch[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const enabled = computed({
  get() {
    return !props.unselectedBranches.includes(
      props.result.container.branchItem.default
    )
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

const characterStore = useCharacterStore()
const { t } = useI18n()
const { contents, toggle } = ToggleService({
  contents: ['detail'] as const,
})

const result = computed(() => props.result)

const { extraStats: baseExtraStats } = setupSkilResultExtraStats(result)
const extraStats = computed(() => [
  ...baseExtraStats.value,
  ...props.extraStats,
])

const { valid, calculation, expectedResult } =
  characterStore.setupDamageCalculationExpectedResult(
    result,
    extraStats,
    computed(() => characterStore.targetProperties),
    computed(() => ({
      ...characterStore.calculationOptions,
      comboRate: props.comboRate,
    }))
  )

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
  return props.result.suffixContainers.filter(
    suf =>
      suf.branchItem.is(SkillBranchNames.Extra) && suf.statContainers.length > 0
  )
})

defineExpose({
  valid,
  calculation,
  expectedResult: computed(() => (enabled.value ? expectedResult.value : 0)),
})
</script>
