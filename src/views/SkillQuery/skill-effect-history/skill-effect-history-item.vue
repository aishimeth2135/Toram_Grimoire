<template>
  <div class="skill-effect-history-item-wrapper" :class="{ 'detail-active': detailVisible }">
    <cy-list-item @click="detailVisible = !detailVisible">
      <div class="flex w-full items-center py-1">
        <div
          class="gap-icon inline-flex items-center"
          :class="detailVisible ? 'text-primary-50' : 'text-primary-90'"
        >
          <cy-icon icon="ic:round-history" class="text-primary-30" />
          {{ historyItem.date }}
        </div>
        <cy-icon
          :icon="detailVisible ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
          class="ml-auto"
        />
      </div>
    </cy-list-item>
    <div
      v-if="introductionBranchItemDatas.length > 0 && !detailVisible"
      class="pl-5.5 flex w-full items-start pb-2"
    >
      <SkillBranch
        :skill-branch-item="introductionBranchItemDatas[0].branchItem"
        :computing="computing"
        sub
      />
    </div>
    <div v-if="detailVisible">
      <div v-if="introductionBranchItemDatas.length > 0" class="space-y-3 pb-4">
        <div
          v-for="{ branchItem, iid } in introductionBranchItemDatas"
          :key="iid"
          class="pl-5.5 pr-2"
        >
          <SkillBranch :skill-branch-item="branchItem" :computing="computing" sub />
        </div>
      </div>
      <div v-if="stackBranchItemDatas.length > 0" class="space-y-3 pb-4">
        <div v-for="{ branchItem, iid } in stackBranchItemDatas" :key="iid">
          <SkillBranch :skill-branch-item="branchItem" :computing="computing" sub />
        </div>
      </div>
      <div
        v-for="{ branchItem, next } in displayedBranchItemDatas"
        :key="branchItem.id"
        class="history-item-compare"
      >
        <div>
          <SkillBranch :skill-branch-item="branchItem" :computing="computing" sub />
        </div>
        <div class="history-item-compare-arrow-wrapper">
          <cy-icon icon="ic:round-keyboard-double-arrow-down" class="text-primary-60" />
        </div>
        <div v-if="next && !next.isEmpty">
          <SkillBranch :skill-branch-item="next" :computing="computing" sub />
        </div>
        <div v-else class="history-item-compare-empty">
          <div class="gap-icon text-primary-90 inline-flex items-center">
            <cy-icon icon="mdi:book-remove-outline" class="text-primary-30" />
            {{ t('skill-query.branch-removed') }}
          </div>
        </div>
      </div>
      <div
        v-for="{ branchItem, iid } in addedBranchItemDatas"
        :key="iid"
        class="history-item-compare"
      >
        <div class="history-item-compare-empty">
          <div class="gap-icon text-primary-90 inline-flex items-center">
            <cy-icon icon="mdi:book-plus-outline" class="text-primary-30" />
            {{ t('skill-query.branch-added') }}
          </div>
        </div>
        <div class="history-item-compare-arrow-wrapper">
          <cy-icon icon="ic:round-keyboard-double-arrow-down" class="text-primary-60" />
        </div>
        <div>
          <SkillBranch :skill-branch-item="branchItem" :computing="computing" sub />
        </div>
      </div>
      <div
        v-for="{ branchItem, iid } in removedBranchItemDatas"
        :key="iid"
        class="history-item-compare"
      >
        <div>
          <SkillBranch :skill-branch-item="branchItem" :computing="computing" sub />
        </div>
        <div class="history-item-compare-arrow-wrapper">
          <cy-icon icon="ic:round-keyboard-double-arrow-down" class="text-primary-60" />
        </div>
        <div class="history-item-compare-empty">
          <div class="gap-icon text-primary-90 inline-flex items-center">
            <cy-icon icon="mdi:book-remove-outline" class="text-primary-30" />
            {{ t('skill-query.branch-removed') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { instanceEquals } from '@/shared/services/InstanceId'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import { SkillComputingContainer, SkillEffectItemHistory } from '@/lib/Skill/SkillComputing'

import SkillBranch from '../skill/skill-branch.vue'

interface Props {
  computing: SkillComputingContainer
  skillEffectHistoryItem: SkillEffectItemHistory
}

const props = defineProps<Props>()

const { skillEffectHistoryItem: historyItem } = toRefs(props)

const { t } = useI18n()

const displayedBranchItems = computed(() =>
  historyItem.value.modifiedBranchItems.filter(branch => !branch.propBoolean('invisible'))
)
const displayedBranchItemDatas = computed(() => {
  return displayedBranchItems.value.map(branchItem => {
    const next = historyItem.value.nexts.get(branchItem.instanceId) ?? null
    return {
      branchItem,
      next,
    }
  })
})

const usedStackIds = computed(() => {
  const stackIds = new Set<number>()
  displayedBranchItems.value.forEach(bch => bch.linkedStackIds.forEach(id => stackIds.add(id)))
  return [...stackIds]
})

const stackBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(
      bch => bch.is(SkillBranchNames.Stack) && usedStackIds.value.includes(bch.stackId as number)
    )
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const addedBranchItemDatas = computed(() => {
  const branchIds = historyItem.value.origin.branches
    .filter(bch => bch.isEmpty && bch.hasId())
    .map(bch => bch.id)
  return historyItem.value.branchItems
    .filter(bch => branchIds.includes(bch.id))
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const introductionBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(bch => historyItem.value.introductionBranches.some(_bch => instanceEquals(_bch, bch)))
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const removedBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(bch => historyItem.value.removedBranches.includes(bch))
    .map((bch, iid) => ({ branchItem: bch, iid }))
})

const detailVisible = ref(introductionBranchItemDatas.value.length === 0)
</script>

<style scoped>
@reference "@/tailwind.css";

.skill-effect-history-item-wrapper {
  @apply border-1 border-primary-10;

  &.detail-active {
    @apply border-primary-30;
  }
}

.history-item-compare {
  @apply border-primary-50 border-l-4 p-2 pl-4;
}

.history-item-compare + .history-item-compare {
  @apply mt-4;
}
.history-item-compare-arrow-wrapper {
  @apply flex w-full justify-center py-2;
}
.history-item-compare-empty {
  @apply border-primary-30 flex justify-center border p-4;
}
</style>
