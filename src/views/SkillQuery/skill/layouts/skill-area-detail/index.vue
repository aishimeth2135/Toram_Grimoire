<template>
  <cy-transition>
    <div class="m-3 flex flex-wrap items-center p-3">
      <div>
        <SkillAreaAnimation :container="container" class="max-h-64 max-w-full" />
        <div class="flex justify-center text-sm">
          <div class="flex items-center">
            <cy-icon icon="bx-bxs-circle" class="text-blue-60 mr-1" small />
            {{ t('skill-query.branch.skill-area.point: character') }}
          </div>
          <div class="ml-2.5 flex items-center">
            <cy-icon icon="bx-bxs-circle" class="text-orange-60 mr-1" small />
            {{ t('skill-query.branch.skill-area.point: target') }}
          </div>
        </div>
      </div>
      <div class="pl-4 pt-4">
        <table>
          <tbody>
            <tr v-for="key in displayAttrsKeys" :key="key">
              <td class="border-primary-20 border-r-2 pr-2 text-right text-gray-50">
                {{ displayContainer.title(key) }}
              </td>
              <td class="text-primary-60 pl-2">
                <SkillBranchPropValue :result="displayContainer.result(key)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </cy-transition>
</template>

<script lang="ts">
const ALL_DISPLAY_ATTR_KEYS = [
  'effective_area',
  'radius',
  'move_distance',
  'angle',
  'start_position_offsets',
  'end_position_offsets',
]
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillComputingContainer, SkillBranchItem } from '@/lib/Skill/SkillComputing'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputing'

import SkillAreaAnimation from './skill-area-animation.vue'

import AreaHandler from '../../branch-handlers/AreaHandler'
import SkillBranchPropValue from '../skill-branch-prop-value.vue'

defineOptions({
  name: 'SkillAreaDetail',
})

interface Props {
  computing: SkillComputingContainer
  skillBranchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { skillBranchItem: branchItem } = toRefs(props)

const displayContainer = computed(() => AreaHandler(props.computing, branchItem.value))

const container = computed(() =>
  AreaHandler(props.computing, branchItem.value, FormulaDisplayModes.Normal)
)

const { t } = useI18n()

const displayAttrsKeys = computed(() =>
  ALL_DISPLAY_ATTR_KEYS.filter(key => container.value.has(key))
)
</script>
