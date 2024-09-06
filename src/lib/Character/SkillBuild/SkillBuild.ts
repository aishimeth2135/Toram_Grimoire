import { type SkillBuildState } from '@/stores/views/character/skill'

import Grimoire from '@/shared/Grimoire'
import { toInt } from '@/shared/utils/number'

import { Skill, SkillTree } from '@/lib/Skill/Skill'
import { SkillTypes } from '@/lib/Skill/Skill'

import { type CharacterBindingBuild } from '../Character'
import { checkLoadedId, getLoadedId } from '../Character/CharacterBuild'

interface SkillState {
  level: number
  starGemLevel: number
  enabled: boolean
}

interface SkillSaveData extends SkillState {
  skillId: string
}

interface SkillBuildSaveData {
  id: number
  name: string
  skillStates: SkillSaveData[]
  selectedSkillTrees: string[]
}

interface EffectedSkillResult {
  skill: Skill
  newLevel: number
}

function skillTreeIdToInteger(skillTreeId: string): number {
  const [n1, n2] = skillTreeId.split('-').map(part => toInt(part) ?? 0)
  return n1 * 100 + n2
}

export class SkillBuild implements CharacterBindingBuild {
  private static _idIncreasement = 0

  protected _skillStatesMap: Map<Skill, SkillState>
  protected _skillTreesSet: Set<SkillTree>

  loadedId: string | null
  id: number
  name: string

  constructor(name: string = '') {
    this.loadedId = null
    this.id = SkillBuild._idIncreasement
    SkillBuild._idIncreasement += 1

    this.name = name
    this._skillStatesMap = new Map()
    this._skillTreesSet = new Set()
  }

  hasSkill(skill: Skill): boolean {
    return this._skillStatesMap.has(skill)
  }

  hasSkillTree(skillTree: SkillTree): boolean {
    return this._skillTreesSet.has(skillTree)
  }

  getSkillState(skill: Skill): SkillState {
    if (!this._skillStatesMap.has(skill)) {
      this._skillStatesMap.set(skill, {
        level: 0,
        starGemLevel: 0,
        enabled: skill.types.includes(SkillTypes.Passive),
      })
    }
    const state = this._skillStatesMap.get(skill)!

    // 忍術表中技能的等級跟隨「忍術」
    if (skill.skillId.startsWith('5-2-')) {
      state.level = this.getSkillState(
        skill.parent.parent.parent.findSkillById('4-5-0')!
      ).level
    }

    return state
  }

  getSkillLevel(skill: Skill): number {
    const state = this.getSkillState(skill)
    return Math.max(state.level, state.starGemLevel)
  }

  increaseSkillLevel(skill: Skill, level: number) {
    const state = this.getSkillState(skill)
    this.setSkillLevel(skill, state.level + level)
  }

  setSkillLevel(
    skill: Skill,
    level: number,
    effectedSkills: EffectedSkillResult[] | null = null
  ) {
    const state = this.getSkillState(skill)
    const levelSet = Math.min(10, Math.max(level, 0))
    effectedSkills =
      effectedSkills ?? this.checkLevelEffectedSkills(skill, levelSet)
    effectedSkills.forEach(
      data => (this.getSkillState(data.skill).level = data.newLevel)
    )
    state.level = levelSet
  }

  increaseStarGemLevel(skill: Skill, level: number) {
    const state = this.getSkillState(skill)
    let levelSet = state.starGemLevel + level
    levelSet = Math.min(10, Math.max(levelSet, 0))
    state.starGemLevel = levelSet
  }

  // regressSkillTree(start: Skill): void {
  //   const skillState = this.getSkillState(start)
  //   const level = skillState.level

  //   if (level < 5) {
  //     const stk: Skill[] = [start]
  //     while (stk.length !== 0) {
  //       const current = stk.pop()!
  //       current.parent.skills.forEach(skill => {
  //         if (skill.previous === current.id) {
  //           stk.push(skill)
  //           this.getSkillState(skill).level = 0
  //         }
  //       })
  //     }
  //   }
  //   if (level > 0) {
  //     let current = start
  //     while (current.previous !== -1) {
  //       const pre = current.parent.skills.find(sk => sk.id === current.previous)
  //       if (!pre) {
  //         break
  //       }
  //       current = pre
  //       const state = this.getSkillState(current)
  //       if (state.level < 5) {
  //         state.level = 5
  //       }
  //     }
  //   }
  // }

  checkLevelEffectedSkills(
    target: Skill,
    levelSet: number
  ): EffectedSkillResult[] {
    const frontSkills = new Set<Skill>()
    const behindSkills = new Set<Skill>()

    if (levelSet < 5) {
      const stk: Skill[] = [target]
      while (stk.length !== 0) {
        const current = stk.pop()!
        current.parent.skills.forEach(skill => {
          if (skill.previous === current.id) {
            stk.push(skill)
            const state = this.getSkillState(skill)
            if (state.level > 0) {
              behindSkills.add(skill)
            }
          }
        })
      }
    }
    if (levelSet > 0) {
      let current = target
      while (current.previous !== -1) {
        const pre = current.parent.skills.find(
          _skill => _skill.id === current.previous
        )
        if (!pre) {
          break
        }
        current = pre
        const state = this.getSkillState(current)
        if (state.level < 5) {
          frontSkills.add(current)
        }
      }
    }

    const results: EffectedSkillResult[] = []

    frontSkills.forEach(skill => {
      results.push({
        skill,
        newLevel: 5,
      })
    })
    behindSkills.forEach(skill => {
      results.push({
        skill,
        newLevel: 0,
      })
    })

    return results
  }

  getSkillTreePointSum(skillTree: SkillTree) {
    if (!this._skillTreesSet.has(skillTree)) {
      return {
        level: 0,
        starGemLevel: 0,
      }
    }

    let level = 0
    let starGemLevel = 0

    skillTree.skills.forEach(skill => {
      if (this.hasSkill(skill) && !skill.parent.attrs.simulatorFlag) {
        const state = this.getSkillState(skill)
        level += state.level
        starGemLevel += Math.max(state.starGemLevel - state.level, 0)
      }
    })

    return {
      level,
      starGemLevel,
    }
  }

  get selectedSkillTrees(): SkillTree[] {
    return [...this._skillTreesSet.keys()].sort(
      (item1, item2) =>
        skillTreeIdToInteger(item1.skillTreeId) -
        skillTreeIdToInteger(item2.skillTreeId)
    )
  }

  // get validSkills(): Skill[] {
  //   return [...this._skillStatesMap.entries()]
  //     .filter(([, state]) => (state.level !== 0 || state.starGemLevel !== 0) && state.enabled)
  //     .map(([skill]) => skill)
  // }

  get allSkillLevels(): {
    enabled: boolean
    skill: Skill
    skillLevel: number
  }[] {
    return [...this._skillStatesMap.entries()].map(([skill, state]) => {
      return {
        enabled: state.enabled,
        skill,
        skillLevel: Math.max(state.starGemLevel, state.level),
      }
    })
  }

  get allSkills(): Skill[] {
    return [...this._skillStatesMap.keys()]
  }

  get skillPointSum(): { level: number; starGemLevel: number } {
    let level = 0
    let starGemLevel = 0
    for (const [skill, state] of this._skillStatesMap.entries()) {
      if (skill.parent.attrs.simulatorFlag) {
        continue
      }
      level += state.level
      starGemLevel += Math.max(state.starGemLevel - state.level, 0)
    }

    return {
      level,
      starGemLevel,
    }
  }

  toggleSkillTreeSelected(skillTree: SkillTree): void {
    if (this._skillTreesSet.has(skillTree)) {
      this._skillTreesSet.delete(skillTree)
      skillTree.skills.forEach(skill => this._skillStatesMap.delete(skill))
    } else {
      this._skillTreesSet.add(skillTree)
    }
  }

  clone(): SkillBuild {
    return SkillBuild.load(null, this.save())
  }

  save(): SkillBuildSaveData {
    const skillStates = [...this._skillStatesMap.entries()]
      .filter(([, state]) => state.level !== 0 || state.starGemLevel !== 0)
      .map(([skill, state]) => ({
        skillId: skill.skillId,
        enabled: state.enabled ?? true,
        level: state.level,
        starGemLevel: state.starGemLevel,
      }))
    const selectedSkillTrees = [...this._skillTreesSet.keys()].map(
      skillTree => skillTree.skillTreeId
    )
    return {
      id: this.id,
      name: this.name,
      skillStates,
      selectedSkillTrees,
    }
  }

  static load(
    loadCategory: string | null,
    data: SkillBuildSaveData
  ): SkillBuild {
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
      let skill!: Skill
      Grimoire.Skill.skillRoot.skillTreeCategorys.some(stc => {
        return stc.skillTrees.some(st => {
          const find = st.skills.find(
            _skill => _skill.skillId === state.skillId
          )
          if (find) {
            skill = find
            return true
          }
          return false
        })
      })
      if (skill && newBuild._skillTreesSet.has(skill.parent)) {
        const _state = newBuild.getSkillState(skill)
        _state.enabled = state.enabled
        _state.level = state.level
        _state.starGemLevel = state.starGemLevel
      }
    })
    if (typeof data.id === 'number' && loadCategory !== null) {
      newBuild.loadedId = getLoadedId(loadCategory, data.id)
    }
    return newBuild
  }

  matchLoadedId(loadCategory: string, id: number | null): boolean {
    return checkLoadedId(this, loadCategory, id)
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
          const find = stc.skillTrees.find(
            st => st.skillTreeId === stState.origin.skillTreeId
          )
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
              const find = st.skills.find(
                _skill => _skill.skillId === levelSkill.base.skillId
              )
              if (find) {
                skill = find
                return true
              }
              return false
            })
          })
          if (skill) {
            const _state = newBuild.getSkillState(skill)
            _state.level = levelSkill.level()
            _state.starGemLevel = levelSkill.starGemLevel()
          }
        })
      })
    })

    return newBuild
  }
}

export type { SkillBuildSaveData }
