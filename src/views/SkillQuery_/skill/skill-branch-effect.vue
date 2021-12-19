<template>
  <div>
    <SkillBranchLayoutNormal
      :container="container"
      :name-props="nameProps"
      :sub-contents="subContents"
      :has-area="hasArea"
    >
      <div class="mb-1">
        <div
          v-if="container.get('caption')"
          class="py-0.5 pl-2 pr-1 inline-block"
          v-html="container.get('caption')"
        >
        </div>
        <SkillBranchStats
          v-else-if="container.statContainers.length !== 0"
          :stat-containers="container.statContainers"
        />
      </div>
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
import SkillBranchExtraColumn from './layouts/skill-branch-extra-column.vue';
import SkillBranchStats from './layouts/skill-branch-stats.vue';

import EffectHandler from './branch-handlers/EffectHandler';
import ExtraHandler from './branch-handlers/ExtraHandler';

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>();
const { branchItem } = toRefs(props);

const container = computed(() => EffectHandler(branchItem.value));

const nameProps = computed(() => {
  const res = [];
  if (container.value.get('type')) {
    res.push(container.value.get('type'));
  }
  return res;
});

const subContents = computed(() => {
  return [{
    key: 'condition',
    icon: 'eva-checkmark-circle-2-outline',
  }, {
    key: 'duration',
    icon: 'zmdi-time-interval',
  }, {
    key: 'end_condition',
    icon: 'zmdi-time-interval',
  }, {
    key: 'is_place',
    icon: 'emojione-monotone:heavy-large-circle',
  }] as NonNullable<ComponentPropsType<typeof SkillBranchLayoutNormal>['subContents']>;
});

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
      if (dataContainer.get('target')) {
        baseData.titleProps = [dataContainer.get('target')];
      }
      if (dataContainer.get('caption')) {
        baseData.text = dataContainer.get('caption');
      } else {
        baseData.statContainers = dataContainer.statContainers;
      }
      return baseData;
    });
});

const hasArea = computed(() => {
  return container.value.getOrigin('type') === 'aura' || container.value.getOrigin('type') === 'circle';
});
</script>
