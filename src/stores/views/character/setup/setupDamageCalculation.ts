
import { computed, ref, Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'

import { CalculationContainerIds, CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'
import { Stat } from '@/lib/Character/Stat'
import { Character } from '@/lib/Character/Character'
import { Skill } from '@/lib/Skill/Skill'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { EnemyElements } from '@/lib/Enemy/enums'

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
}

export interface CalculationOptions {
  proration: number;
  comboMultiplier: number;
}

export default function setupDamageCalculation(
  character: Ref<Character | null>,
  statCategoryResults: Ref<CharacterStatCategoryResult[]>,
  characterPureStats: Ref<Stat[]>,
  getSkillLevel: (skill: Skill) => number,
) {
  const calculationBase = Grimoire.DamageCalculation.calculationBase

  const skillTwoHanded = Grimoire.Skill.skillRoot.findSkillById('0-6-11')!
  const skillLongRange = Grimoire.Skill.skillRoot.findSkillById('0-1-11')!

  const statResults = computed(() => {
    return statCategoryResults.value.map(category => category.stats).flat()
  })
  const calculationVars = computed(() => {
    if (!character.value) {
      return new Map<CalculationItemIds, number>()
    }

    const resultValue = (id: string) => statResults.value!.find(result => result.id === id)?.resultValue ?? 0
    const statValue = (statId: string) => characterPureStats.value.find(stat => stat.statId === statId)?.value ?? 0

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
      [CalculationItemIds.StrongerAgainstNeutral, resultValue('stronger_against_neutral')],
      [CalculationItemIds.StrongerAgainstFire, resultValue('stronger_against_fire')],
      [CalculationItemIds.StrongerAgainstWater, resultValue('stronger_against_water')],
      [CalculationItemIds.StrongerAgainstEarth, resultValue('stronger_against_earth')],
      [CalculationItemIds.StrongerAgainstWind, resultValue('stronger_against_wind')],
      [CalculationItemIds.StrongerAgainstLight, resultValue('stronger_against_light')],
      [CalculationItemIds.StrongerAgainstDark, resultValue('stronger_against_dark')],

      [CalculationItemIds.CharacterLevel, character.value.level],
      [CalculationItemIds.PromisedAccuracyRate, 0],
      [CalculationItemIds.SkillLevelTwoHanded, getSkillLevel(skillTwoHanded)],
      [CalculationItemIds.SkillLevelLongRange, getSkillLevel(skillLongRange)],

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
    targetProperties: Ref<TargetProperties>,
    calculationOptions: Ref<CalculationOptions>,
  ) => {
    const calculation = ref(calculationBase.createCalculation(''))

    const container = computed(() => skillResult.value.container)

    const valid = computed(() => {
      const constant = container.value.getValue('constant')
      const multiplier = container.value.getValue('multiplier')
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
      const constant = container.value.getValue('constant')
      const multiplier = container.value.getValue('multiplier')
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
        [CalculationItemIds.SkillConstant, skillProperties.value.skillConstant],
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
      let damageType = CalculationItemIds.SpecialBase
      let targetDefType = CalculationItemIds.TargetDef
      let targetResistanceType = CalculationItemIds.TargetPhysicalResistance

      const attrBase = container.value.getOrigin('base')
      if (attrBase === 'atk') {
        damageType = CalculationItemIds.Physical
      }
      if (attrBase === 'matk') {
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
        [CalculationContainerIds.BaseType, damageType],
        [CalculationContainerIds.TargetDefBase, targetDefType],
        [CalculationContainerIds.TargetResistance, targetResistanceType],
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

    calculation.value.config.getContainerForceHidden = (containerId) => {
      if (containerId === CalculationContainerIds.StrongerAgainstElement) {
        return targetProperties.value.element === null
      }
      if (containerId === CalculationContainerIds.UnsheatheAttackConstant
        || containerId === CalculationContainerIds.UnsheatheAttackMultiplier) {
        return container.value.getOrigin('unsheathe_damage') !== '1'
      }
      if (containerId === CalculationContainerIds.RangeDamage) {
        return container.value.getOrigin('range_damage') !== '1'
      }
      return null
    }

    const { expectedResult } = setupCalculationExpectedResult(calculation)
    return {
      calculation,
      valid,
      expectedResult,
    }
  }

  return {
    setupDamageCalculationExpectedResult,
  }
}
