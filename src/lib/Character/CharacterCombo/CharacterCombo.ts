import Grimoire from '@/shared/Grimoire'
import {
  type InstanceId,
  InstanceIdGenerator,
  type InstanceWithId,
} from '@/shared/services/InstanceId'

import type { Skill, SkillBranch } from '@/lib/Skill/Skill'

import { CharacterComboTags } from './enums'

interface ComboSkillState {
  itemId: string
  comboSkill: CharacterComboSkill
  rate: number
  mpCost: number
  valid: boolean
}

interface CharacterComboSaveData {
  skills: CharacterComboSkillSaveData[]
}
interface CharacterComboSkillSaveData {
  skill: string | null
  tag: CharacterComboTags | null
  condition: null | 'buff'
}

interface CharacterComboGetStatesParams {
  getMpCost: (skill: Skill, previous: Skill | null) => number
  checkSkillValid: (skill: Skill) => boolean
}

class CharacterCombo implements InstanceWithId {
  private static _idGenerator = new InstanceIdGenerator()
  readonly instanceId: InstanceId
  comboSkills: CharacterComboSkill[]
  config: {
    damageCalc: boolean
    unselectedBranches: SkillBranch[]
  }

  constructor() {
    this.instanceId = CharacterCombo._idGenerator.generate()
    this.comboSkills = []
    this.config = {
      damageCalc: false,
      unselectedBranches: [],
    }

    this.appendSkill()
  }

  appendSkill() {
    const newSkill = new CharacterComboSkill(this)
    this.comboSkills.push(newSkill)
    return newSkill
  }

  getComboSkillStates(params: CharacterComboGetStatesParams): ComboSkillState[] {
    const ratesItems = this.comboSkills.map(
      (skill, idx, ary) =>
        ({
          itemId: skill.skill?.skillId ?? `empty-${idx}`,
          comboSkill: skill,
          rate: 100,
          mpCost: skill.skill
            ? params.getMpCost(skill.skill, idx > 0 ? ary[idx - 1].skill : null)
            : 0,
          valid: skill.skill ? params.checkSkillValid(skill.skill) : false,
        }) as ComboSkillState
    )

    const addRate = (idx: number, value: number) => {
      if (idx < ratesItems.length) {
        ratesItems[idx].rate = Math.max(ratesItems[idx].rate + value, 10)
      }
    }

    let savedMp = 0
    ratesItems.forEach((item, idx) => {
      const { comboSkill: skill } = item
      const comboIdx = idx + 1
      if (skill.tag === CharacterComboTags.Smite) {
        addRate(idx, 50)
        addRate(idx + 1, -50)
        if (idx === ratesItems.length - 1) {
          item.mpCost *= 2
        }
      } else if (skill.tag === CharacterComboTags.Consecutive) {
        addRate(idx, -10 * (comboIdx - 1))
        item.mpCost = Math.max(item.mpCost - (comboIdx - 1) * 100, 0)
      } else if (skill.tag === CharacterComboTags.Save) {
        addRate(idx + 1, -80)
        addRate(idx + 2, -60)
        addRate(idx + 3, -40)
        addRate(idx + 4, -20)
        savedMp += item.mpCost
        item.mpCost = 0
      } else if (skill.tag === CharacterComboTags.Bloodsucker && skill.condition === 'buff') {
        addRate(idx, 110 + comboIdx)
      }
      if (savedMp > 0 && item.mpCost > 0) {
        const subValue = Math.min(item.mpCost, savedMp)
        item.mpCost -= subValue
        savedMp -= subValue
      }
      if (idx === ratesItems.length - 1 && savedMp > 0) {
        item.mpCost += savedMp
      }
    })

    return ratesItems
  }

  save(): CharacterComboSaveData {
    return {
      skills: this.comboSkills.map(skill => skill.save()),
    }
  }

  static load(data: CharacterComboSaveData): CharacterCombo {
    const newCombo = new CharacterCombo()
    newCombo.comboSkills = data.skills.map(_data => CharacterComboSkill.load(newCombo, _data))
    return newCombo
  }
}

class CharacterComboSkill {
  parent: CharacterCombo
  skill: Skill | null
  tag: CharacterComboTags | null
  condition: null | 'buff'

  constructor(parent: CharacterCombo) {
    this.parent = parent
    this.skill = null
    this.tag = null
    this.condition = null
  }

  get previousSkill(): CharacterComboSkill | null {
    const idx = this.index
    if (idx > 0) {
      return this.parent.comboSkills[idx - 1] ?? null
    }
    return null
  }

  get index() {
    return this.parent.comboSkills.indexOf(this)
  }

  setSkill(skill: Skill | null) {
    if (skill !== null) {
      const used = this.parent.comboSkills.find(comboSkill => comboSkill.skill === skill)
      if (used) {
        used.skill = null
      }
    }
    this.skill = skill
  }

  remove() {
    const idx = this.parent.comboSkills.indexOf(this)
    this.parent.comboSkills.splice(idx, 1)
  }

  save(): CharacterComboSkillSaveData {
    return {
      skill: this.skill?.skillId ?? null,
      tag: this.tag,
      condition: this.condition,
    }
  }

  static load(parent: CharacterCombo, data: CharacterComboSkillSaveData): CharacterComboSkill {
    const newSkill = new CharacterComboSkill(parent)
    newSkill.skill = data.skill ? Grimoire.Skill.skillRoot.findSkillById(data.skill) : null
    newSkill.tag = data.tag
    newSkill.condition = data.condition
    return newSkill
  }
}

export { CharacterCombo, CharacterComboSkill }

export type { ComboSkillState, CharacterComboSaveData }
