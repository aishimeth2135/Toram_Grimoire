<template>
  <div>
    <SkillBranchLayoutNormal
      :computing="computing"
      :container="container"
      :sub-contents="subContents"
      :extra-columns="extraSuffixBranchDatas"
      main-icon="icon-park-outline:cross-society"
      :main-title="container.get('type')"
      :has-area="hasArea"
    >
      <skillHealFormula :container="container" />
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import skillHealFormula from './layouts/skill-heal-formula.vue'

import HealHandler from './branch-handlers/HealHandler'
import { type NormalLayoutSubContent } from './layouts/setup'
import { setupCommonExtraSuffixBranches } from './setup'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const { t } = useI18n()

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => HealHandler(props.computing, branchItem.value))

const subContents = computed(() => {
  const result: NormalLayoutSubContent[] = []
  result.push({
    key: 'frequency',
    icon: 'bi-circle-square',
  })
  if (container.value.getValue('duration') !== '0' && container.value.getValue('cycle') !== '0') {
    result.push({
      key: 'duration|cycle',
      icon: 'ic-round-timer',
      title: t('skill-query.branch.heal.duration-caption-with-cycle', {
        duration: container.value.get('duration'),
        cycle: container.value.get('cycle'),
      }),
    })
  }
  return result
})

const { extraSuffixBranchDatas } = setupCommonExtraSuffixBranches(props.computing, branchItem)

const hasArea = computed(() => container.value.getOrigin('target') === 'party')
</script>
