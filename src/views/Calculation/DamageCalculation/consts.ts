import { CalcStructExpression } from '@/lib/Calculation/Damage/Calculation/base'
import { CalculationContainerIds } from '@/lib/Calculation/Damage/Calculation/enums'

const calcStructCritical: CalcStructExpression = {
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
              left: CalculationContainerIds.AtkBase,
              right: CalculationContainerIds.AtkDualSword,
            },
            right: CalculationContainerIds.AtkTwoHanded,
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
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.UnsheatheAttackMultiplier,
      CalculationContainerIds.StrongerAgainstElement,
      CalculationContainerIds.Proration,
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.SkillLongRange,
      // 'stability',
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}

const calcStructWithoutCritical: CalcStructExpression = {
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
            CalculationContainerIds.AtkBase,
            CalculationContainerIds.AtkDualSword,
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
      // 'critical/critical_damage',
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.UnsheatheAttackMultiplier,
      CalculationContainerIds.StrongerAgainstElement,
      CalculationContainerIds.Proration,
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.SkillLongRange,
      // 'stability',
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}

const calcStructDisplay: CalcStructExpression = {
  id: 'display',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '*',
        left: {
          operator: '+++',
          list: [
            CalculationContainerIds.AtkBase,
            CalculationContainerIds.AtkDualSword,
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
      CalculationContainerIds.Critical,
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.UnsheatheAttackMultiplier,
      CalculationContainerIds.StrongerAgainstElement,
      CalculationContainerIds.Proration,
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.SkillLongRange,
      CalculationContainerIds.Stability,
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}

export { calcStructDisplay, calcStructCritical, calcStructWithoutCritical }
