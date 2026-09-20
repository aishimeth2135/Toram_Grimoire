import {
  type CalcResultOptions,
  type CalcStructExpression,
  type CalculationBase,
  type CalculationEvaluationResult,
  type CalculationSnapshot,
  type CalculationSnapshotOverrides,
  type CalculationSweepDimension,
  type CalculationSweepIssue,
  type CalculationSweepPoint,
} from './CalculationBase'
import { CalculationContainerIds, CalculationItemIds } from './enums'

export interface CalculationExpectedResult {
  readonly baseResultCritical: number
  readonly baseResultWithoutCritical: number
  readonly expectedResult: number
  readonly criticalEvaluation: CalculationEvaluationResult
  readonly nonCriticalEvaluation: CalculationEvaluationResult
}

export interface CalculationExpectedSweepResult {
  readonly points: readonly CalculationSweepPoint<CalculationExpectedResult>[]
  readonly issues: readonly CalculationSweepIssue[]
}

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

export function evaluateCalculationExpectedResult(
  calculationBase: CalculationBase,
  snapshot: CalculationSnapshot,
  calculationOptions?: CalcResultOptions,
  overrides: CalculationSnapshotOverrides = {}
): CalculationExpectedResult {
  const getItemValue = (itemId: CalculationItemIds) =>
    overrides.itemValues?.get(itemId) ?? snapshot.itemValues.get(itemId) ?? 0
  const evaluateContainer = (containerId: CalculationContainerIds) => {
    const result = calculationBase.evaluate(snapshot, containerId, calculationOptions, overrides)
    return result.containerResults.get(containerId) ?? 0
  }

  const stability = getItemValue(CalculationItemIds.Stability)
  const stabilityExpected = evaluateContainer(CalculationContainerIds.Stability)
  const criticalRate = evaluateContainer(CalculationContainerIds.CriticalRate)
  const accuracy = evaluateContainer(CalculationContainerIds.Accuracy)
  const promisedAccuracyRate = getItemValue(CalculationItemIds.PromisedAccuracyRate)
  const grazeStability = Math.floor(stability / 2)

  const criticalEvaluation = calculationBase.evaluate(
    snapshot,
    calcStructCritical,
    calculationOptions,
    overrides
  )
  const criticalAccuracyExpected =
    stabilityExpected * accuracy + ((grazeStability + 100) / 2) * (100 - accuracy)
  const criticalRateMultiplier = (criticalAccuracyExpected * criticalRate) / 1000000

  const nonCriticalEvaluation = calculationBase.evaluate(
    snapshot,
    calcStructWithoutCritical,
    calculationOptions,
    overrides
  )
  const nonCriticalAccuracyExpected =
    stabilityExpected * accuracy +
    ((grazeStability + 100) / 2) * Math.max(0, promisedAccuracyRate - accuracy)
  const nonCriticalRateMultiplier = (nonCriticalAccuracyExpected * (100 - criticalRate)) / 1000000

  return {
    baseResultCritical: criticalEvaluation.value,
    baseResultWithoutCritical: nonCriticalEvaluation.value,
    expectedResult: Math.floor(
      criticalEvaluation.value * criticalRateMultiplier +
        nonCriticalEvaluation.value * nonCriticalRateMultiplier
    ),
    criticalEvaluation,
    nonCriticalEvaluation,
  }
}

export function evaluateCalculationExpectedResultZipSweep(
  calculationBase: CalculationBase,
  snapshot: CalculationSnapshot,
  dimensions: readonly CalculationSweepDimension[],
  calculationOptions?: CalcResultOptions
): CalculationExpectedSweepResult {
  const scenarios = calculationBase.createZipSweepScenarios(dimensions)
  return {
    issues: scenarios.issues,
    points: scenarios.points.map(point => ({
      index: point.index,
      dimensions: point.dimensions,
      result: evaluateCalculationExpectedResult(
        calculationBase,
        snapshot,
        calculationOptions,
        point.overrides
      ),
    })),
  }
}
