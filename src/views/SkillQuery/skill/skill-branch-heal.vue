<template>
  <div>
    <SkillBranchLayoutNormal
      :container="container"
      :sub-contents="subContents"
      :name-props="nameProps"
      :extra-columns="extraSuffixBranchDatas"
    >
      <skillHealFormula :container="container" />
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { ComponentPropsType } from '@/shared/utils/type'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import skillHealFormula from './layouts/skill-heal-formula.vue'

import HealHandler from './branch-handlers/HealHandler'
import { setupCommonExtraSuffixBranches } from './setup'

interface Props {
  branchItem: SkillBranchItem;
}

const { t } = useI18n()

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => HealHandler(branchItem.value))

const nameProps = computed(() => {
  return [container.value.get('type')]
})

const subContents = computed(() => {
  const result = [] as NonNullable<ComponentPropsType<typeof SkillBranchLayoutNormal>['subContents']>
  result.push({
    key: 'frequency',
    icon: 'bi-circle-square',
  })
  if (container.value.getValue('duration') !== '0' && container.value.getValue('cycle') !== '0') {
    result.push({
      key: 'duration|cycle',
      icon: 'ic-round-timer',
      title: t('skill-query.branch.damage.duration-caption-with-cycle', {
        duration: container.value.get('duration'),
        cycle: container.value.get('cycle'),
      }),
    })
  }
  return result
})

const { extraSuffixBranchDatas } = setupCommonExtraSuffixBranches(branchItem)
</script>
