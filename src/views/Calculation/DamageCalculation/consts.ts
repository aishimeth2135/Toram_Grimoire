import { CalcStructExpression } from '@/lib/Calculation/Damage/Calculation/base'
import { CalculationContainerIds } from '@/lib/Calculation/Damage/Calculation/enums'

export { calcStructCritical, calcStructWithoutCritical } from '@/stores/views/damage-calculation/consts'

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
      CalculationContainerIds.Critical_Accuracy_Stability,
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.UnsheatheAttackMultiplier,
      CalculationContainerIds.StrongerAgainstElement,
      CalculationContainerIds.Proration,
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.SkillLongRange,
      // CalculationContainerIds.Stability,
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}

export { calcStructDisplay }
