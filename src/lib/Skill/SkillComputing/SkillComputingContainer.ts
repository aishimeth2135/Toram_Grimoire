import { shallowReactive } from 'vue'

import type {
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

interface GetFormulaExtraValueHandler {
  (branch: SkillBranchItem, id: string, props?: SkillFormulaExtraProps): number | null
}

interface ComputeFormulaExtraValueHandler {
  (formula: string): number | null
}

/**
 * @vue-reactive-raw controller
 */
class SkillComputingContainer {
  readonly varGetters: {
    characterLevel: (() => number) | null
    skillLevel: ((skill: Skill) => number) | null
    registletLevel: ((skill: Skill) => number[]) | null
  }

  // The constant variables
  readonly handleFormulaConstants: HandleFormulaExtends

  // The extended callback may be affected by the reactive state
  readonly handleFormulaExtends: (() => HandleFormulaExtends)[]

  readonly config: {
    formulaDisplayMode: FormulaDisplayModes
    getFormulaExtraValue: GetFormulaExtraValueHandler | null
    computeFormulaExtraValue: ComputeFormulaExtraValueHandler | null
  }

  constructor() {
    this.varGetters = {
      characterLevel: null,
      skillLevel: null,
      registletLevel: null,
    }
    this.handleFormulaConstants = {
      vars: {},
      texts: {},
    }
    this.handleFormulaExtends = []
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

export { SkillComputingContainer, SkillItem, type SkillFormulaExtraProps }
