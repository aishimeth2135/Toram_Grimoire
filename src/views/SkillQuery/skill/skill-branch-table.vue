<template>
  <div class="w-full overflow-x-auto px-2">
    <table class="border-0" :style="{ 'min-width': `${10 * datas.labels.length}rem` }">
      <thead>
        <tr>
          <th
            v-for="(label, idx) in datas.labels"
            :key="idx"
            class="border-b-1 border-primary-30 px-3 py-1.5 text-left text-sm font-normal text-primary-30"
            :class="{
              'pl-5': idx === 0,
              'pr-5': idx === datas.labels.length - 1,
            }"
          >
            {{ label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="container in datas.rows" :key="container.instanceId">
          <td
            v-for="num in datas.labels.length"
            :key="num"
            class="border-b border-primary-30 px-3 py-1.5"
            :class="{
              'pl-5': num === 1,
              'pr-5': num === datas.labels.length,
            }"
          >
            <SkillBranchPropValue :result="container.result(`cell.${num - 1}`)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import TableHandler from './branch-handlers/TableHandler'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const datas = computed(() => TableHandler(props.computing, branchItem.value))
</script>
