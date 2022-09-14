import { CalcStructExpression } from '@/lib/Calculation/Damage/Calculation/base'
import { CalculationContainerIds } from '@/lib/Calculation/Damage/Calculation/enums'

export { calcStructCritical as calcStructDisplayCritical } from '@/stores/views/damage-calculation/consts'

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
      CalculationContainerIds.Critical_Accuracy_Stability,
      CalculationContainerIds.StrongerAgainstElement,
      CalculationContainerIds.SkillMultiplier,
      CalculationContainerIds.UnsheatheAttackMultiplier,
      CalculationContainerIds.Proration,
      CalculationContainerIds.ComboMultiplier,
      CalculationContainerIds.RangeDamage,
      CalculationContainerIds.OtherMultiplier,
    ],
  },
}

export { calcStructDisplay }
