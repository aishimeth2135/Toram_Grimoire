import { CalcStructExpression } from '@/lib/Calculation/Damage/Calculation/base'
import { CalculationContainerIds } from '@/lib/Calculation/Damage/Calculation/enums'

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
      CalculationContainerIds.SkillMultiplier,
      CalculationContainerIds.CriticalDamage,
      // CalculationContainerIds.Critical_Accuracy_Stability,
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.UnsheatheAttackMultiplier,
      CalculationContainerIds.StrongerAgainstElement,
      CalculationContainerIds.Proration,
      CalculationContainerIds.ComboMultiplier,
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
      CalculationContainerIds.SkillMultiplier,
      // CalculationContainerIds.CriticalDamage,
      // CalculationContainerIds.Critical_Accuracy_Stability,
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.UnsheatheAttackMultiplier,
      CalculationContainerIds.StrongerAgainstElement,
      CalculationContainerIds.Proration,
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}