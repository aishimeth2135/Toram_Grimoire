
import { ref, computed, toRaw } from 'vue'
import type { Ref } from 'vue'


import { SkillBranchItem, SkillEffectItem } from '@/lib/Skill/SkillComputingContainer'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

import ExtraHandler from './branch-handlers/ExtraHandler'

export function setupOtherEffectBranches(branchItem: Ref<SkillBranchItem>) {
  const otherEffectBranches = computed(() => {
    const branches: SkillBranchItem<SkillEffectItem>[] = []
    const current = branchItem.value
    current.parent.parent.effectItems.forEach(effectItem => {
      if (toRaw(effectItem) === toRaw(current.parent)) {
        return
      }
      const bch = effectItem.branchItems.find(item => {
        if (current.id !== -1 && item.id === current.id) {
          return true
        }
        return item.suffixBranches.some(suf => current.suffixBranches.some(_suf => suf.id === _suf.id))
      })
      if (bch) {
        branches.push(bch)
      }
    })
    return branches
  })

  const currentOtherEffectBranchesIdx = ref(0)

  const currentOtherEffectBranch = computed(() => {
    return otherEffectBranches.value[currentOtherEffectBranchesIdx.value] || null
  })

  const setCurrentOtherEffectBranch = (idx: number) => {
    currentOtherEffectBranchesIdx.value = idx
  }

  return {
    otherEffectBranches,
    currentOtherEffectBranch,
    setCurrentOtherEffectBranch,
  }
}

export interface ExtraSuffixBranchData {
  id: string;
  icon: string;
  title: string;
  titleProps?: string[];
  text?: string;
  statContainers?: ResultContainerStat[];
}

export function setupCommonExtraSuffixBranches(branchItem: Ref<SkillBranchItem>) {
  const extraSuffixBranchDatas = computed(() => {
    return branchItem.value.suffixBranches
      .filter(suffix => suffix.name === SkillBranchNames.Extra && (suffix.attr('caption') || suffix.stats.length > 0))
      .map((suffix, idx) => {
        const dataContainer = ExtraHandler(suffix)
        const baseData: ExtraSuffixBranchData = {
          id: idx.toString(),
          icon: 'eva-checkmark-circle-2-outline',
          title: dataContainer.get('condition'),
        }
        if (dataContainer.get('target')) {
          baseData.titleProps = [dataContainer.get('target')]
        }
        if (dataContainer.get('caption')) {
          baseData.text = dataContainer.get('caption')
        } else {
          baseData.statContainers = dataContainer.statContainers
        }
        return baseData
      })
  })
  return { extraSuffixBranchDatas }
}
