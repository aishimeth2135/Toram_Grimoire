import { Ref, computed, ref, toRaw } from 'vue'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillBranchResultBase,
  SkillBranchStatResult,
  SkillComputingContainer,
  SkillEffectItem,
} from '@/lib/Skill/SkillComputingContainer'

import ExtraHandler from './branch-handlers/ExtraHandler'

export function setupOtherEffectBranches(branchItem: Ref<SkillBranchItem>) {
  const otherEffectBranches = computed(() => {
    const current = branchItem.value
    if (current.id === -1) {
      return []
    }
    const branches: SkillBranchItem<SkillEffectItem>[] = []
    current.parent.parent.effectItems.forEach(effectItem => {
      if (toRaw(effectItem) === toRaw(current.parent)) {
        return
      }
      const bch = effectItem.branchItems.find(item => {
        if (item.id === current.id) {
          return true
        }
        return item.suffixBranches
          .filter(suf => suf.id !== -1)
          .some(suf => current.suffixBranches.some(_suf => suf.id === _suf.id))
      })
      if (bch) {
        branches.push(bch)
      }
    })
    return branches
  })

  const currentOtherEffectBranchesIdx = ref(0)

  const currentOtherEffectBranch = computed(() => {
    return (
      otherEffectBranches.value[currentOtherEffectBranchesIdx.value] || null
    )
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
  id: string
  icon: string
  title: string
  titleProps?: string[]
  result: SkillBranchResultBase | null
  statContainers?: SkillBranchStatResult[]
  otherResults?: Map<string, SkillBranchResultBase>
}

export function setupCommonExtraSuffixBranches(
  computing: SkillComputingContainer,
  branchItem: Ref<SkillBranchItem>
) {
  const extraSuffixBranchDatas = computed(() => {
    return branchItem.value.suffixBranches
      .filter(
        suffix =>
          suffix.is(SkillBranchNames.Extra) &&
          (suffix.prop('caption') || suffix.stats.length > 0)
      )
      .map((suffix, idx) => {
        const dataContainer = ExtraHandler(computing, suffix)
        const baseData: ExtraSuffixBranchData = {
          id: idx.toString(),
          icon: 'ic:round-done',
          title: dataContainer.get('condition'),
          result: null,
        }
        if (dataContainer.get('target')) {
          baseData.titleProps = [dataContainer.get('target')]
        }
        if (dataContainer.get('caption')) {
          baseData.result = dataContainer.result('caption')
        } else {
          baseData.statContainers = dataContainer.statContainers
        }
        return baseData
      })
  })
  return { extraSuffixBranchDatas }
}
