<template>
  <div
    class="skill-effect-history-item-wrapper px-2"
    :class="{ 'detail-active': contents.detail }"
  >
    <cy-list-item @click="toggle('contents/detail')">
      <div class="flex items-center w-full">
        <cy-icon-text
          icon="ic:round-history"
          :text-color="contents.detail ? 'light-3' : 'dark'"
        >
          {{ historyItem.date }}
        </cy-icon-text>
        <cy-icon-text
          :icon="contents.detail ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
          class="ml-auto"
        />
      </div>
      <div v-if="introductionBranchItemDatas.length > 0 && !contents.detail" class="flex items-start w-full">
        <cy-icon-text icon="ic:round-label" class="ml-2 mt-1.5" />
        <div>
          <SkillBranch :skill-branch-item="introductionBranchItemDatas[0].branchItem" sub />
        </div>
      </div>
    </cy-list-item>
    <div v-if="contents.detail" class="pt-2">
      <div v-if="introductionBranchItemDatas.length > 0" class="space-y-3 pb-4">
        <div
          v-for="({ branchItem, iid }) in introductionBranchItemDatas"
          :key="iid"
          class="px-2"
        >
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
      </div>
      <div v-if="stackBranchItemDatas.length > 0" class="space-y-3 pb-4">
        <div
          v-for="({ branchItem, iid }) in stackBranchItemDatas"
          :key="iid"
        >
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
      </div>
      <div
        v-for="{ branchItem, next } in modifiedBranchItemDatas"
        :key="branchItem.id"
        class="history-item-compare"
      >
        <div>
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
        <div class="history-item-compare-arrow-wrapper">
          <cy-icon-text icon="ic:round-keyboard-double-arrow-down" icon-color="light-4" />
        </div>
        <div v-if="next && !next.isEmpty">
          <SkillBranch :skill-branch-item="next" sub />
        </div>
        <div v-else class="history-item-compare-empty">
          <cy-icon-text icon="mdi:book-remove-outline">{{ t('skill-query.branch-removed') }}</cy-icon-text>
        </div>
      </div>
      <div
        v-for="({ branchItem, iid }) in addedBranchItemDatas"
        :key="iid"
        class="history-item-compare"
      >
        <div class="history-item-compare-empty">
          <cy-icon-text icon="mdi:book-plus-outline">{{ t('skill-query.branch-added') }}</cy-icon-text>
        </div>
        <div class="history-item-compare-arrow-wrapper">
          <cy-icon-text icon="ic:round-keyboard-double-arrow-down" icon-color="light-4" />
        </div>
        <div>
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
      </div>
      <div
        v-for="({ branchItem, iid }) in removedBranchItemDatas"
        :key="iid"
        class="history-item-compare"
      >
        <div>
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
        <div class="history-item-compare-arrow-wrapper">
          <cy-icon-text icon="ic:round-keyboard-double-arrow-down" icon-color="light-4" />
        </div>
        <div class="history-item-compare-empty">
          <cy-icon-text icon="mdi:book-remove-outline">{{ t('skill-query.branch-removed') }}</cy-icon-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillEffectItemHistory } from '@/lib/Skill/SkillComputingContainer'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import ToggleService from '@/setup/ToggleService'

import SkillBranch from '../skill/skill-branch.vue'

interface Props {
  skillEffectHistoryItem: SkillEffectItemHistory;
}

const props = defineProps<Props>()

const { skillEffectHistoryItem: historyItem } = toRefs(props)

const { t } = useI18n()

const modifiedBranchItems = computed(() => historyItem.value.modifiedBranchItems)
const modifiedBranchItemDatas = computed(() => {
  return historyItem.value.modifiedBranchItems.map(branchItem => {
    const next = historyItem.value.nexts.get(toRaw(branchItem)) ?? null
    return {
      branchItem,
      next,
    }
  })
})

const usedStackIds = computed(() => {
  const stackIds = new Set<number>()
  modifiedBranchItems.value.forEach(bch => bch.linkedStackIds.forEach(id => stackIds.add(id)))
  return [...stackIds]
})

const stackBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(bch => bch.is(SkillBranchNames.Stack) && usedStackIds.value.includes(bch.stackId as number))
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const addedBranchItemDatas = computed(() => {
  const branchIds = historyItem.value.origin.branches
    .filter(bch => bch.isEmpty && bch.id !== -1)
    .map(bch => bch.id)
  return historyItem.value.branchItems
    .filter(bch => branchIds.includes(bch.id))
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const introductionBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(bch => historyItem.value.introductionBranches.includes(toRaw(bch)))
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const removedBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(bch => historyItem.value.removedBranches.includes(bch))
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const { contents, toggle } = ToggleService({
  contents: [{ name: 'detail', default: introductionBranchItemDatas.value.length === 0 }],
})
</script>

<style lang="postcss" scoped>
.skill-effect-history-item-wrapper {
  border-top: 1px solid var(--primary-light);
  &.detail-active {
    @apply border-l-1 border-light pb-2 mb-2;
  }
}

.history-item-compare {
  @apply p-2 pl-4 border-l-2 border-light-3;
}

.history-item-compare + .history-item-compare {
  @apply mt-4;
}
.history-item-compare-arrow-wrapper {
  @apply flex justify-center w-full py-2;
}
.history-item-compare-empty {
  @apply border border-light-2 p-4 flex justify-center;
}
</style>
