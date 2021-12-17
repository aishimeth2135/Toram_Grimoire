
import { ref, computed, toRaw } from 'vue';
import type { Ref } from 'vue';

import { SkillBranchItem, SkillEffectItem } from '@/lib/Skill/SkillComputingContainer';

function setupOtherEffectBranches(branchItem: Ref<SkillBranchItem>) {
  const otherEffectBranches = computed(() => {
    const branches: SkillBranchItem<SkillEffectItem>[] = [];
    if (branchItem.value.id === -1) {
      return branches;
    }
    branchItem.value.parent.parent.effectItems.forEach(effectItem => {
      if (toRaw(effectItem) === toRaw(branchItem.value.parent)) {
        return;
      }
      const bch = effectItem.branchItems.find(item => item.id === branchItem.value.id);
      if (bch) {
        branches.push(bch);
      }
    });
    return branches;
  });

  const currentOtherEffectBranchesIdx = ref(0);

  const currentOtherEffectBranch = computed(() => {
    return otherEffectBranches.value[currentOtherEffectBranchesIdx.value] || null;
  });

  const setCurrentOtherEffectBranch = (idx: number) => {
    currentOtherEffectBranchesIdx.value = idx;
  };

  return {
    otherEffectBranches,
    currentOtherEffectBranch,
    setCurrentOtherEffectBranch,
  };
}

export {
  setupOtherEffectBranches,
};
