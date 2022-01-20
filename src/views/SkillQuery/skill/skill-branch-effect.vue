<template>
  <div>
    <SkillBranchLayoutNormal
      :container="container"
      :name-props="nameProps"
      :sub-contents="subContents"
      :has-area="hasArea"
      :extra-columns="extraSuffixBranchDatas"
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
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { ComponentPropsType } from '@/shared/utils/type'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import SkillBranchStats from './layouts/skill-branch-stats.vue'

import EffectHandler from './branch-handlers/EffectHandler'
import { setupCommonExtraSuffixBranches } from './setup'

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => EffectHandler(branchItem.value))

const nameProps = computed(() => {
  const res = []
  if (container.value.get('type')) {
    res.push(container.value.get('type'))
  }
  return res
})

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
  }] as NonNullable<ComponentPropsType<typeof SkillBranchLayoutNormal>['subContents']>
})

const { extraSuffixBranchDatas } = setupCommonExtraSuffixBranches(branchItem)

const hasArea = computed(() => {
  return container.value.getOrigin('type') === 'aura' || container.value.getOrigin('type') === 'circle'
})
</script>
