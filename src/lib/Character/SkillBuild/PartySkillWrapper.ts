import Grimoire from '@/shared/Grimoire'
import { toggleElement } from '@/shared/utils/array'

import { Skill, SkillBranch } from '@/lib/Skill/Skill'

import { checkSkillBranchForParty, getPartySkillBranchId } from './utils'

class PartySkillBranch {
  readonly id: number
  readonly skillBranch: SkillBranch

  private constructor(id: number, skillBranch: SkillBranch) {
    this.id = id
    this.skillBranch = skillBranch
  }

  static create(id: number, skillBranch: SkillBranch): PartySkillBranch {
    return new PartySkillBranch(id, skillBranch)
  }
}

class PartySkill {
  readonly skillId: string
  readonly skill: Skill
  readonly partySkillBranches: PartySkillBranch[]
  level: number

  private constructor(skill: Skill) {
    this.skillId = skill.skillId
    this.skill = skill
    this.partySkillBranches = []
    this.level = 10

    skill.effects.forEach(effect => {
      effect.branches.forEach(branch => {
        if (checkSkillBranchForParty(branch)) {
          this.partySkillBranches.push(
            PartySkillBranch.create(getPartySkillBranchId(branch), branch)
          )
        }
      })
    })
  }

  static create(skill: Skill): PartySkill {
    return new PartySkill(skill)
  }
}

interface SelectedPartySkillData {
  id: string
  selecteds: number[]
}

interface PartySkillBuildSaveData {
  skills: SelectedPartySkillData[]
}

export class PartySkillBuild {
  private readonly selectedIds: Map<string, number[]>
  readonly partySkills: PartySkill[]

  private constructor() {
    this.selectedIds = new Map()
    this.partySkills = []
  }

  static create(): PartySkillBuild {
    return new PartySkillBuild()
  }

  private getPartySkillSelecteds(partySkill: PartySkill): number[] {
    return this.selectedIds.get(partySkill.skillId)!
  }

  appendSkill(skill: Skill): PartySkill {
    const partySkill = PartySkill.create(skill)
    this.partySkills.push(partySkill)
    this.selectedIds.set(
      partySkill.skillId,
      partySkill.partySkillBranches.map(branch => branch.id)
    )
    return partySkill
  }

  removeSkill(partySkill: PartySkill): void {
    const idx = this.partySkills.findIndex(skill => skill.skillId === partySkill.skillId)
    if (idx > -1) {
      this.partySkills.splice(idx, 1)
      this.selectedIds.delete(partySkill.skillId)
    }
  }

  isBranchSelected(partySkill: PartySkill, branch: PartySkillBranch): boolean {
    return this.getPartySkillSelecteds(partySkill).includes(branch.id)
  }

  toggleBranchSelected(partySkill: PartySkill, branch: PartySkillBranch) {
    toggleElement(this.getPartySkillSelecteds(partySkill), branch.id)
  }

  save(): PartySkillBuildSaveData {
    const skills = Array.from(this.selectedIds.entries()).map(([skillId, selecteds]) => {
      return {
        id: skillId,
        selecteds,
      } as SelectedPartySkillData
    })
    return {
      skills,
    }
  }

  static load(data: PartySkillBuildSaveData): PartySkillBuild {
    const newBuild = PartySkillBuild.create()
    data.skills.forEach(skillData => {
      const skill = Grimoire.Skill.skillRoot.findSkillById(skillData.id)
      if (skill) {
        const partySkill = newBuild.appendSkill(skill)
        newBuild.getPartySkillSelecteds(partySkill).push(...skillData.selecteds)
      }
    })
    return newBuild
  }
}
