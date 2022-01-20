<template>
  <cy-transition type="fade">
    <div class="m-3 p-3 flex items-center flex-wrap">
      <div>
        <SkillAreaAnimation :container="container"/>
        <div class="text-center">
          <cy-icon-text
            icon="bx-bxs-circle"
            class="mr-2"
            icon-color="water-blue"
            size="small"
          >
            {{ t('skill-query.branch.skill-area.point: character') }}
          </cy-icon-text>
          <cy-icon-text
            icon="bx-bxs-circle"
            icon-color="red"
            size="small"
          >
            {{ t('skill-query.branch.skill-area.point: target') }}
          </cy-icon-text>
        </div>
      </div>
      <div class="pt-4 pl-4">
        <table>
          <tbody>
            <tr v-for="key in displayAttrsKeys" :key="key">
              <td class="text-right pr-2 border-r border-light">{{ displayContainer.get(`${key}: title`) }}</td>
              <td class="pl-2 text-light-4" v-html="displayContainer.get(key)" />
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
import { toRefs, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer/enums'

import SkillAreaAnimation from './skill-area-animation.vue'

import AreaHandler from '../../branch-handlers/AreaHandler'

interface Props {
  skillBranchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { skillBranchItem: branchItem } = toRefs(props)

const displayContainer = computed(() => AreaHandler(branchItem.value))

const container = computed(() => AreaHandler(branchItem.value, FormulaDisplayModes.Normal))

const { t } = useI18n()

const displayAttrsKeys = computed(() => ALL_DISPLAY_ATTR_KEYS.filter(key => container.value.has(key)))
</script>

