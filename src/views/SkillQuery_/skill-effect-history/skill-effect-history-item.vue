<template>
  <div class="skill-effect-history-item-wrapper">
    <cy-list-item @click="toggle('contents/detail')">
      <div class="flex items-center w-full">
        <cy-icon-text icon="ic:round-history">{{ historyItem.date }}</cy-icon-text>
        <cy-icon-text
          :icon="contents.detail ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
          class="ml-auto"
        />
      </div>
    </cy-list-item>
    <div v-if="contents.detail">
      <div
        v-for="({ branchItem, iid }) in stackBranchItemDatas"
        :key="iid"
      >
        <SkillBranch :skill-branch-item="branchItem" sub />
      </div>
      <div
        v-for="branchItem in modifiedBranchItems"
        :key="branchItem.id"
        class="p-4 border-l-2 border-light-3"
      >
        <div>
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
        <div class="flex justify-center w-full py-2">
          <cy-icon-text icon="ic:round-keyboard-double-arrow-down" icon-color="light-4" />
        </div>
        <div v-if="historyItem.nexts.get(branchItem) && !(historyItem.nexts.get(branchItem)!.isEmpty)">
          <SkillBranch :skill-branch-item="historyItem.nexts.get(branchItem)!" sub />
        </div>
        <div v-else class="border border-light-2 p-4">
          {{ t('skill-query.branch-removed') }}
        </div>
      </div>
      <div
        v-for="({ branchItem, iid }) in addedBranchItemDatas"
        :key="iid"
      >
        <div class="border border-light-2 p-4">
          {{ t('skill-query.branch-added') }}
        </div>
        <div class="flex justify-center w-full py-2">
          <cy-icon-text icon="ic:round-keyboard-double-arrow-down" icon-color="light-4" />
        </div>
        <div>
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
      </div>
      <div
        v-for="({ branchItem, iid }) in removedBranchItemDatas"
        :key="iid"
      >
        <div>
          <SkillBranch :skill-branch-item="branchItem" sub />
        </div>
        <div class="flex justify-center w-full py-2">
          <cy-icon-text icon="ic:round-keyboard-double-arrow-down" icon-color="light-4" />
        </div>
        <div class="border border-light-2 p-4">
          {{ t('skill-query.branch-removed') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import { SkillEffectItemHistory } from '@/lib/Skill/SkillComputingContainer';
import { SkillBranchNames } from '@/lib/Skill/Skill/enums';

import ToggleService from '@/setup/ToggleService';

import SkillBranch from '../skill/skill-branch.vue';

interface Props {
  skillEffectHistoryItem: SkillEffectItemHistory;
  detailVisibleDefault?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  detailVisibleDefault: false,
});

const { skillEffectHistoryItem: historyItem, detailVisibleDefault } = toRefs(props);

const { t } = useI18n();

const { contents, toggle } = ToggleService({ contents: [{ name: 'detail', default: detailVisibleDefault.value }] });

const modifiedBranchItems = computed(() => historyItem.value.modifiedBranchItems);
const usedStackIds = computed(() => {
  const stackIds = new Set<number>();
  modifiedBranchItems.value.forEach(bch => {
    bch.attr('stack_id').split(/\s*,\s*/)
      .map(id => parseInt(id, 10))
      .forEach(id => stackIds.add(id));
  });
  return [...stackIds];
});

const stackBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(bch => bch.name === SkillBranchNames.Stack && usedStackIds.value.includes(bch.stackId as number))
    .map((bch, iid) => ({ branchItem: bch, iid }));
});

const addedBranchItemDatas = computed(() => {
  const branchIds = historyItem.value.origin.branches
    .filter(bch => bch.isEmpty && bch.id !== -1)
    .map(bch => bch.id);
  return historyItem.value.branchItems
    .filter(bch => branchIds.includes(bch.id))
    .map((bch, iid) => ({ branchItem: bch, iid }));
});

const removedBranchItemDatas = computed(() => {
  return historyItem.value.branchItems
    .filter(bch => historyItem.value.removedBranches.includes(bch))
    .map((bch, iid) => ({ branchItem: bch, iid }));
});
</script>

<style lang="postcss" scoped>
.skill-effect-history-item-wrapper + .skill-effect-history-item-wrapper {
  border-top: 1px solid var(--primary-light);
}
</style>
