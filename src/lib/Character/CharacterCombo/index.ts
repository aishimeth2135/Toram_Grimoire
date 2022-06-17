import { Skill } from '@/lib/Skill/Skill'

import { CharacterComboTags } from './enums'

interface ComboSkillState {
  skill: CharacterComboSkill;
  rate: number;
  mpCost: number;
  condition: 'buff' | null;
}

class CharacterCombo {
  comboSkills: CharacterComboSkill[]

  constructor() {
    this.comboSkills = []
  }

  getComboSkillStates(getMpCost: (skill: Skill) => number) {
    const ratesItems = this.comboSkills
      .filter(skill => skill.skill)
      .map(skill => ({
        skill,
        rate: 100,
        mpCost: getMpCost(skill.skill!),
        condition: null,
      } as ComboSkillState))

    const addRate = (idx: number, value: number) => {
      if (idx < ratesItems.length) {
        ratesItems[idx].rate = Math.max(ratesItems[idx].rate + value, 10)
      }
    }

    let savedMp = 0
    ratesItems.forEach((item, idx) => {
      const { skill } = item
      if (skill.tag === CharacterComboTags.Smite) {
        addRate(idx, 50)
        addRate(idx + 1, -50)
        if (idx === ratesItems.length - 1) {
          item.mpCost *= 2
        }
      } else if (skill.tag === CharacterComboTags.Consecutive) {
        addRate(idx, -10 * (1 - idx))
        item.mpCost = Math.max(item.mpCost - (idx - 1) * 100, 0)
      } else if (skill.tag === CharacterComboTags.Save) {
        addRate(idx + 1, -80)
        addRate(idx + 2, -60)
        addRate(idx + 3, -40)
        addRate(idx + 4, -20)
        savedMp += item.mpCost
        item.mpCost = 0
      } else if (skill.tag === CharacterComboTags.Bloodsucker) {
        item.rate = 110 + idx
        item.condition = 'buff'
      }
      if (savedMp > 0 && item.mpCost > 0) {
        const subValue = Math.min(item.mpCost, savedMp)
        item.mpCost -= subValue
        savedMp -= subValue
      }
    })
  }
}

class CharacterComboSkill {
  parent: CharacterCombo
  skill: Skill | null
  tag: CharacterComboTags | null

  constructor(parent: CharacterCombo) {
    this.parent = parent
    this.skill = null
    this.tag = null
  }
}

export default CharacterCombo

export { ComboSkillState }
