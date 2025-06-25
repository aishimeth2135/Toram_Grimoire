<template>
  <div class="skill-effect-history-item-wrapper px-2" :class="{ 'detail-active': detailVisible }">
    <cy-list-item @click="detailVisible = !detailVisible">
      <div class="flex w-full items-center">
        <cy-icon-text
          icon="ic:round-history"
          :text-color="detailVisible ? 'primary-50' : 'primary-90'"
        >
          {{ historyItem.date }}
        </cy-icon-text>
        <cy-icon
          :icon="detailVisible ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
          class="ml-auto"
        />
      </div>
      <div
        v-if="introductionBranchItemDatas.length > 0 && !detailVisible"
        class="flex w-full items-start"
      >
        <cy-icon icon="ic:round-label" class="ml-2 mt-1.5" />
        <div>
          <SkillBranch
            :skill-branch-item="introductionBranchItemDatas[0].branchItem"
            :computing="computing"
            sub
          />
        </div>
      </div>
    </cy-list-item>
    <div v-if="detailVisible" class="pt-2">
      <div v-if="introductionBranchItemDatas.length > 0" class="space-y-3 pb-4">
        <div v-for="{ branchItem, iid } in introductionBranchItemDatas" :key="iid" class="px-2">
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
          <cy-icon-text icon="mdi:book-remove-outline">
            {{ t('skill-query.branch-removed') }}
          </cy-icon-text>
        </div>
      </div>
      <div
        v-for="{ branchItem, iid } in addedBranchItemDatas"
        :key="iid"
        class="history-item-compare"
      >
        <div class="history-item-compare-empty">
          <cy-icon-text icon="mdi:book-plus-outline">{{
            t('skill-query.branch-added')
          }}</cy-icon-text>
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
          <cy-icon-text icon="mdi:book-remove-outline">
            {{ t('skill-query.branch-removed') }}
          </cy-icon-text>
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
  border-top: 1px solid var(--app-primary-30);
  &.detail-active {
    @apply mb-2 border-l-1 border-primary-30 pb-2;
  }
}

.history-item-compare {
  @apply border-l-2 border-primary-50 p-2 pl-4;
}

.history-item-compare + .history-item-compare {
  @apply mt-4;
}
.history-item-compare-arrow-wrapper {
  @apply flex w-full justify-center py-2;
}
.history-item-compare-empty {
  @apply flex justify-center border border-primary-30 p-4;
}
</style>
