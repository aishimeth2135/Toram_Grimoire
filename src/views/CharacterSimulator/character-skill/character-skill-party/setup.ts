import Grimoire from '@/shared/Grimoire'
import { defineViewState } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'

import { Skill, SkillBranch, SkillBranchNames } from '@/lib/Skill/Skill'

interface PartySkillData {
  skill: Skill
  partyBranchs: SkillBranch[]
}

export const usePartySkillsState = defineViewState(ViewNames.CharacterSimulator, () => {
  const allPartySkillDatas: PartySkillData[] = []

  Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc => {
    stc.skillTrees.forEach(st => [
      st.skills.forEach(skill => {
        const partyBranchs: SkillBranch[] = []
        skill.effects.forEach(effect => {
          effect.branches.forEach(branch => {
            if (branch.name !== SkillBranchNames.Effect) {
              return
            }
            if (branch.stats.length === 0) {
              return
            }
            partyBranchs.push(branch)
          })
        })
        if (partyBranchs.length > 0) {
          allPartySkillDatas.push({
            skill,
            partyBranchs,
          } as PartySkillData)
        }
      }),
    ])
  })

  return {
    allPartySkillDatas,
  }
})
