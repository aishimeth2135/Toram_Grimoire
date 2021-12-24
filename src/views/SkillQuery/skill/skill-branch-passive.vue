<template>
  <div>
    <SkillBranchLayoutNormal :container="container">
      <div
        v-if="container.has('caption')"
        class="py-0.5 pl-2 pr-1 inline-block"
        v-html="container.get('caption')"
      >
      </div>
      <SkillBranchStats
        v-else-if="container.statContainers.length !== 0"
        :stat-containers="container.statContainers"
      />
      <template #extra>
        <skillBranchExtraColumn
          v-for="suffixData in extraSuffixBranchDatas"
          :key="suffixData.iid"
          :icon="suffixData.icon"
          :title="suffixData.title"
          :text="suffixData.text"
          :stat-containers="suffixData.statContainers"
        />
      </template>
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';

import { ComponentPropsType } from '@/shared/utils/type';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import { SkillBranchNames } from '@/lib/Skill/Skill/enums';

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue';
import SkillBranchStats from './layouts/skill-branch-stats.vue';
import SkillBranchExtraColumn from './layouts/skill-branch-extra-column.vue';

import PassiveHandler from './branch-handlers/PassiveHandler';
import ExtraHandler from './branch-handlers/ExtraHandler';

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>();
const { branchItem } = toRefs(props);

const container = computed(() => PassiveHandler(branchItem.value));

const extraSuffixBranchDatas = computed(() => {
  return branchItem.value.suffixBranches
    .filter(suffix => suffix.name === SkillBranchNames.Extra && (suffix.attr('caption') || suffix.stats.length > 0))
    .map((suffix, idx) => {
      const dataContainer = ExtraHandler(suffix);
      const baseData: ComponentPropsType<typeof SkillBranchExtraColumn> & { iid: number } = {
        iid: idx,
        icon: 'eva-checkmark-circle-2-outline',
        title: dataContainer.get('condition'),
      };
      if (dataContainer.get('caption')) {
        baseData.text = dataContainer.get('caption');
      } else {
        baseData.statContainers = dataContainer.statContainers;
      }
      return baseData;
    });
});
</script>
