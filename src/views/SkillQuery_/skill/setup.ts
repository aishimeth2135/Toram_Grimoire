
import { ref, computed, toRaw } from 'vue';
import type { Ref } from 'vue';

import { SkillBranchItem, SkillEffectItem } from '@/lib/Skill/SkillComputingContainer';

function setupOtherEffectBranches(branchItem: Ref<SkillBranchItem>) {
  const otherEffectBranches = computed(() => {
    const branches: SkillBranchItem<SkillEffectItem>[] = [];
    const current = branchItem.value;
    current.parent.parent.effectItems.forEach(effectItem => {
      if (toRaw(effectItem) === toRaw(current.parent)) {
        return;
      }
      const bch = effectItem.branchItems.find(item => {
        if (current.id !== -1 && item.id === current.id) {
          return true;
        }
        return item.suffixBranches.some(suf => current.suffixBranches.some(_suf => suf.id === _suf.id));
      });
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
