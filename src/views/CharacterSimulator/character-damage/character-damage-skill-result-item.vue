<template>
  <div>
    <div class="flex w-full flex-wrap items-center">
      <cy-button-check v-model:selected="enabled" />
      <div class="text-primary-80 mr-1.5">
        {{ result.container.get('name') }}
      </div>
      <div class="ml-1 flex items-center gap-0.5">
        <div v-if="valid" class="text-primary-50">
          {{ expectedResult }}
        </div>
        <div v-else class="text-primary-30">
          {{ t('character-simulator.character-damage.no-result') }}
        </div>
        <cy-icon
          v-if="frequencyVisible && result.container.has('frequency')"
          icon="ic-round-close"
        />
        <SkillBranchPropValue
          v-if="frequencyVisible"
          :result="result.container.result('frequency')"
        />
      </div>
      <span v-if="damageSourceType === 'additional'" class="text-orange-40 ml-3 text-sm">
        {{ t('character-simulator.character-damage.damage-source.additional') }}
      </span>
      <cy-button-icon
        icon="majesticons:checkbox-list-detail-line"
        class="ml-auto"
        @click="toggleDetailVisible"
      />
    </div>
    <div
      v-for="bonus in damageSourceBonuses"
      :key="bonus.id"
      class="text-primary-50 flex items-center gap-2 pl-9 pt-1 text-sm"
    >
      <span class="text-primary-50">
        {{ bonus.name }}
      </span>
      +{{ bonus.amount }}
    </div>
    <div v-if="statExtraContainers.length > 0" class="space-y-1 pb-1 pl-2 pt-2">
      <div
        v-for="extraContainer in statExtraContainers"
        :key="extraContainer.instanceId"
        class="flex items-center"
      >
        <cy-button-toggle
          v-model:selected="
            characterStore.currentCharacterState.skillBuild!.getSkillBranchState(
              extraContainer.branchItem
            ).enabled
          "
        />
        <div class="pl-1">
          <div v-if="extraContainer.branchItem.hasProp('self_buffs')">
            <SkillBranchPropValue
              v-for="buff in parseSkillSelfBuffs(extraContainer.branchItem.prop('self_buffs'))"
              :key="buff"
              :result="extraContainer.result(`self_buffs/${buff}`)"
            />
          </div>
          <CharacterSkillItemStats
            v-if="extraContainer.statContainers.length > 0"
            :stat-containers="extraContainer.statContainers"
          />
          <div v-else-if="extraContainer.has('dual_element')" class="5 flex items-center py-0">
            <div v-if="extraContainer.has('condition')" class="text-primary-30 mr-3 text-sm">
              {{ extraContainer.get('condition') }}
            </div>
            <div class="text-orange-60 mr-2">
              {{ t('skill-query.branch.dual-element-title') }}
            </div>
            <div class="text-violet-60">
              {{ extraContainer.get('dual_element') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <CharacterDamageBuffs :result="result" />
    <div
      v-if="detailVisible"
      class="border-primary-20 mt-2 rounded-sm border-2 bg-white px-3 py-2 text-sm"
    >
      <div
        v-for="item in calculationItems"
        :key="item.id"
        class="flex items-center space-x-2"
        :class="{ 'opacity-50': item.hidden }"
      >
        <div
          :class="{ 'text-orange-60': !item.valueValid }"
          v-html="markText(t('damage-calculation.item-base-titles.' + item.id))"
        ></div>
        <div v-if="item.valueValid" class="text-primary-50">
          {{ item.value + item.unit }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillResult } from '@/stores/views/character/setup'

import { useToggle } from '@/shared/composables/State'
import { markText } from '@/shared/utils/view'

import { getDamageHit, parseSkillSelfBuffs } from '@/lib/Skill/Properties'
import { SkillBranchNames } from '@/lib/Skill/Skill'
import { getDamageSource } from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from '@/components/views/skill/branch/layouts/skill-branch-prop-value.vue'

import CharacterSkillItemStats from '../character-skill/character-skill-tab/character-skill-item-stats.vue'
import CharacterDamageBuffs from './character-damage-buffs.vue'

import {
  setupDamageSourceBonuses,
  setupSkilResultExtraStats,
  setupStoreDamageCalculationExpectedResult,
} from './setup'

interface Props {
  result: SkillResult
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()
const { t } = useI18n()
const detailVisible = ref(false)
const toggleDetailVisible = useToggle(detailVisible)

const enabled = computed<boolean>({
  get() {
    return characterStore.currentCharacterState.skillBuild!.getSkillBranchState(
      props.result.container.branchItem
    ).enabled
  },
  set(value) {
    characterStore.currentCharacterState.skillBuild!.getSkillBranchState(
      props.result.container.branchItem
    ).enabled = value
  },
})

const result = computed(() => props.result)
const damageSourceBonuses = setupDamageSourceBonuses(result)
const damageSourceType = computed(() =>
  getDamageSource(props.result.container.branchItem)?.prop('type')
)

const { extraStats } = setupSkilResultExtraStats(result)

const { valid, calculationItems, expectedResult } = setupStoreDamageCalculationExpectedResult(
  result,
  extraStats
)

const frequencyVisible = computed(() => {
  const branch = props.result.container.branchItem
  return valid.value && branch.prop('title') === 'each' && !getDamageHit(branch)
})

const statExtraContainers = computed(() => {
  return props.result.suffixContainers.filter(suf => {
    if (!suf.branchItem.isA(SkillBranchNames.Extra)) {
      return false
    }
    return (
      suf.statContainers.length > 0 ||
      suf.has('dual_element') ||
      suf.branchItem.hasProp('self_buffs')
    )
  })
})
</script>
