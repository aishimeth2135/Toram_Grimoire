import { Skill, SkillBranch } from '@/lib/Skill/Skill'

class PartySkillBranch {
  readonly partySkillId: number
  readonly skillBranch: SkillBranch

  constructor(id: number, skillBranch: SkillBranch) {
    this.partySkillId = id
    this.skillBranch = skillBranch
  }
}

class PartySkill {
  readonly skill: Skill
  readonly partySkillBranches: PartySkillBranch[]

  constructor(skill: Skill, branches: PartySkillBranch[]) {
    this.skill = skill
    this.partySkillBranches = branches
  }
}

class PartySkillBuild {
  private readonly selectedIds: Set<string>
}
