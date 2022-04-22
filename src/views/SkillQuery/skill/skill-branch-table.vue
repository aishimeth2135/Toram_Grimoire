<template>
  <div class="px-2 w-full overflow-x-auto">
    <table class="border-0" :style="{ 'min-width': `${10 * datas.labels.length}rem` }">
      <thead>
        <tr>
          <th
            v-for="(label, idx) in datas.labels"
            :key="idx"
            class="text-sm text-light-2 text-left font-normal border-b-1 border-light-2 px-3 py-1.5"
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
        <tr
          v-for="container in datas.rows"
          :key="container.instanceId"
        >
          <td
            v-for="num in datas.labels.length"
            :key="num"
            class="border-b border-light px-3 py-1.5"
            :class="{
              'pl-5': num === 1,
              'pr-5': num === datas.labels.length,
            }"
          >
            <span v-html="container.get(`cell.${num - 1}`)"></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import TableHandler from './branch-handlers/TableHandler'

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const datas = computed(() => TableHandler(branchItem.value))
</script>

