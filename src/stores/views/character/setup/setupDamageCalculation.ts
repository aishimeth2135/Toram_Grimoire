
import { computed, ref, Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'

import { CalculationContainerIds, CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'
import { Character } from '@/lib/Character/Character'
import { Skill, SkillBranch } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { EnemyElements } from '@/lib/Enemy/enums'
import { EquipmentFieldTypes } from '@/lib/Character/Character/enums'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { Calculation } from '@/lib/Calculation/Damage/Calculation'
import { StatRecorded } from '@/lib/Character/Stat'
import { StatRestriction } from '@/lib/Character/Stat'

import { SetupCharacterStatCategoryResultsExtended, SkillResult } from '.'
import { setupCalculationExpectedResult } from '../../damage-calculation/setup'
import { getCharacterElement } from '../utils'

export interface TargetProperties {
  physicalResistance: number;
  magicResistance: number;
  def: number;
  mdef: number;
  level: number;
  criticalRateResistance: number;
  criticalRateResistanceTotal: number;
  dodge: number;
  element: null | EnemyElements;
  rangeDamage: CalculationItemIds;
}

export interface CalculationOptions {
  proration: number;
  comboRate: number;
  armorBreakDisplay: boolean;
}

const promisedAccuracyRateMapping: Partial<Record<EquipmentTypes, number>> = {
  [EquipmentTypes.Empty]: 50,
  [EquipmentTypes.OneHandSword]: 25,
  [EquipmentTypes.TwoHandSword]: 15,
  [EquipmentTypes.Staff]: 30,
  [EquipmentTypes.MagicDevice]: 10,
  [EquipmentTypes.Bow]: 10,
  [EquipmentTypes.Bowgun]: 5,
  [EquipmentTypes.Knuckle]: 10,
  [EquipmentTypes.Halberd]: 20,
  [EquipmentTypes.Katana]: 30,
}
const elementsMap: Record<EnemyElements, CalculationItemIds> = {
  [EnemyElements.Neutral]: CalculationItemIds.StrongerAgainstNeutral,
  [EnemyElements.Fire]: CalculationItemIds.StrongerAgainstFire,
  [EnemyElements.Water]: CalculationItemIds.StrongerAgainstWater,
  [EnemyElements.Wind]: CalculationItemIds.StrongerAgainstWind,
  [EnemyElements.Earth]: CalculationItemIds.StrongerAgainstEarth,
  [EnemyElements.Light]: CalculationItemIds.StrongerAgainstLight,
  [EnemyElements.Dark]: CalculationItemIds.StrongerAgainstDark,
}

const againstElementMap: Record<EnemyElements, EnemyElements> = {
  [EnemyElements.Neutral]: EnemyElements.Neutral,
  [EnemyElements.Fire]: EnemyElements.Earth,
  [EnemyElements.Water]: EnemyElements.Fire,
  [EnemyElements.Wind]: EnemyElements.Water,
  [EnemyElements.Earth]: EnemyElements.Wind,
  [EnemyElements.Light]: EnemyElements.Dark,
  [EnemyElements.Dark]: EnemyElements.Light,
}

export default function setupDamageCalculation(
  character: Ref<Character | null>,
  setupCharacterStatCategoryResultsExtended: SetupCharacterStatCategoryResultsExtended,
  getSkillLevel: (skill: Skill) => { valid: boolean; level: number },
) {
  const calculationBase = Grimoire.DamageCalculation.calculationBase

  const skillTwoHanded = Grimoire.Skill.skillRoot.findSkillById('0-6-11')!

  const promisedAccuracyRate = computed(() => {
    if (!character.value) {
      return 0
    }
    const mainType = character.value.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType
    return promisedAccuracyRateMapping[mainType] ?? 0
  })

  interface SkillProperties {
    skillRealMpCost: number;
    skillConstant: number;
    skillMultiplier: number;
  }

  const getSkillState = (() => {
    const skillStates = ref(new Map<Skill, { enabled: boolean }>())
    return (skill: Skill) => {
      if (!skillStates.value.has(skill)) {
        skillStates.value.set(skill, { enabled: false })
      }
      return skillStates.value.get(skill)!
    }
  })()

  const getSkillBranchState = (() => {
    // save state by default branch
    const skillBranchStates = ref(new Map<SkillBranch, { enabled: boolean }>())
    return (branch: SkillBranch) => {
      if (!skillBranchStates.value.has(branch)) {
        skillBranchStates.value.set(branch, { enabled: true })
      }
      return skillBranchStates.value.get(branch)!
    }
  })()

  const getSkillElement = (branchItem: SkillBranchItem) => {
    const chara = character.value
    if (!chara) {
      return null
    }
    const element = createElementMap()
    const setElement = (stat: StatRestriction) => element[stat.baseId.replace('element_', '') as EnemyElements] = 1

    const skillElement = branchItem.prop('element')
    let skillDualElement = branchItem.prop('dual_element')
    if (skillDualElement === 'none') {
      const extraBch = branchItem.suffixBranches.find(suf => {
        if(!getSkillBranchState(suf.default).enabled) {
          return false
        }
        return suf.is(SkillBranchNames.Extra) && suf.hasProp('dual_element')
      })
      if (extraBch) {
        skillDualElement = extraBch.prop('dual_element')
      }
    }

    const sub = chara.equipmentField(EquipmentFieldTypes.SubWeapon)

    if (skillElement === 'against') {
      element[EnemyElements.Fire] = 1
      element[EnemyElements.Water] = 1
      element[EnemyElements.Earth] = 1
      element[EnemyElements.Wind] = 1
      element[EnemyElements.Light] = 1
      element[EnemyElements.Dark] = 1
      return element
    }
    if (skillElement !== 'none') {
      if (isValidElement(skillElement)) {
        element[skillElement] = 1
      }
      if (skillDualElement !== 'none') {
        if (sub.equipment?.elementStat) {
          if (skillDualElement === 'arrow') {
            if (chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow)) {
              setElement(sub.equipment!.elementStat)
            }
          } else if (skillDualElement === 'one_hand_sword') {
            if (chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword)) {
              setElement(sub.equipment!.elementStat)
            }
          } else if (skillDualElement === 'magic_device') {
            if (chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.MagicDevice)) {
              setElement(sub.equipment!.elementStat)
            }
          }
        }
      }
      return element
    }
    return null
  }

  const setupDamageCalculationExpectedResult = (
    skillResult: Ref<SkillResult>,
    extraStats: Ref<StatRecorded[]>,
    targetProperties: Ref<TargetProperties>,
    calculationOptions: Ref<CalculationOptions>,
  ) => {
    const { categoryResults, characterPureStats } = setupCharacterStatCategoryResultsExtended(extraStats, skillResult)

    const container = computed(() => skillResult.value.container)

    const statResults = computed(() => {
      return categoryResults.value.map(category => category.stats).flat()
    })

    const statValue = (baseId: string) => characterPureStats.value.find(stat => stat.baseId === baseId)?.value ?? 0
    const resultValue = (id: string) => statResults.value.find(result => result.id === id)?.resultValue ?? 0

    const currentCharacterElement = computed(() => character.value ? getCharacterElement(character.value) : null)
    const skillElementExtra = computed(() => {
      const newElement = createElementMap()
      if (!currentCharacterElement.value) {
        return newElement
      }
      const skillElement = getSkillElement(container.value.branchItem)
      const magicExtra = container.value.getOrigin('damage_type') === 'magic' ? resultValue('magic_element_dmg') : 0
      if (skillElement) {
        const keys = Object.keys(skillElement) as EnemyElements[]
        keys.forEach(key => {
          const againstKey = againstElementMap[key]
          if (skillElement[key] === 1) {
            newElement[againstKey] = magicExtra + 25
          }
        })
      } else {
        const keys = Object.keys(currentCharacterElement.value) as EnemyElements[]
        keys.forEach(key => {
          if (currentCharacterElement.value![key] === 1) {
            const againstKey = againstElementMap[key]
            newElement[againstKey] = 25
          }
        })
      }
      return newElement
    })

    const calculationVars = computed(() => {
      if (!character.value) {
        return new Map<CalculationItemIds, number>()
      }

      return new Map<CalculationItemIds, number>([
        [CalculationItemIds.Atk, resultValue('atk')],
        [CalculationItemIds.Matk, resultValue('matk')],
        [CalculationItemIds.SubAtk, resultValue('sub_atk')],
        [CalculationItemIds.SubStability, resultValue('sub_stability')],
        [CalculationItemIds.PhysicalPierce, resultValue('physical_pierce')],
        [CalculationItemIds.MagicPierce, resultValue('magic_pierce')],
        [CalculationItemIds.UnsheatheAttackConstant, resultValue('unsheathe_attack')],
        [CalculationItemIds.UnsheatheAttackMultiplier, resultValue('unsheathe_attack_multiplier')],
        [CalculationItemIds.CriticalDamage, resultValue('critical_damage')],
        [CalculationItemIds.MagicCriticalDamageConversionRate, 50 + statValue('magic_cd_percentage')],
        [CalculationItemIds.CriticalRate, resultValue('critical_rate')],
        [CalculationItemIds.MagicCriticalRateConversionRate, statValue('magic_crt_percentage')],
        [CalculationItemIds.ShortRangeDamage, resultValue('short_range_damage')],
        [CalculationItemIds.LongRangeDamage, resultValue('long_range_damage')],
        [CalculationItemIds.Stability, resultValue('stability')],
        [CalculationItemIds.Accuracy, resultValue('accuracy')],
        [CalculationItemIds.PromisedAccuracyRate, promisedAccuracyRate.value],
        [CalculationItemIds.StrongerAgainstNeutral, 100 + statValue('stronger_against_neutral')],
        [CalculationItemIds.StrongerAgainstFire, 100 + statValue('stronger_against_fire') + skillElementExtra.value.fire],
        [CalculationItemIds.StrongerAgainstWater, 100 + statValue('stronger_against_water') + skillElementExtra.value.water],
        [CalculationItemIds.StrongerAgainstEarth, 100 + statValue('stronger_against_earth') + skillElementExtra.value.earth],
        [CalculationItemIds.StrongerAgainstWind, 100 + statValue('stronger_against_wind') + skillElementExtra.value.wind],
        [CalculationItemIds.StrongerAgainstLight, 100 + statValue('stronger_against_light') + skillElementExtra.value.light],
        [CalculationItemIds.StrongerAgainstDark, 100 + statValue('stronger_against_dark') + skillElementExtra.value.dark],

        [CalculationItemIds.CharacterLevel, character.value.level],
        [CalculationItemIds.SkillLevelTwoHanded, getSkillLevel(skillTwoHanded).level],
        [CalculationItemIds.OtherMultiplier,
          (100 + statValue('total_damage_A')) * (100 + statValue('total_damage_B')) / 100,
        ],

        // [CalculationItemIds.SkillRealMpCost, 0],
      ])
    })

    const calculation: Ref<Calculation> = ref(calculationBase.createCalculation(''))

    for (const ctner of calculation.value.containers.values()) {
      ctner.enabled = true
    }

    const valid = computed(() => {
      const constant = container.value.getValue('constant') || '0'
      const multiplier = container.value.getValue('multiplier') || '0'
      return isNumberString(constant) && isNumberString(multiplier)
    })

    const skillProperties = computed<SkillProperties>(() => {
      if (!valid.value) {
        return {
          skillRealMpCost: 0,
          skillConstant: 0,
          skillMultiplier: 0,
        }
      }
      const constant = container.value.getValue('constant') || '0'
      const multiplier = container.value.getValue('multiplier') || '0'
      return {
        skillRealMpCost: 0,
        skillConstant: parseInt(constant, 10),
        skillMultiplier: parseInt(multiplier, 10),
      }
    })

    const baseSuffixBranch = computed(() => container.value.branchItem.suffixBranches.find(suf => suf.is(SkillBranchNames.Base)))

    const varsMap = computed(() => {
      let atkRate = 100
      let matkRate = 100
      const baseBranch = baseSuffixBranch.value
      if (baseBranch) {
        if (baseBranch.hasProp('atk_rate')) {
          atkRate = baseBranch.propNumber('atk_rate')
        }
        if (baseBranch.hasProp('matk_rate')) {
          matkRate = baseBranch.propNumber('matk_rate')
        }
      }

      return new Map<CalculationItemIds, number>([
        [CalculationItemIds.AtkRate, atkRate],
        [CalculationItemIds.MatkRate, matkRate],

        [CalculationItemIds.SkillRealMpCost, skillProperties.value.skillRealMpCost],
        [CalculationItemIds.SkillConstant, skillProperties.value.skillConstant + statValue('skill_constant_extra')],
        [CalculationItemIds.SkillMultiplier, ((skillProperties.value.skillMultiplier + statValue('skill_multiplier_extra')) * (100 + statValue('total_skill_multiplier')) / 100)],

        [CalculationItemIds.TargetPhysicalResistance, targetProperties.value.physicalResistance],
        [CalculationItemIds.TargetMagicResistance, targetProperties.value.magicResistance],
        [CalculationItemIds.TargetLevel, targetProperties.value.level],
        [CalculationItemIds.TargetDef, targetProperties.value.def],
        [CalculationItemIds.TargetMdef, targetProperties.value.mdef],
        [CalculationItemIds.TargetCriticalRateResistance, targetProperties.value.criticalRateResistance],
        [CalculationItemIds.TargetCriticalRateResistanceTotal, targetProperties.value.criticalRateResistanceTotal],
        [CalculationItemIds.TargetDodge, targetProperties.value.dodge],

        [CalculationItemIds.Proration, calculationOptions.value.proration],
        [CalculationItemIds.ComboMultiplier, calculationOptions.value.comboRate],
      ])
    })

    calculation.value.config.getItemValue = (itemId) => {
      return calculationVars.value.get(itemId) ?? varsMap.value.get(itemId) ?? null
    }

    const containerCurrentItemMap = computed(() => {
      let damageType = CalculationItemIds.Physical
      let targetDefType = CalculationItemIds.TargetDef
      let targetResistanceType = CalculationItemIds.TargetPhysicalResistance

      if (container.value.getOrigin('damage_type') === 'magic') {
        damageType = CalculationItemIds.Magic
        targetDefType = CalculationItemIds.TargetMdef
        targetResistanceType = CalculationItemIds.TargetMagicResistance
      }

      const baseBranch = baseSuffixBranch.value
      if (baseBranch) {
        if (baseBranch.hasProp('target_def_type')) {
          if (baseBranch.prop('target_def_type') === 'def') {
            targetDefType = CalculationItemIds.TargetDef
          } else if (baseBranch.prop('target_def_type') === 'mdef') {
            targetDefType = CalculationItemIds.TargetMdef
          }
        }
        if (baseBranch.hasProp('target_resistance_type')) {
          if (baseBranch.prop('target_resistance_type') === 'physical') {
            targetResistanceType = CalculationItemIds.TargetPhysicalResistance
          } else if (baseBranch.prop('target_resistance_type') === 'magic') {
            targetResistanceType = CalculationItemIds.TargetMagicResistance
          }
        }
      }

      let rangeDamage = targetProperties.value.rangeDamage
      if (container.value.getOrigin('range_damage') === 'short') {
        rangeDamage = CalculationItemIds.ShortRangeDamage
      } else if (container.value.getOrigin('range_damage') === 'long') {
        rangeDamage = CalculationItemIds.LongRangeDamage
      }

      const resultMap = new Map([
        [CalculationContainerIds.DamageType, damageType],
        [CalculationContainerIds.TargetDefBase, targetDefType],
        [CalculationContainerIds.TargetResistance, targetResistanceType],
        [CalculationContainerIds.RangeDamage, rangeDamage],
      ])
      if (targetProperties.value.element !== null) {
        resultMap.set(CalculationContainerIds.StrongerAgainstElement, elementsMap[targetProperties.value.element])
      }
      return resultMap
    })

    calculation.value.config.getContainerCurrentItemId = (containerId) => {
      return containerCurrentItemMap.value.get(containerId) ?? null
    }

    const containerForceHiddenMap = computed(() => {
      const unsheatheDamageHidden = !container.value.branchItem.propBoolean('unsheathe_damage')
      const baseNone = container.value.branchItem.prop('base') === 'none'
      const baseOrigin = container.value.getOrigin('base')

      const mainType = character.value?.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType

      return new Map([
        [CalculationContainerIds.BaseAtk, baseNone || baseOrigin === 'matk'],
        [CalculationContainerIds.BaseMatk, baseNone || baseOrigin === 'atk' || baseSuffixBranch.value?.prop('type') === 'dual_sword'],
        [CalculationContainerIds.BaseDualSword, !character.value ||
          baseSuffixBranch.value?.prop('type') !== 'dual_sword' ||
          !character.value.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.OneHandSword) ||
          !character.value.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword),
        ],
        [CalculationContainerIds.StrongerAgainstElement, targetProperties.value.element === null],
        [CalculationContainerIds.UnsheatheAttackConstant, unsheatheDamageHidden],
        [CalculationContainerIds.UnsheatheAttackMultiplier, unsheatheDamageHidden],
        [CalculationContainerIds.RangeDamage, container.value.getOrigin('range_damage') === '0'],
        [CalculationContainerIds.BaseTwoHanded, !getSkillLevel(skillTwoHanded).valid || mainType !== EquipmentTypes.Katana],

        [CalculationContainerIds.ComboMultiplier, !container.value.branchItem.propBoolean('combo_rate')],
      ])
    })

    calculation.value.config.getContainerForceHidden = (containerId) => {
      return containerForceHiddenMap.value.get(containerId) ?? null
    }

    const { expectedResult } = setupCalculationExpectedResult(calculation)

    return {
      calculation,
      valid,
      expectedResult,
      extraStats,
    }
  }

  return {
    setupDamageCalculationExpectedResult,
    getDamageCalculationSkillState: getSkillState,
    getDamageCalculationSkillBranchState: getSkillBranchState,
  }
}

function isValidElement(element: string | EnemyElements): element is EnemyElements {
  const elementsList = [
    EnemyElements.Neutral,
    EnemyElements.Fire,
    EnemyElements.Water,
    EnemyElements.Wind,
    EnemyElements.Earth,
    EnemyElements.Light,
    EnemyElements.Dark,
  ]
  return elementsList.includes(element as EnemyElements)
}

function createElementMap(): Record<EnemyElements, number> {
  return {
    [EnemyElements.Neutral]: 0,
    [EnemyElements.Fire]: 0,
    [EnemyElements.Water]: 0,
    [EnemyElements.Earth]: 0,
    [EnemyElements.Wind]: 0,
    [EnemyElements.Light]: 0,
    [EnemyElements.Dark]: 0,
  }
}

