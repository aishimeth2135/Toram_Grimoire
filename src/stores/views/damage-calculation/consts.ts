import {
  CalcStructExpression,
  CalculationContainerIds,
} from '@/lib/Damage/DamageCalculation'

export const calcStructCritical: CalcStructExpression = {
  id: 'expected_with_critical',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '*',
        left: {
          operator: '+',
          left: {
            operator: '*',
            left: {
              operator: '+',
              left: CalculationContainerIds.Base,
              right: CalculationContainerIds.BaseDualSword,
            },
            right: CalculationContainerIds.BaseTwoHanded,
          },
          right: CalculationContainerIds.LevelDifference,
        },
        right: CalculationContainerIds.TargetResistance,
      },
      {
        operator: '*',
        left: CalculationContainerIds.TargetDefBase,
        right: CalculationContainerIds.Pierce,
      },
      CalculationContainerIds.SkillConstant,
      CalculationContainerIds.UnsheatheAttackConstant,
      CalculationContainerIds.OtherConstant,
    ],
  },
  right: {
    operator: '***',
    list: [
      CalculationContainerIds.CriticalDamage,
      '@floor',
      CalculationContainerIds.StrongerAgainstElement,
      '@floor',
      CalculationContainerIds.SkillMultiplier,
      '@floor',
      CalculationContainerIds.UnsheatheAttackMultiplier,
      '@floor',
      CalculationContainerIds.Proration,
      '@floor',
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}

export const calcStructWithoutCritical: CalcStructExpression = {
  id: 'expected_without_critical',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '*',
        left: {
          operator: '+++',
          list: [
            CalculationContainerIds.Base,
            CalculationContainerIds.BaseDualSword,
            CalculationContainerIds.LevelDifference,
          ],
        },
        right: CalculationContainerIds.TargetResistance,
      },
      {
        operator: '*',
        left: CalculationContainerIds.TargetDefBase,
        right: CalculationContainerIds.Pierce,
      },
      CalculationContainerIds.SkillConstant,
      CalculationContainerIds.UnsheatheAttackConstant,
      CalculationContainerIds.OtherConstant,
    ],
  },
  right: {
    operator: '***',
    list: [
      // CalculationContainerIds.CriticalDamage,
      // '@floor',
      CalculationContainerIds.StrongerAgainstElement,
      '@floor',
      CalculationContainerIds.SkillMultiplier,
      '@floor',
      CalculationContainerIds.UnsheatheAttackMultiplier,
      '@floor',
      CalculationContainerIds.Proration,
      '@floor',
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}
