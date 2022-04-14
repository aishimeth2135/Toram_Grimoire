
import { computed, ref, Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'
import { Stat } from '@/lib/Character/Stat'
import { Character } from '@/lib/Character/Character'
import { Skill } from '@/lib/Skill/Skill'

import { CharacterStatCategoryResult } from '.'
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

  const setupDamageCalculationExpectedResult = (
    vars: Ref<SkillProperties>,
    targetProperties: Ref<TargetProperties>,
    calculationOptions: Ref<CalculationOptions>,
  ) => {
    const calculation = ref(calculationBase.createCalculation(''))

    const varsMap = computed(() => {
      return new Map<CalculationItemIds, number>([
        [CalculationItemIds.SkillRealMpCost, vars.value.skillRealMpCost],
        [CalculationItemIds.SkillConstant, vars.value.skillConstant],
        [CalculationItemIds.SkillMultiplier, vars.value.skillMultiplier],

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

    const { expectedResult } = setupCalculationExpectedResult(calculation)
    return {
      expectedResult,
    }
  }

  return {
    setupDamageCalculationExpectedResult,
  }
}
