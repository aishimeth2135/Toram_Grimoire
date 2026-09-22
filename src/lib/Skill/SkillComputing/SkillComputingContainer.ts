import { markRaw, shallowReactive } from 'vue'

import type { EquipmentRestrictions } from '@/lib/Character/Stat'

import type { FormulaExtendedData } from '../Properties/FormulaExtended'
import type { Skill } from '../Skill'
import { SkillBranchItem } from './SkillBranchItem'
import { SkillEffectItem } from './SkillEffectItem'
import { FormulaDisplayModes } from './enums'

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

interface SkillComputingConfig {
  formulaDisplayMode: FormulaDisplayModes
  getFormulaExtraValue: GetFormulaExtraValueHandler | null
  computeFormulaExtraValue: ComputeFormulaExtraValueHandler | null
}

class SkillComputingContainer {
  readonly varGetters: {
    characterLevel: (() => number) | null
    skillLevel: ((skill: Skill) => number) | null
    registletLevel: ((skill: Skill) => number[]) | null
  }

  // The constant variables
  readonly handleFormulaConstants: FormulaExtendedData

  // The extended callback may be affected by the reactive state
  readonly handleFormulaExtends: (() => FormulaExtendedData)[]

  readonly config: SkillComputingConfig

  private constructor(config: SkillComputingConfig) {
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
    this.config = config
  }

  static create(): SkillComputingContainer {
    const config = shallowReactive<SkillComputingConfig>({
      formulaDisplayMode: FormulaDisplayModes.Normal,
      getFormulaExtraValue: null,
      computeFormulaExtraValue: null,
    })

    return markRaw(new SkillComputingContainer(config))
  }
}

class SkillItem {
  readonly skill: Skill
  readonly effectItems: SkillEffectItem[]

  private constructor(skill: Skill) {
    this.skill = skill

    const defaultSef = skill.defaultEffect
    const otherSefs = skill.effects.filter(sef => sef !== defaultSef)
    this.effectItems = [
      SkillEffectItem.create(this, defaultSef),
      ...otherSefs.map(sef => SkillEffectItem.create(this, defaultSef, sef)),
    ]
  }

  static create(skill: Skill): SkillItem {
    return markRaw(new SkillItem(skill))
  }

  findEffectItem(equipment: EquipmentRestrictions, getSkillLevel?: (skill: Skill) => number) {
    return (
      this.effectItems.find(effectItem => effectItem.equipmentMatch(equipment, getSkillLevel)) ??
      null
    )
  }
}

export { SkillComputingContainer, SkillItem, type SkillFormulaExtraProps }
