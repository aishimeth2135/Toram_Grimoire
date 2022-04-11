
import { computed, ComputedRef, reactive, Ref } from 'vue'

import { CalculationItemIds } from '@/lib/Calculation/Damage/Calculation/enums'
import { Stat } from '@/lib/Character/Stat'

import { CharacterStatCategoryResult } from '.'

export default function setupDamageCalculation(statCategoryResults: Ref<CharacterStatCategoryResult[]>, characterPureStats: Ref<Stat[]>) {
  const statResults = computed(() => {
    return statCategoryResults.value.map(category => category.stats).flat()
  })
  const calculationVars: ComputedRef<Record<CalculationItemIds, number>> = computed(() => {
    if (statResults.value.length === 0) {
      return {} as Record<CalculationItemIds, number>
    }

    const targetProperties = reactive({
      physicalResistance: 0,
      magicResistance: 0,
      def: 0,
      mdef: 0,
      level: 0,
      criticalRateResistance: 0,
      criticalRateResistanceTotal: 0,
      dodge: 0,
    })

    const resultValue = (id: string) => statResults.value!.find(result => result.id === id)?.resultValue ?? 0
    const statValue = (statId: string) => characterPureStats.value.find(stat => stat.statId === statId)?.value ?? 0

    return {
      [CalculationItemIds.Atk]: resultValue('atk'),
      [CalculationItemIds.Matk]: resultValue('matk'),
      [CalculationItemIds.SubAtk]: resultValue('sub_atk'),
      [CalculationItemIds.SubStability]: resultValue('sub_stability'),
      [CalculationItemIds.SubStability]: resultValue('sub_stability'),
      [CalculationItemIds.PhysicalPierce]: resultValue('physical_pierce'),
      [CalculationItemIds.MagicPierce]: resultValue('magic_pierce'),
      [CalculationItemIds.UnsheatheAttackConstant]: resultValue('unsheathe_attack'),
      [CalculationItemIds.UnsheatheAttackMultiplier]: resultValue('unsheathe_attack_multiplier'),
      [CalculationItemIds.CriticalDamage]: resultValue('critical_damage'),
      [CalculationItemIds.MagicCriticalDamageConversionRate]: statValue('magic_cd_percentage'),
      [CalculationItemIds.CriticalRate]: resultValue('critical_rate'),
      [CalculationItemIds.MagicCriticalRateConversionRate]: statValue('magic_cr_percentage'),
      [CalculationItemIds.ShortRangeDamage]: resultValue('short_range_damage'),
      [CalculationItemIds.LongRangeDamage]: resultValue('long_range_damage'),
      [CalculationItemIds.Stability]: resultValue('stability'),
      [CalculationItemIds.Accuracy]: statValue('accuracy'),
      [CalculationItemIds.StrongerAgainstNeutral]: resultValue('stronger_against_neutral'),
      [CalculationItemIds.StrongerAgainstFire]: resultValue('stronger_against_fire'),
      [CalculationItemIds.StrongerAgainstWater]: resultValue('stronger_against_water'),
      [CalculationItemIds.StrongerAgainstEarth]: resultValue('stronger_against_earth'),
      [CalculationItemIds.StrongerAgainstWind]: resultValue('stronger_against_wind'),
      [CalculationItemIds.StrongerAgainstLight]: resultValue('stronger_against_light'),
      [CalculationItemIds.StrongerAgainstDark]: resultValue('stronger_against_dark'),

      [CalculationItemIds.SkillLevelTwoHanded]: 0,
      [CalculationItemIds.CharacterLevel]: 0,
      [CalculationItemIds.PromisedAccuracyRate]: 0,
      [CalculationItemIds.SkillLevelLongRange]: 0,
      [CalculationItemIds.SkillRealMpCost]: 0,

      [CalculationItemIds.SkillConstant]: 0,
      [CalculationItemIds.SkillMultiplier]: 0,
      [CalculationItemIds.Proration]: 0,
      [CalculationItemIds.ComboMultiplier]: 0,

      [CalculationItemIds.TargetPhysicalResistance]: targetProperties.physicalResistance,
      [CalculationItemIds.TargetMagicResistance]: targetProperties.magicResistance,
      [CalculationItemIds.TargetLevel]: targetProperties.level,
      [CalculationItemIds.TargetDef]: targetProperties.def,
      [CalculationItemIds.TargetMdef]: targetProperties.mdef,
      [CalculationItemIds.TargetCriticalRateResistance]: targetProperties.criticalRateResistance,
      [CalculationItemIds.TargetCriticalRateResistanceTotal]: targetProperties.criticalRateResistanceTotal,
      [CalculationItemIds.TargetDodge]: targetProperties.dodge,
    } as Record<CalculationItemIds, number>
  })

  return {
    calculationVars,
  }
}
