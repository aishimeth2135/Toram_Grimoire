<template>
  <cy-transition>
    <div class="m-3 flex flex-wrap items-center p-3">
      <div>
        <SkillAreaAnimation
          :container="container"
          class="max-h-64 max-w-full"
        />
        <div class="text-center">
          <cy-icon-text
            icon="bx-bxs-circle"
            class="mr-2"
            icon-color="blue-60"
            small
          >
            {{ t('skill-query.branch.skill-area.point: character') }}
          </cy-icon-text>
          <cy-icon-text icon="bx-bxs-circle" icon-color="orange-60" small>
            {{ t('skill-query.branch.skill-area.point: target') }}
          </cy-icon-text>
        </div>
      </div>
      <div class="pl-4 pt-4">
        <table>
          <tbody>
            <tr v-for="key in displayAttrsKeys" :key="key">
              <td
                class="border-r-1 border-primary-20 pr-2 text-right text-stone-50"
              >
                {{ displayContainer.title(key) }}
              </td>
              <td class="pl-2 text-primary-60">
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

export default {
  name: 'SkillAreaDetail',
}
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  SkillComputingContainer,
  SkillBranchItem,
} from '@/lib/Skill/SkillComputing'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputing'

import SkillAreaAnimation from './skill-area-animation.vue'

import AreaHandler from '../../branch-handlers/AreaHandler'
import SkillBranchPropValue from '../skill-branch-prop-value.vue'

interface Props {
  computing: SkillComputingContainer
  skillBranchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { skillBranchItem: branchItem } = toRefs(props)

const displayContainer = computed(() =>
  AreaHandler(props.computing, branchItem.value)
)

const container = computed(() =>
  AreaHandler(props.computing, branchItem.value, FormulaDisplayModes.Normal)
)

const { t } = useI18n()

const displayAttrsKeys = computed(() =>
  ALL_DISPLAY_ATTR_KEYS.filter(key => container.value.has(key))
)
</script>
