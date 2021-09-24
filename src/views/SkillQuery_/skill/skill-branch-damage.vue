<template>
  <div>
    {{ displayData['name'] }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import type { Ref } from 'vue';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import { computedBranchHelper, handleBranchValueAttrs } from '@/lib/Skill/SkillComputingContainer/compute';
import type { HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs } from './utils';

interface Prop {
  skillBranchItem: SkillBranchItem;
}

const props = defineProps<Prop>();
const { skillBranchItem } = toRefs(props) as { skillBranchItem: Ref<SkillBranchItem> };

const displayData = computed(() => {
  const branchItem = skillBranchItem.value;
  const attrs = cloneBranchAttrs(branchItem);
  const valueAttrsMap = {
    'multiplier': null,
    'constant': null,
    'extra_constant': null,
    'frequency': null,
    'ailment_chance': null,
    'duration': null,
    'cycle': null,
    'radius': null,
    'angel': null,
    'start_position_offsets': null,
    'end_position_offsets': null,
    'move_distance': null,
  } as HandleBranchValueAttrsMap;
  if (branchItem.attrs['target_offset'] !== 'auto') {
    valueAttrsMap['target_offset'] = null;
  }
  const helper = computedBranchHelper(skillBranchItem.value, [
    ...Object.keys(valueAttrsMap),
    ...branchItem.stats.map(stat => stat.value),
  ]);
  const valueDatas = handleBranchValueAttrs(helper, attrs, valueAttrsMap);

  return {
    ...valueDatas,
  };
});
</script>
