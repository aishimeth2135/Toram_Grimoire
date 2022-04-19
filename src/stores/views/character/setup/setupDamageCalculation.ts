
import { computed, ComputedRef, ref, Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'

import { CalculationContainerIds, CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'
import { Stat } from '@/lib/Character/Stat'
import { Character } from '@/lib/Character/Character'
import { Skill } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { EnemyElements } from '@/lib/Enemy/enums'
import { EquipmentFieldTypes } from '@/lib/Character/Character/enums'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { SkillBranchItem, SkillEffectItem } from '@/lib/Skill/SkillComputingContainer'

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/utils/DisplayDataContainer'

import { CharacterStatCategoryResult, SkillResult } from '.'
import { setupCalculationExpectedResult } from '../../damage-calculation/setup'

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
  comboMultiplier: number;
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

export default function setupDamageCalculation(
  character: Ref<Character | null>,
  setupCharacterStatCategoryResultsExtended: (otherStats: Ref<Stat[]>) => {
    categoryResults: ComputedRef<CharacterStatCategoryResult[]>;
    characterPureStats: ComputedRef<Stat[]>;
  },
  getSkillLevel: (skill: Skill) => { valid: boolean; level: number },
) {
  const calculationBase = Grimoire.DamageCalculation.calculationBase

  const skillTwoHanded = Grimoire.Skill.skillRoot.findSkillById('0-6-11')!
  const skillLongRange = Grimoire.Skill.skillRoot.findSkillById('0-1-11')!

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

  const elementsMap: Record<EnemyElements, CalculationItemIds> = {
    [EnemyElements.Neutral]: CalculationItemIds.StrongerAgainstNeutral,
    [EnemyElements.Fire]: CalculationItemIds.StrongerAgainstFire,
    [EnemyElements.Water]: CalculationItemIds.StrongerAgainstWater,
    [EnemyElements.Wind]: CalculationItemIds.StrongerAgainstWind,
    [EnemyElements.Earth]: CalculationItemIds.StrongerAgainstEarth,
    [EnemyElements.Light]: CalculationItemIds.StrongerAgainstLight,
    [EnemyElements.Dark]: CalculationItemIds.StrongerAgainstDark,
  }

  const setupDamageCalculationExpectedResult = (
    skillResult: Ref<SkillResult>,
    basicContainer: Ref<DisplayDataContainer<SkillBranchItem<SkillEffectItem>> | null>,
    extraStats: Ref<Stat[]>,
    targetProperties: Ref<TargetProperties>,
    calculationOptions: Ref<CalculationOptions>,
  ) => {
    const { categoryResults, characterPureStats } = setupCharacterStatCategoryResultsExtended(extraStats)

    const statResults = computed(() => {
      return categoryResults.value.map(category => category.stats).flat()
    })

    const statValue = (baseName: string) => characterPureStats.value.find(stat => stat.baseName === baseName)?.value ?? 0

    const calculationVars = computed(() => {
      if (!character.value) {
        return new Map<CalculationItemIds, number>()
      }

      const resultValue = (id: string) => statResults.value!.find(result => result.id === id)?.resultValue ?? 0

      return new Map<CalculationItemIds, number>([
        [CalculationItemIds.Atk, resultValue('atk')],
        [CalculationItemIds.Matk, resultValue('matk')],
        [CalculationItemIds.SubAtk, resultValue('sub_atk')],
        [CalculationItemIds.SubStability, resultValue('sub_stability')],
        [CalculationItemIds.SubStability, resultValue('sub_stability')],
        [CalculationItemIds.PhysicalPierce, resultValue('physical_pierce')],
        [CalculationItemIds.MagicPierce, resultValue('magic_pierce')],
        [CalculationItemIds.UnsheatheAttackConstant, resultValue('unsheathe_attack')],
        [CalculationItemIds.UnsheatheAttackMultiplier, resultValue('unsheathe_attack_multiplier')],
        [CalculationItemIds.CriticalDamage, resultValue('critical_damage')],
        [CalculationItemIds.MagicCriticalDamageConversionRate, statValue('magic_cd_percentage')],
        [CalculationItemIds.CriticalRate, resultValue('critical_rate')],
        [CalculationItemIds.MagicCriticalRateConversionRate, statValue('magic_cr_percentage')],
        [CalculationItemIds.ShortRangeDamage, resultValue('short_range_damage')],
        [CalculationItemIds.LongRangeDamage, resultValue('long_range_damage')],
        [CalculationItemIds.Stability, resultValue('stability')],
        [CalculationItemIds.Accuracy, statValue('accuracy')],
        [CalculationItemIds.PromisedAccuracyRate, promisedAccuracyRate.value],
        [CalculationItemIds.StrongerAgainstNeutral, resultValue('stronger_against_neutral')],
        [CalculationItemIds.StrongerAgainstFire, resultValue('stronger_against_fire')],
        [CalculationItemIds.StrongerAgainstWater, resultValue('stronger_against_water')],
        [CalculationItemIds.StrongerAgainstEarth, resultValue('stronger_against_earth')],
        [CalculationItemIds.StrongerAgainstWind, resultValue('stronger_against_wind')],
        [CalculationItemIds.StrongerAgainstLight, resultValue('stronger_against_light')],
        [CalculationItemIds.StrongerAgainstDark, resultValue('stronger_against_dark')],

        [CalculationItemIds.CharacterLevel, character.value.level],
        [CalculationItemIds.SkillLevelTwoHanded, getSkillLevel(skillTwoHanded).level],
        [CalculationItemIds.SkillLevelLongRange, getSkillLevel(skillLongRange).level],

        // [CalculationItemIds.SkillRealMpCost, 0],
        // [CalculationItemIds.SkillConstant, 0],
        // [CalculationItemIds.SkillMultiplier, 0],
        // [CalculationItemIds.Proration, 0],
        // [CalculationItemIds.ComboMultiplier, 0],

        // [CalculationItemIds.TargetPhysicalResistance, targetProperties.physicalResistance],
        // [CalculationItemIds.TargetMagicResistance, targetProperties.magicResistance],
        // [CalculationItemIds.TargetLevel, targetProperties.level],
        // [CalculationItemIds.TargetDef, targetProperties.def],
        // [CalculationItemIds.TargetMdef, targetProperties.mdef],
        // [CalculationItemIds.TargetCriticalRateResistance, targetProperties.criticalRateResistance],
        // [CalculationItemIds.TargetCriticalRateResistanceTotal, targetProperties.criticalRateResistanceTotal],
        // [CalculationItemIds.TargetDodge, targetProperties.dodge],
      ])
    })

    const calculation = ref(calculationBase.createCalculation(''))

    const container = computed(() => skillResult.value.container)

    const valid = computed(() => {
      const constant = container.value.getValue('constant') || '0'
      const multiplier = container.value.getValue('multiplier') || '0'
      return isNumberString(constant) && isNumberString(multiplier)
    })

    const skillProperties = computed(() => {
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
      } as SkillProperties
    })

    const baseSuffixBranch = computed(() => container.value.branchItem.suffixBranches.find(suf => suf.checkBranchName(SkillBranchNames.Base)))

    const varsMap = computed(() => {
      let atkRate = 100
      let matkRate = 100
      const baseBranch = baseSuffixBranch.value
      if (baseBranch) {
        if (baseBranch.hasAttr('atk_rate')) {
          atkRate = baseBranch.attrNumber('atk_rate')
        }
        if (baseBranch.hasAttr('matk_rate')) {
          matkRate = baseBranch.attrNumber('matk_rate')
        }
      }

      return new Map<CalculationItemIds, number>([
        [CalculationItemIds.AtkRate, atkRate],
        [CalculationItemIds.MatkRate, matkRate],

        [CalculationItemIds.SkillRealMpCost, skillProperties.value.skillRealMpCost],
        [CalculationItemIds.SkillConstant, skillProperties.value.skillConstant + statValue('skill_constant_extra')],
        [CalculationItemIds.SkillMultiplier, skillProperties.value.skillMultiplier],

        [CalculationItemIds.TargetPhysicalResistance, targetProperties.value.physicalResistance],
        [CalculationItemIds.TargetMagicResistance, targetProperties.value.magicResistance],
        [CalculationItemIds.TargetLevel, targetProperties.value.level],
        [CalculationItemIds.TargetDef, targetProperties.value.def],
        [CalculationItemIds.TargetMdef, targetProperties.value.mdef],
        [CalculationItemIds.TargetCriticalRateResistance, targetProperties.value.criticalRateResistance],
        [CalculationItemIds.TargetCriticalRateResistanceTotal, targetProperties.value.criticalRateResistanceTotal],
        [CalculationItemIds.TargetDodge, targetProperties.value.dodge],

        [CalculationItemIds.Proration, calculationOptions.value.proration],
        [CalculationItemIds.ComboMultiplier, calculationOptions.value.comboMultiplier],
      ])
    })

    calculation.value.config.getItemValue = (itemId) => {
      return calculationVars.value.get(itemId) ?? varsMap.value.get(itemId) ?? null
    }

    const containerCurrentItemBaseEntries = computed(() => {
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
        if (baseBranch.hasAttr('target_def_type')) {
          if (baseBranch.attr('target_def_type') === 'def') {
            targetDefType = CalculationItemIds.TargetDef
          } else if (baseBranch.attr('target_def_type') === 'mdef') {
            targetDefType = CalculationItemIds.TargetMdef
          }
        }
        if (baseBranch.hasAttr('target_resistance_type')) {
          if (baseBranch.attr('target_resistance_type') === 'physical') {
            targetResistanceType = CalculationItemIds.TargetPhysicalResistance
          } else if (baseBranch.attr('target_resistance_type') === 'magic') {
            targetResistanceType = CalculationItemIds.TargetMagicResistance
          }
        }
      }

      return [
        [CalculationContainerIds.DamageType, damageType],
        [CalculationContainerIds.TargetDefBase, targetDefType],
        [CalculationContainerIds.TargetResistance, targetResistanceType],
        [CalculationContainerIds.RangeDamage, targetProperties.value.rangeDamage],
      ] as [CalculationContainerIds, CalculationItemIds][]
    })

    const containerCurrentItemMap = computed(() => {
      const entries = containerCurrentItemBaseEntries.value.slice()
      if (targetProperties.value.element !== null) {
        entries.push([CalculationContainerIds.StrongerAgainstElement, elementsMap[targetProperties.value.element]])
      }
      return new Map(entries)
    })

    calculation.value.config.getContainerCurrentItemId = (containerId) => {
      return containerCurrentItemMap.value.get(containerId) ?? null
    }

    const containerForceHiddenMap = computed(() => {
      const unsheatheDamageHidden = container.value.getOrigin('unsheathe_damage') !== '1'
      const skillRange = basicContainer.value?.getValue('range')
      const baseNone = container.value.branchItem.attr('base') === 'none'

      return new Map([
        [CalculationContainerIds.BaseAtk, baseNone || container.value.getOrigin('base') === 'matk'],
        [CalculationContainerIds.BaseMatk, baseNone || container.value.getOrigin('base') === 'atk'],
        [CalculationContainerIds.BaseDualSword, !character.value
          || !character.value.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.OneHandSword)
          || !character.value.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword),
        ],
        [CalculationContainerIds.StrongerAgainstElement, targetProperties.value.element === null],
        [CalculationContainerIds.UnsheatheAttackConstant, unsheatheDamageHidden],
        [CalculationContainerIds.UnsheatheAttackMultiplier, unsheatheDamageHidden],
        [CalculationContainerIds.RangeDamage, container.value.getOrigin('range_damage') !== '1'],
        [CalculationContainerIds.BaseTwoHanded, !getSkillLevel(skillTwoHanded).valid],
        [CalculationContainerIds.SkillLongRange, !skillRange || !isNumberString(skillRange) || parseFloat(skillRange) < 8],
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
  }
}
