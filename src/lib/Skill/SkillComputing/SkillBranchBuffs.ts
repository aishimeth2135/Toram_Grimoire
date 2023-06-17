import { splitComma } from '@/shared/utils/string'

import { SkillBuffs } from './enums'

/**
 * @vue-reactive raw
 */
class SkillBranchBuffs {
  private _buffs: Set<SkillBuffs>

  static SkillBuffList: SkillBuffs[] = [SkillBuffs.MpCostHalf]

  constructor(str: string) {
    this._buffs = new Set()
    ;(splitComma(str) as SkillBuffs[]).forEach(item => {
      if (SkillBranchBuffs.SkillBuffList.includes(item)) {
        this._buffs.add(item)
      }
    })
  }

  get items() {
    return [...this._buffs]
  }

  has(str: SkillBuffs) {
    return this._buffs.has(str)
  }
}

export { SkillBranchBuffs }
