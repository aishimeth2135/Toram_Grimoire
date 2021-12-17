<template>
  <cy-transition type="fade">
    <div class="m-3 flex flex-wrap items-start p-3">
      <div class="inline-block">
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
      <div class="inline-block pt-4 pl-4">
        <table class="attrs-table">
          <tbody>
            <tr>
              <td>{{ displayContainer.get('effective_area: title') }}</td>
              <td v-html="displayContainer.get('effective_area')" />
            </tr>
            <tr v-if="displayContainer.getOrigin('effective_area') !== 'sector'">
              <td>{{ displayContainer.get('radius: title') }}</td>
              <td v-html="displayContainer.get('radius')" />
            </tr>
            <tr v-if="displayContainer.has('move_distance')">
              <td>{{ displayContainer.get('move_distance: title') }}</td>
              <td v-html="displayContainer.get('move_distance')" />
            </tr>
            <tr v-if="displayContainer.has('angle')">
              <td>{{ displayContainer.get('angle: title') }}</td>
              <td v-html="displayContainer.get('angle')" />
            </tr>
            <tr v-if="displayContainer.has('start_position_offsets')">
              <td>{{ displayContainer.get('start_position_offsets: title') }}</td>
              <td v-html="displayContainer.get('start_position_offsets')" />
            </tr>
            <tr v-if="displayContainer.has('end_position_offsets')">
              <td>{{ displayContainer.get('end_position_offsets: title') }}</td>
              <td v-html="displayContainer.get('end_position_offsets')" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </cy-transition>
</template>

<script lang="ts" setup>
import { toRefs, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer/enums';

import SkillAreaAnimation from './skill-area-animation.vue';

import AreaHandler from '../../branch-handlers/AreaHandler';

interface Props {
  skillBranchItem: SkillBranchItem;
}

const props = defineProps<Props>();
const { skillBranchItem: branchItem } = toRefs(props);

const displayContainer = computed(() => AreaHandler(branchItem.value));

const container = computed(() => AreaHandler(branchItem.value, FormulaDisplayModes.Normal));

const { t } = useI18n();
</script>

<style lang="postcss" scoped>
.attrs-table {
  & tr {
    & > td:nth-child(1) {
      @apply text-right pr-2 border-r border-light;
    }
    & > td:nth-child(2) {
      @apply pl-2 text-light-4;
    }
  }
}
</style>
