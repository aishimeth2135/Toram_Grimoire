import { shallowReactive } from 'vue'

import {
  HandleFormulaMethods,
  HandleFormulaTexts,
  HandleFormulaVars,
} from '@/shared/utils/data'

import type { EquipmentRestrictions } from '@/lib/Character/Stat'

import type { Skill } from '../Skill'
import { SkillBranchItem } from './SkillBranchItem'
import { SkillEffectItem } from './SkillEffectItem'
import { FormulaDisplayModes } from './enums'

interface HandleFormulaExtends {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods?: HandleFormulaMethods
}

interface SkillFormulaExtraProps {
  max: number | null
  min: number | null
}

/**
 * @vue-reactive controller
 */
class SkillComputingContainer {
  varGetters: {
    characterLevel: (() => number) | null
    skillLevel: ((skill: Skill) => number) | null
    registletLevel: ((skill: Skill) => number[]) | null
  }

  handleFormulaExtends: HandleFormulaExtends

  handleFormulaDynamicExtends: (() => HandleFormulaExtends)[]

  config: {
    formulaDisplayMode: FormulaDisplayModes
    getFormulaExtraValue:
      | ((
          branch: SkillBranchItem,
          id: string,
          props?: SkillFormulaExtraProps
        ) => number | null)
      | null
    computeFormulaExtraValue: ((formula: string) => number | null) | null
  }

  constructor() {
    this.varGetters = {
      characterLevel: null,
      skillLevel: null,
      registletLevel: null,
    }
    this.handleFormulaExtends = {
      vars: {},
      texts: {},
    }
    this.handleFormulaDynamicExtends = []
    this.config = shallowReactive({
      formulaDisplayMode: FormulaDisplayModes.Normal,
      getFormulaExtraValue: null,
      computeFormulaExtraValue: null,
    })
  }
}

/**
 * @vue-reactive-raw
 */
class SkillItem {
  readonly skill: Skill
  readonly effectItems: SkillEffectItem[]

  constructor(skill: Skill) {
    this.skill = skill

    const defaultSef = skill.defaultEffect
    const otherSefs = skill.effects.filter(sef => sef !== defaultSef)
    this.effectItems = [
      new SkillEffectItem(this, defaultSef),
      ...otherSefs.map(sef => new SkillEffectItem(this, defaultSef, sef)),
    ]
  }

  findEffectItem(
    equipment: EquipmentRestrictions,
    getSkillLevel?: (skill: Skill) => number
  ) {
    return (
      this.effectItems.find(effectItem =>
        effectItem.equipmentMatch(equipment, getSkillLevel)
      ) ?? null
    )
  }
}

export { SkillComputingContainer, SkillItem }

export type { SkillFormulaExtraProps }
