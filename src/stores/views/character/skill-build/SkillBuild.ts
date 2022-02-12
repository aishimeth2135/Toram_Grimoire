import Grimoire from '@/shared/Grimoire'

import { Skill, SkillTree } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import { SkillBuildState } from '../skill'

interface SkillStateBase {
  level: number;
  starGemLevel: number;

  /** boolean is expected, null if default value is unknown */
  enabled: boolean | null;
}

interface SkillState extends SkillStateBase {
  enabled: boolean;
}

interface SkillSaveData extends SkillState {
  skillId: string;
}

interface SkillBuildSaveData {
  name: string;
  skillStates: SkillSaveData[];
  selectedSkillTrees: string[];
}

let _skillBuildAutoIncreasement = 0
export class SkillBuild {
  /** Map<skill-id, skill-level> */
  protected _skillStatesMap: Map<Skill, SkillStateBase>
  protected _skillTreesSet: Set<SkillTree>

  instanceId: number
  name: string

  constructor(name: string = '') {
    this.instanceId = _skillBuildAutoIncreasement
    _skillBuildAutoIncreasement += 1

    this.name = name
    this._skillStatesMap = new Map()
    this._skillTreesSet = new Set()
  }

  hasSkillState(skill: Skill) {
    return this._skillStatesMap.has(skill)
  }

  getSkillState(skill: Skill): SkillState {
    if (!this._skillStatesMap.has(skill)) {
      const enabledDefaultValue = skill.effects.some(eft => eft.branches.some(bch => bch.name === SkillBranchNames.Passive))
      this._skillStatesMap.set(skill, {
        level: 0,
        starGemLevel: 0,
        enabled: enabledDefaultValue,
      })
    }
    const state = this._skillStatesMap.get(skill)!
    if (state.enabled === null) {
      const enabledDefaultValue = skill.effects.some(eft => eft.branches.some(bch => bch.name === SkillBranchNames.Passive))
      state.enabled = enabledDefaultValue
    }
    return state as SkillState
  }

  getSkillLevel(skill: Skill): number {
    return this.getSkillState(skill).level
  }

  addSkillLevel(skill: Skill, level: number) {
    const state = this.getSkillState(skill)
    let levelSet = state.level + level
    levelSet = Math.min(10, Math.max(levelSet, 0))
    state.level = levelSet
    this.regressSkillTree(skill, levelSet)
  }

  regressSkillTree(start: Skill, level: number) {
    const checkSkill = (skill: Skill, set: number) => {
      this.getSkillState(skill).level = set
    }
    if (level < 5) {
      const stk: Skill[] = [start]
      while (stk.length !== 0) {
        const current = stk.pop()!
        current.parent.skills.forEach(skill => {
          if (skill.previous === current.id) {
            stk.push(skill)
            checkSkill(skill, 0)
          }
        })
      }
    }
    let current = start
    while (current.previous !== -1) {
      const pre = current.parent.skills.find(sk => sk.id === current.previous)
      if (!pre) {
        break
      }
      current = pre
      checkSkill(current, 5)
    }
  }

  get selectedSkillTrees(): SkillTree[] {
    return [...this._skillTreesSet.keys()].sort((item1, item2) => item1.skillTreeId.localeCompare(item2.skillTreeId))
  }

  get validSkills(): Skill[] {
    return [...this._skillStatesMap.entries()]
      .filter(([, state]) => state.level !== 0 && state.enabled)
      .map(([skill]) => skill)
  }

  get allSkills(): Skill[] {
    return [...this._skillStatesMap.keys()]
  }

  toggleSkillTreeSelected(skillTree: SkillTree) {
    if (this._skillTreesSet.has(skillTree)) {
      this._skillTreesSet.delete(skillTree)
    } else {
      this._skillTreesSet.add(skillTree)
    }
  }

  clone(): SkillBuild {
    return SkillBuild.load(this.save())
  }

  save(): SkillBuildSaveData {
    const skillStates = [...this._skillStatesMap.entries()].map(([skill, state]) => ({
      skillId: skill.skillId,
      enabled: state.enabled ?? true,
      level: state.level,
      starGemLevel: state.starGemLevel,
    }))
    const selectedSkillTrees = [...this._skillTreesSet.keys()].map(skillTree => skillTree.skillTreeId)
    return {
      name: this.name,
      skillStates,
      selectedSkillTrees,
    }
  }

  static load(data: SkillBuildSaveData): SkillBuild {
    const newBuild = new SkillBuild(data.name)
    data.selectedSkillTrees.forEach(skillTreeId => {
      let skillTree: SkillTree | null = null
      Grimoire.Skill.skillRoot.skillTreeCategorys.some(stc => {
        const find = stc.skillTrees.find(st => st.skillTreeId === skillTreeId)
        if (find) {
          skillTree = find
          return true
        }
        return false
      })
      if (skillTree) {
        newBuild._skillTreesSet.add(skillTree)
      }
    })
    data.skillStates.forEach(state => {
      let skill: Skill | null = null
      Grimoire.Skill.skillRoot.skillTreeCategorys.some(stc => {
        return stc.skillTrees.some(st => {
          const find = st.skills.find(_skill => _skill.skillId === state.skillId)
          if (find) {
            skill = find
            return true
          }
          return false
        })
      })
      if (skill) {
        newBuild._skillStatesMap.set(skill, {
          enabled: state.enabled,
          level: state.level,
          starGemLevel: state.starGemLevel,
        })
      }
    })
    return newBuild
  }

  static loadFromLagacy(buildState: SkillBuildState): SkillBuild {
    const newBuild = new SkillBuild(buildState.name)

    buildState.skillTreeCategoryStates.forEach(stcState => {
      stcState.skillTreeStates.forEach(stState => {
        if (!stState.visible) {
          return
        }
        let skillTree: SkillTree | null = null
        Grimoire.Skill.skillRoot.skillTreeCategorys.some(stc => {
          const find = stc.skillTrees.find(st => st.skillTreeId === stState.origin.skillTreeId)
          if (find) {
            skillTree = find
            return true
          }
          return false
        })
        if (skillTree) {
          newBuild._skillTreesSet.add(skillTree)
        }

        stState.levelSkillTree.levelSkills.forEach(levelSkill => {
          if (levelSkill.level() === 0) {
            return
          }
          let skill: Skill | null = null
          Grimoire.Skill.skillRoot.skillTreeCategorys.some(stc => {
            return stc.skillTrees.some(st => {
              const find = st.skills.find(_skill => _skill.skillId === levelSkill.base.skillId)
              if (find) {
                skill = find
                return true
              }
              return false
            })
          })
          if (skill) {
            newBuild._skillStatesMap.set(skill, {
              enabled: null,
              level: levelSkill.level(),
              starGemLevel: levelSkill.starGemLevel(),
            })
          }
        })
      })
    })

    return newBuild
  }
}

export type { SkillBuildSaveData }
