<template>
  <div class="pl-3">
    <table class="align-middle">
      <tr v-for="{ key, icon, title, value } in attrDatas" :key="key">
        <td class="pr-2 border-r border-light">
          <div class="flex">
            <cy-icon-text :icon="icon">{{ title }}</cy-icon-text>
          </div>
        </td>
        <td class="pl-2 text-light-4" v-html="value"></td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
const ATTR_DATAS: {
  key: string;
  icon: string | Record<string, string>;
}[] = [{
  key: 'mp_cost',
  icon: 'mdi-flask-round-bottom',
}, {
  key: 'range',
  icon: 'mdi-target-variant',
}, {
  key: 'skill_type',
  icon: 'eva-question-mark-circle-outline',
}, {
  key: 'in_combo',
  icon: {
    '1': 'mdi-selection-ellipse-arrow-inside',
    '0': 'jam-stop-sign',
    'not_lead':'mdi-numeric-1-circle-outline',
  },
}, {
  key: 'action_time',
  icon: 'bx-bx-timer',
}, {
  key: 'casting_time',
  icon: 'zmdi-time-restore',
}]
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import BasicHandler from './branch-handlers/BasicHandler'

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => BasicHandler(branchItem.value))

const { t } = useI18n()

const attrDatas = computed(() => {
  return ATTR_DATAS
    .filter(data => container.value.has(data.key))
    .map(({ key, icon }) => {
      const iconRes = typeof icon === 'object' ? icon[container.value.branchItem.prop(key)] : icon
      const value = container.value.get(key)
      return {
        key,
        icon: iconRes,
        title: t(`skill-query.branch.basic.${key}: title`),
        value,
      }
    })
})
</script>
