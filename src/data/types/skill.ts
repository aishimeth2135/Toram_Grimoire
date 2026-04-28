export interface SkillBranchAttr {
  name: string
  value: string
  extra: string
}

export interface SkillBranch {
  id: number | -1
  name: string
  attrs: SkillBranchAttr[]
}

export interface SkillEffect {
  defaultSet: string
  mainWeapon: string
  subWeapon: string
  bodyArmor: string
  mpCost: string
  range: string
  skillType: string
  inCombo: string
  actionTime: string
  castingTime: string
  /** only for history effects */
  historyTargetEffectId?: number
  historyDate?: string
  branches: SkillBranch[]
}

export interface SkillEntry {
  id: number
  name: string
  effects: SkillEffect[]
}

export interface SkillTree {
  id: number
  name: string
  simulatorFlag: boolean
  skills: SkillEntry[]
}

export interface SkillCategory {
  id: number
  name: string
  trees: SkillTree[]
}

export type SkillData = SkillCategory[]

export interface SkillMainEntry {
  /** '0' = category, '1' = tree, '' = skill */
  type: string
  id: number
  name: string
  previousSkill?: number
  drawOrder?: number
  drawTreeCode?: string
}

export type SkillMainData = SkillMainEntry[]

/** keyed by type:id, e.g. "category:0", "tree:101", "skill:1001" */
export interface SkillMainLocale {
  [key: string]: {
    name?: string
  }
}

/** keyed by "category:catId", "tree:catId:treeId", or "skill:catId:treeId:skillId" */
export interface SkillLocale {
  [key: string]: {
    name?: string
  }
}
