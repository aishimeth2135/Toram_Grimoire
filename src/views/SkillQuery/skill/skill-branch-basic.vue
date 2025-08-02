<template>
  <div class="pl-3">
    <table class="align-middle">
      <tr v-for="{ key, icon, title, result } in attrDatas" :key="key">
        <td class="border-r border-primary-30 pr-2">
          <div class="flex">
            <cy-icon-text :icon="icon">{{ title }}</cy-icon-text>
          </div>
        </td>
        <td class="pl-2 text-primary-60">
          <SkillBranchPropValue
            :result="result"
            :parse-glossary-tag="
              key === 'range' &&
              !(result instanceof SkillBranchResult && result.type === ResultContainerTypes.Number)
            "
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { computed, toRefs } from 'vue'

import {
  SkillBranchItem,
  SkillBranchResult,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputing'
import { ResultContainerTypes } from '@/lib/common/ResultContainer'

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import BasicHandler from './branch-handlers/BasicHandler'

const ATTR_DATAS: {
  key: string
  icon: string | Record<string, string>
}[] = [
  {
    key: 'mp_cost',
    icon: 'mdi-flask-round-bottom',
  },
  {
    key: 'range',
    icon: 'mdi-target-variant',
  },
  {
    key: 'skill_type',
    icon: 'eva-question-mark-circle-outline',
  },
  {
    key: 'in_combo',
    icon: {
      '1': 'mdi-selection-ellipse-arrow-inside',
      '0': 'jam-stop-sign',
      'not_lead': 'mdi-numeric-1-circle-outline',
    },
  },
  {
    key: 'action_time',
    icon: 'bx-bx-timer',
  },
  {
    key: 'casting_time',
    icon: 'zmdi-time-restore',
  },
]
</script>

<script lang="ts" setup>
interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => BasicHandler(props.computing, branchItem.value))

const attrDatas = computed(() => {
  return ATTR_DATAS.filter(data => container.value.has(data.key)).map(({ key, icon }) => {
    const iconRes = typeof icon === 'object' ? icon[container.value.branchItem.prop(key)] : icon
    return {
      key,
      icon: iconRes,
      title: container.value.title(key),
      result: container.value.result(key),
    }
  })
})
</script>
