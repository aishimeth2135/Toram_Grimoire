import { markRaw } from 'vue'

import { parseListProperty } from '../Properties/List'
import { SkillBuffs } from './enums'

class SkillBranchBuffs {
  private _buffs: Set<SkillBuffs>

  static SkillBuffList: SkillBuffs[] = [SkillBuffs.MpCostHalf]

  private constructor(str: string) {
    this._buffs = new Set()
    ;(parseListProperty(str) as SkillBuffs[]).forEach(item => {
      if (SkillBranchBuffs.SkillBuffList.includes(item)) {
        this._buffs.add(item)
      }
    })
  }

  static create(str: string): SkillBranchBuffs {
    return markRaw(new SkillBranchBuffs(str))
  }

  get items() {
    return [...this._buffs]
  }

  has(str: SkillBuffs) {
    return this._buffs.has(str)
  }
}

export { SkillBranchBuffs }
