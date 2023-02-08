import { EnchantCategory } from '../base'
import {
  EnchantEquipment,
  EnchantStat,
  EnchantStep,
  EnchantStepStat,
} from '../build'
import { EnchantStepTypes } from '../enums'
import { EnchantDollCategory } from './index'

interface MostUsePotentialStatItemUnused {
  type: 'unused'
  stat: EnchantStat
  value: number
  existedAndNoRate: boolean
}
interface MostUsePotentialStatItemStep {
  type: 'step'
  stat: EnchantStepStat
  value: number
  existedAndNoRate: boolean
}
type MostUsePotentialStatItem =
  | MostUsePotentialStatItemUnused
  | MostUsePotentialStatItemStep

interface EnchantDollEquipmentContainerParams {
  itemCategorys: EnchantCategory[]
  equipment: EnchantEquipment
  positiveStats: EnchantStat[]
  negativeStats: EnchantStat[]
}

export default class EnchantDollEquipmentContainer {
  itemCategorys: EnchantCategory[]
  equipment: EnchantEquipment
  positiveStats: EnchantStat[]
  negativeStats: EnchantStat[]
  virtualStats: EnchantStat[]
  flags: {
    error: null | string
    hasHandleFirstStep: boolean
  }

  /** Othen containers which is clone by this */
  clones: EnchantDollEquipmentContainer[]
  copyFrom: null | EnchantDollEquipmentContainer

  constructor({
    itemCategorys,
    equipment,
    positiveStats,
    negativeStats,
  }: EnchantDollEquipmentContainerParams) {
    this.itemCategorys = itemCategorys
    this.equipment = equipment.clone(itemCategorys)
    this.positiveStats = positiveStats.map(stat => stat.clone())
    this.negativeStats = negativeStats.map(stat => stat.clone())

    this.virtualStats = []

    this.flags = {
      error: null,
      hasHandleFirstStep: false,
    }

    this.clones = []
    this.copyFrom = null
  }

  get cloneId(): string {
    if (!this.copyFrom) {
      return '@'
    }
    return (
      this.copyFrom.cloneId +
      '-' +
      this.copyFrom.clones.indexOf(this).toString()
    )
  }

  findPositiveStat(stat: EnchantStat) {
    return this.positiveStats.find(_stat => _stat.equals(stat))!
  }

  /**
   * 退潛之前，把有倍率的能力先至少都附1，確保退最多的潛力值。
   * 1. 能力格優先保留給負屬，中途隨時確認剩下的格子夠不夠負屬全上，不夠的話就直接中止。
   * 2. 過程中裝備原本的潛力不夠用時，就從負屬裡拿能力去補。
   *   - 如果負屬被拿完了還是不夠用，就直接中止。
   * 3. 過程中確保附正屬的步驟都只有附一個正屬，不附任何其他能力。
   *   - 先確保步驟單純，在「判定step.type要不要轉成TYPE_EACH」和「退潛前最大化利用剩餘潛力」時不會出錯。
   *   - 全部事情做完後才開始將可以合併的step合併、可以把type轉回TYPE_NORMAL的step轉回去。
   */
  beforeFillNegative(): EnchantDollEquipmentContainer[] {
    if (this.equipment.stats().length === 0) {
      const newDollEq = this.clone()
      const res1 = this.handleBeforeFillNegative({
        positivesFilter: 'positive',
      })
      const res2 = newDollEq.handleBeforeFillNegative({
        positivesFilter: 'both',
      })
      return [...res1, newDollEq, ...res2]
    }
    return this.handleBeforeFillNegative({ positivesFilter: 'positive' })
  }

  /**
   * @param param.positivesFilter - positive: 只管正屬有無倍率, both: 同時考慮正屬及負屬來確認正屬有無倍率
   */
  handleBeforeFillNegative({
    positivesFilter = 'positive',
  }: { positivesFilter?: 'positive' | 'both' } = {}) {
    const positives = EnchantDollCategory.classifyStats(this.positiveStats)
    const negatives = EnchantDollCategory.classifyStats(this.negativeStats)

    // 耗潛高的能力擺前面
    positives.forEach(category =>
      category.sortStats('max-cost', { equipment: this.equipment })
    )
    // 最大退潛越高的擺越前面
    negatives.forEach(category => category.sortStats('max-effect'))

    const eq = this.equipment
    const resultEqs: EnchantDollEquipmentContainer[] = []

    // 倍率低的擺後面，補潛力時會被優先取用
    negatives.sort((item1, item2) => item1.stats.length - item2.stats.length)

    const rateBetweenBoth = positives.find(category =>
      negatives.find(ncategory => ncategory.category === category.category)
    )
    // both只用於正屬和負屬有倍率時。如果正屬和負屬之間沒倍率就略過。
    if (positivesFilter === 'both' && !rateBetweenBoth) {
      return []
    }

    // 有倍率的能力。
    const positivesHasRate =
      positivesFilter === 'positive'
        ? positives.filter(category => category.stats.length > 1)
        : positives.filter(
            category =>
              category.stats.length > 1 ||
              negatives.find(
                ncategory => ncategory.category === category.category
              )
          )

    if (positivesHasRate.length === 0) {
      return []
    }

    // 所有能力都有倍率，正常附法可能行不通
    const allPositivesHasRate =
      positivesHasRate.length === positives.length || rateBetweenBoth

    this.refreshCategorys(positives)
    this.refreshCategorys(negatives)

    // 倍率低的擺前面，把耗潛最小化
    positivesHasRate.sort((item1, item2) => {
      const av = item1.stats.length
      const bv = item2.stats.length
      if (av === bv) {
        // 倍率一樣的話，耗潛高的擺前面
        const _av = item1.stats.reduce(
          (cur, stat) =>
            cur + stat.itemBase.getPotential(stat.type, this.equipment),
          0
        )
        const _bv = item2.stats.reduce(
          (cur, stat) =>
            cur + stat.itemBase.getPotential(stat.type, this.equipment),
          0
        )
        return _bv - _av
      }
      return av - bv
    })
    if (eq.steps().length === 0 && allPositivesHasRate) {
      const currentCategory = positivesHasRate[0]
      const pstat = currentCategory.stats[0]
      const newStep = eq.appendStep()
      newStep.appendStat(pstat.itemBase, pstat.type, 1)
      pstat.value -= 1

      {
        const pstatPotentialCost = pstat.itemBase.getPotential(pstat.type, eq)
        const maxv = Math.min(
          Math.floor((eq.originalPotential - 1) / pstatPotentialCost),
          pstat.value + 1
        )
        if (maxv > 1) {
          let newDollEq: EnchantDollEquipmentContainer = this,
            curv = 1
          const newDollEqs = []
          while (curv < maxv) {
            newDollEq = newDollEq.clone()
            const cstep = newDollEq.equipment.firstStep as EnchantStep
            const cstat = cstep.firstStat as EnchantStepStat
            cstat.value += 1
            curv = cstat.value
            ;(
              newDollEq.positiveStats.find(_pstat =>
                _pstat.equals(cstat)
              ) as EnchantStat
            ).value -= 1
            newDollEq.flags.hasHandleFirstStep = true
            newDollEqs.push(newDollEq)
          }
          newDollEqs.forEach(dollEq =>
            resultEqs.push(dollEq, ...dollEq.beforeFillNegative())
          )
          // const newDollEq = this.clone();
          // const cstep = newDollEq.equipment.steps()[0];
          // const cstat = cstep.stats[0];
          // cstat.value = maxv;
          // newDollEq.positiveStats.find(_pstat => _pstat.equals(cstat)).value -= (cstat.value - 1);
          // resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative());
        }
      }

      this.checkMakeUpPotential()

      if (positivesFilter === 'both' && currentCategory.stats.length > 1) {
        // 把一個正屬移到退潛後再附的附法
        const newDollEq = this.clone()
        const fakeStat =
          currentCategory.stats[currentCategory.stats.length - 1].clone()
        newDollEq.virtualStats.push(fakeStat)
        resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative())
      }
      // 倍率為1.2且耗潛為3且在第二順位
      const special = positivesHasRate.find(
        (category, idx) =>
          idx !== 0 &&
          category.stats.length > 2 &&
          category.stats[1].originalPotential === 3
      )
      /**
       * 忽略其他能力，優先把耗潛3的能力往前附在第二個的附法
       * FOR: A8%CD%CDC
       */
      if (special) {
        // 建立副本，去做正常的附法
        const newDollEq = this.clone()

        const originalPositiveStats = this.positiveStats.map(stat =>
          stat.clone()
        )

        special.stats.slice(0, 2).forEach(_pstat => {
          const step = eq.appendStep()
          step.appendStat(_pstat.itemBase, _pstat.type, 1)
          _pstat.value -= 1
          this.checkMakeUpPotential()
        })
        if ((eq.lastStep as EnchantStep).potentialExtraRate > 1.2) {
          // 例外狀況，補潛力導致倍率不正確。還原至原本的狀態
          while (eq.allSteps.length !== 1) {
            eq.allSteps[eq.allSteps.length - 1].remove()
          }
          this.positiveStats = originalPositiveStats
        } else {
          resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative())
        }
      }
    }

    let appendFlag = false
    positivesHasRate.find(category => {
      category.stats.forEach(pstat => {
        if (!this.checkFillNegativeStats() && !appendFlag) {
          /**
           * 表示正屬再上，下次步驟負屬會沒辦法全上。
           * - 建立一個副本保存當前狀態，嘗試「以負屬為優先」。
           * - 原本的裝備嘗試「以正屬為優先，多的負屬拉到最後一個步驟」。
           */
          appendFlag = true
          resultEqs.push(this.clone())
        }
        if (
          eq.hasStat(pstat) ||
          this.virtualStats.find(_stat => _stat.equals(pstat))
        ) {
          // 表示這件裝備這能力已經做過了
          return
        }

        const step = eq.appendStep()
        step.appendStat(pstat.itemBase, pstat.type, 1)
        pstat.value -= 1
        const currentExtraRate = step.potentialExtraRate

        if (
          pstat.originalPotential === 3 &&
          currentExtraRate === 1.2 &&
          step.remainingPotential > 0
        ) {
          /**
           * 遇到耗潛3的能力，且倍率為1.2。
           *  - 嘗試在這裡就把耗潛3的能力先分次附完的附法。
           *  - 建立一個副本去做正常的附法。
           */
          const newDollEq = this.clone()
          newDollEq.checkMakeUpPotential()
          resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative())

          const newStep = eq.appendStep()
          newStep.type = EnchantStepTypes.Each
          const value = Math.min(pstat.value, pstat.potentialConvertThreshold)
          newStep.appendStat(pstat.itemBase, pstat.type, value)
          pstat.value -= value
        }

        this.checkMakeUpPotential()
        return
      })
      return false
    })
    return resultEqs
  }

  clearVirtualStats() {
    this.virtualStats = []
  }

  /**
   * 確認能力數量，確保有足夠的格子退潛
   */
  checkFillNegativeStats(): boolean {
    const cstats = this.equipment.stats()
    const numNegs = cstats.filter(stat =>
      this.negativeStats.find(nstat => nstat.equals(stat))
    ).length
    const negativeStatsLength = this.negativeStats.length
    return cstats.length + negativeStatsLength - numNegs < 7
  }

  /**
   * 在退潛前前置動作時，每次附完一個正屬，確認是否需要補潛力
   */
  checkMakeUpPotential() {
    const eq = this.equipment
    const steps = this.equipment.steps()
    const step = steps[steps.length - 1]
    const negatives = EnchantDollCategory.classifyStats(this.negativeStats)
    this.refreshCategorys(negatives)

    const restore = () => {
      const cstat = step.firstStat as EnchantStepStat
      const pstat = this.positiveStats.find(stat =>
        stat.equals(cstat)
      ) as EnchantStat
      pstat.value += cstat.value
      step.remove()
    }

    // 如果中途潛力不夠，從退潛中拿能力去補。
    if (step.remainingPotential <= 0) {
      const errorFlag = (() => {
        // 如果給予的退潛連補潛力都不夠用，或是已經補到能力格不夠用了
        if (negatives.length === 0) {
          restore()
          return 'base-potential-not-enough'
        }

        // 建一個新的step，來放補潛力用的能力
        const bstep = eq.insertStepBefore(step)

        // 留著還原
        const originalNegativeStats = this.negativeStats.map(stat =>
          stat.clone()
        )
        const restoreNegative = () => {
          this.negativeStats = originalNegativeStats
          bstep.remove()
        }

        // 補到夠為止
        while (step.remainingPotential <= 0) {
          if (negatives.length === 0) {
            restoreNegative()
            restore()
            return 'base-potential-not-enough'
          }
          const ccategory = negatives[negatives.length - 1]
          const nstat = ccategory.stats[0]

          const find = bstep.stat(nstat.itemBase, nstat.type)
          if (find) {
            find.value -= 1
          } else {
            const append = bstep.appendStat(nstat.itemBase, nstat.type, -1)
            if (!append) {
              restoreNegative()
              restore()
              return 'base-potential-not-enough'
            }
          }
          nstat.value += 1
          this.refreshCategorys(negatives)
        }
        return null
      })()
      if (errorFlag) {
        this.flags.error = errorFlag
      }
    }
  }

  /**
   * 確實清除已經拿完的能力，並且要確保不影響到category和stats的拿取順序。
   */
  refreshCategorys(target: EnchantDollCategory[]) {
    const removes: number[] = []
    target.forEach((category, idx) => {
      category.stats = category.stats.filter(stat => stat.value !== 0)
      if (category.stats.length === 0) {
        removes.push(idx)
      }
    })
    // removes必定是由小到大排序，陣列從尾端開始刪就不會影響順序
    while (removes.length !== 0) {
      target.splice(removes.pop()!, 1)
    }
  }

  /**
   * 退潛之前，嘗試最大化利用剩餘的潛。
   */
  mostUseRemainingPotential(): EnchantDollEquipmentContainer[] {
    this.equipment.steps().forEach(step => step.optimizeType(-1))
    return [
      ...this.handleMostUseRemainingPotential(true),
      ...this.handleMostUseRemainingPotential(false),
    ]
  }

  handleMostUseRemainingPotential(
    checkSpecial: boolean
  ): EnchantDollEquipmentContainer[] {
    const resultEqs = []

    const newDollEq = this.clone()
    const originalPotentialList = newDollEq.getMostUsePotentialStatlList()

    if (originalPotentialList.length > 0) {
      const ceq = newDollEq.equipment
      const positiveStats = newDollEq.positiveStats
      const currentStatsMap = newDollEq.equipment.statsMap()
      let special = checkSpecial
        ? originalPotentialList.find(item => {
            const value = currentStatsMap.get(item.stat.statId)?.value ?? 0
            return (
              item.type === 'step' &&
              item.stat.potential === 3 &&
              item.stat.belongStep.potentialExtraRate <= 1.2 &&
              value < item.stat.potentialConvertThreshold
            )
          }) || null
        : null

      // 從最大的開始拿
      let cur = originalPotentialList[originalPotentialList.length - 1]
      const allSteps = ceq.steps()
      const firstStep = allSteps[0]
      const checkStepsRemainingPotential = () =>
        allSteps.every(step => step.remainingPotential > 0)

      while (originalPotentialList.length !== 0) {
        const pstat = positiveStats.find(stat => stat.equals(cur.stat))!
        while (checkStepsRemainingPotential() && pstat.value !== 0) {
          if (cur.type === 'step') {
            cur.stat.value += 1
            pstat.value -= 1
          } else {
            pstat.value -= 1
            cur = {
              stat: firstStep.appendStat(cur.stat.itemBase, cur.stat.type, 1)!,
              type: 'step',
              value: pstat.value,
              existedAndNoRate: cur.existedAndNoRate,
            }
          }
        }
        originalPotentialList.pop()
        const next = originalPotentialList[originalPotentialList.length - 1]
        if (!checkStepsRemainingPotential()) {
          cur.stat.value -= 1
          pstat.value += 1
        }
        if (cur.type === 'step' && cur.stat.value === 0) {
          cur.stat.remove()
        }
        if (special !== null && cur.type === 'step' && cur.stat.value > 1) {
          // potential必定是3
          const POTENTIAL = 3
          const statOriginalValue = cur.stat.value
          let specialFlag = false
          const currentSpecial = special as MostUsePotentialStatItemStep
          while (cur.stat.value !== 0) {
            const lastRemainingPotential = ceq.lastStep!.remainingPotential
            if (
              lastRemainingPotential !== 1 &&
              (lastRemainingPotential - 1) % POTENTIAL === 0
            ) {
              const _pstat = positiveStats.find(stat =>
                stat.equals(currentSpecial.stat)
              ) as EnchantStat
              const maxv = (lastRemainingPotential - 1) / POTENTIAL
              if (
                maxv + special.stat.value <=
                  special.stat.potentialConvertThreshold &&
                maxv <= _pstat.value &&
                maxv * POTENTIAL <
                  currentSpecial.stat.belongStep.remainingPotential
              ) {
                originalPotentialList.splice(
                  originalPotentialList.indexOf(special),
                  1
                )
                pstat.value += statOriginalValue - cur.stat.value
                _pstat.value -= maxv
                special.stat.value += maxv
                specialFlag = true
                break
              }
            }
            cur.stat.value -= 1
          }
          if (!specialFlag) {
            // 復原cur.stat.value
            // cur.stat.value === 0的話一定會進到這
            cur.stat.value = statOriginalValue
          } else {
            // 潛力已經用完，不用繼續做了
            break
          }
        }
        cur = next
        if (special === cur) {
          special = null
        }
      }
      resultEqs.push(newDollEq)
    }
    return resultEqs
  }

  /**
   * 如果前面步驟就有退潛，測試最後步驟是否剩太多潛。
   * FOR: A%CD%CDC的衣服
   */
  checkRemainingPotentialBeforeFillNegative(): void {
    const eq = this.equipment
    const steps = eq.steps()
    const stepPotentials = (
      steps
        .map(step => step.firstStat)
        .filter(stat => stat && stat.value > 0) as EnchantStepStat[]
    )
      .map(stat => stat.potential)
      .filter(potential => potential > 1)
    if (stepPotentials.length === 0) {
      return
    }
    const minPotential = Math.min(...stepPotentials)
    const lastStep = eq.lastStep as EnchantStep
    if (lastStep.remainingPotential > minPotential) {
      const firstNegativeStep = steps.find(
        step => (step.firstStat as EnchantStepStat).value < -1
      )
      if (firstNegativeStep && firstNegativeStep !== lastStep) {
        const nextStep = firstNegativeStep.nextStep as EnchantStep
        const nstat = firstNegativeStep.firstStat as EnchantStepStat
        const pstat = nextStep.firstStat as EnchantStepStat
        if (pstat.value > 1 && nextStep !== lastStep) {
          const lastStepStat = lastStep.firstStat as EnchantStepStat
          const lastStepStatValueOffset = lastStepStat.value - 1
          nstat.value += 1
          lastStepStat.value = 1
          let pv = 0
          while (
            nextStep.remainingPotential < 1 ||
            lastStep.remainingPotential < 1
          ) {
            if (pstat.value === 1) {
              pstat.value += pv
              nstat.value -= 1
              lastStepStat.value += lastStepStatValueOffset
              return
            }
            pstat.value -= 1
            pv += 1
          }
          ;(
            this.positiveStats.find(stat => stat.equals(pstat)) as EnchantStat
          ).value += pv
          ;(
            this.positiveStats.find(stat =>
              stat.equals(lastStepStat)
            ) as EnchantStat
          ).value += lastStepStatValueOffset
          ;(
            this.negativeStats.find(stat => stat.equals(nstat)) as EnchantStat
          ).value -= 1
        }
      }
    }
  }

  /**
   * 確認耗潛1的步驟是否能合併到退潛
   */
  checkMergeStepToFillNegative() {
    const lastStep = this.equipment.lastStep
    if (!lastStep) {
      return []
    }
    const resultEqs: EnchantDollEquipmentContainer[] = []

    const lastStepStat = lastStep.firstStat!
    if (lastStepStat.potential === 1) {
      const previousStep = lastStep.previousStep
      // let flag = false
      if (previousStep) {
        const preStepStat = previousStep.firstStat!
        const prePstat = this.findPositiveStat(preStepStat)
        const lastPstat = this.findPositiveStat(lastStepStat)
        if (prePstat && prePstat.value > 0) {
          const lastStatValueOffset = lastStepStat.value - 1
          lastStepStat.value = 1
          preStepStat.value += 1

          lastPstat.value += lastStatValueOffset
          prePstat.value -= 1

          if (
            previousStep.remainingPotential > 0 &&
            lastStep.remainingPotential === 0
          ) {
            // 複製一份
            // flag = true
            resultEqs.push(this.clone())
          }

          // 還原
          lastStepStat.value += lastStatValueOffset
          lastPstat.value -= lastStatValueOffset
          preStepStat.value -= 1
          prePstat.value += 1
        }
        // /**
        //  * 特別處理。
        //  *
        //  * 舉例：
        //  * 1. ATK6%, CD10 | 2
        //  * 2. CR1 | 1
        //  * 3. (退潛)
        //  *
        //  * 轉換成:
        //  * 1. ATK7%, CD7 | 1
        //  * 2. CR1 | 0
        //  * 3. (退潛)
        //  *
        //  * 步驟2剩潛為0的話，會在checkMergeStepToFillNegative被處理
        //  */
        // const POTENTIAL3_STAT_VALUE = 3
        // if (!flag && preStepStat.potential === 3 && preStepStat.value > POTENTIAL3_STAT_VALUE && previousStep.stats.length > 1) {
        //   // previousStep.stats.length > 1 means previousStep.extraRate === 1
        //   const p10 = previousStep.stats.find(stat => {
        //     if (stat.itemBase.getPotential(stat.type, this.equipment) !== 10) {
        //       return false
        //     }
        //     return this.findPositiveStat(stat).value > 0
        //   })
        //   if (p10) {
        //     const POTENTIAL10_STAT_VALUE = 1
        //     const pstat = this.findPositiveStat(p10)
        //     const lastStatValueOffset = lastStepStat.value - 1
        //     lastStepStat.value = 1
        //     p10.value += POTENTIAL10_STAT_VALUE
        //     preStepStat.value -= POTENTIAL3_STAT_VALUE

        //     lastPstat.value += lastStatValueOffset
        //     prePstat.value += POTENTIAL3_STAT_VALUE
        //     pstat.value -= POTENTIAL10_STAT_VALUE

        //     if (previousStep.remainingPotential > 0 && lastStep.remainingPotential === 0) {
        //       resultEqs.push(this.clone())
        //     }

        //     // 還原
        //     lastStepStat.value += lastStatValueOffset
        //     lastPstat.value -= lastStatValueOffset
        //     preStepStat.value -= 1
        //     prePstat.value += 1
        //     p10.value -= POTENTIAL10_STAT_VALUE
        //     pstat.value += POTENTIAL10_STAT_VALUE
        //   }
        // }
      }
    }
    return resultEqs
  }

  /**
   * 退潛之後，確認有沒有耗潛為1的正屬可以嘗試分次附
   */
  checkStepTypeEach() {
    const resultEqs: EnchantDollEquipmentContainer[] = []
    const finds = this.positiveStats.filter(
      stat => stat.value !== 0 && stat.originalPotential === 1
    )
    if (finds.length !== 0) {
      const handle = (checkPotentialConvertThreshold: boolean) => {
        const newDollEq = this.clone()
        const ceq = newDollEq.equipment
        const noChange = finds.every(find => {
          if (
            this.equipment.stats().length === 7 &&
            !this.equipment.hasStat(find)
          ) {
            return true
          }
          const pstat = newDollEq.positiveStats.find(stat =>
            stat.equals(find)
          ) as EnchantStat
          if (pstat.value > 0) {
            const tstep = ceq.appendStep()
            tstep.type = EnchantStepTypes.Each
            const tstat = tstep.appendStat(
              pstat.itemBase,
              pstat.type,
              0
            ) as EnchantStepStat
            const potentialConvertThreshold = tstat.potentialConvertThreshold
            const preStat = ceq.stat(tstat.itemBase, tstat.type)
            const prev = preStat ? preStat.value : 0
            while (
              (!checkPotentialConvertThreshold ||
                prev + tstat.value < potentialConvertThreshold) &&
              ceq.stepRemainingPotential() > 0 &&
              pstat.value > 0
            ) {
              tstat.value += 1
              pstat.value -= 1
            }
            if (ceq.stepRemainingPotential() <= 0) {
              tstat.value -= 1
              pstat.value += 1
            }
            if (tstat.value === 0) {
              tstep.remove()
            }
          }
          return false
        })
        if (!noChange) {
          resultEqs.push(newDollEq)
        }
      }
      handle(true)
      handle(false)
    }
    return resultEqs
  }

  getMostUsePotentialStatlList(): MostUsePotentialStatItem[] {
    const targetEq = this.equipment
    const positiveStats = this.positiveStats
    /**
     * 1. 先處理有倍率的能力。
     *  - 前面已經確保耗潛高的正屬一定在前面
     */

    const list: MostUsePotentialStatItem[] = targetEq
      .steps()
      .map((step, idx) => {
        const potentialExtraRate = step.potentialExtraRate
        if (step.type !== EnchantStepTypes.Each) {
          if (idx === 0 && this.flags.hasHandleFirstStep) {
            return null
          }
          if (potentialExtraRate !== 1 || step.stats.length !== 1) {
            return null
          }
        }
        const stat = step.firstStat as EnchantStepStat
        if (stat.value !== 1) {
          return null
        }
        const pstat = positiveStats.find(_pstat => _pstat.equals(stat))!
        if (pstat.value === 0) {
          return null
        }
        return {
          type: 'step',
          stat,
          value: stat.potentialCost,
          existedAndNoRate: potentialExtraRate === 1,
        }
      })
      .filter(item => item) as MostUsePotentialStatItemStep[]
    if (list.length === 0) {
      // 表示正屬都沒倍率，就不需要退潛前最大化利用潛力了
      return []
    }
    /**
     * 2. 再處理沒倍率的能力。
     */
    if (this.checkFillNegativeStats()) {
      const positives = EnchantDollCategory.classifyStats(positiveStats)
      const noRatePositiveStats = positives
        .filter(
          category =>
            category.stats.length === 1 && category.stats[0].value !== 0
        )
        .map(category => category.stats[0])
      if (noRatePositiveStats.length !== 0) {
        noRatePositiveStats.sort((item1, item2) => {
          const value1 = item1.originalPotential
          const value2 = item2.originalPotential
          if (value1 === value2) {
            return item2.value - item1.value
          }
          return value1 - value2 // 會從最後面開始拿，大的擺後面
        })
        // if (list[0].value < noRatePositiveStats[0].originalPotential) {
        //   const tstat = noRatePositiveStats[0]
        //   const value = tstat.itemBase.getPotential(tstat.type, targetEq)
        //   list.push({
        //     type: 'unused',
        //     stat: tstat,
        //     value,
        //     existedAndNoRate: false,
        //   })
        // }
        noRatePositiveStats.forEach(tstat => {
          const value = tstat.itemBase.getPotential(tstat.type, targetEq)
          list.push({
            type: 'unused',
            stat: tstat,
            value,
            existedAndNoRate: false,
          })
        })
      }
    }
    /**
     * 從最後開始拿。
     * 1. value大的擺後面。
     * 2. 已經附過而且沒倍率的優先擺最後面。
     */
    return list.sort((item1, item2) => {
      if (item1.existedAndNoRate !== item2.existedAndNoRate) {
        if (item1.existedAndNoRate || item2.existedAndNoRate) {
          const target = item1.existedAndNoRate ? item1 : item2
          // stat as EnchantStepStat if existedAndNoRate is true
          const cstat = target.stat as EnchantStepStat
          const pstat = positiveStats.find(_pstat => _pstat.equals(cstat))!
          if (
            target.value * pstat.value >=
            cstat.belongStep.remainingPotential
          ) {
            return item1.existedAndNoRate ? 1 : -1
          }
        } else {
          return item1.existedAndNoRate ? 1 : -1
        }
      }
      return item1.value - item2.value
    })
  }

  fillNegative() {
    const eq = this.equipment
    const lastStep = eq.lastStep
    let step: EnchantStep
    if (lastStep && lastStep.remainingPotential === 0) {
      lastStep.type = EnchantStepTypes.Normal
      step = lastStep
    } else {
      step = eq.appendStep()
    }
    const boths = EnchantDollCategory.classifyStats([
      ...this.negativeStats,
      ...this.positiveStats,
    ])
    boths.sort((item1, item2) => item2.stats.length - item1.stats.length)
    const nstats: EnchantStat[] = []
    boths.forEach(category =>
      nstats.push(...category.stats.filter(stat => stat.value < 0))
    )
    nstats.forEach(stat => {
      if (
        this.equipment.stats().length === 7 &&
        !this.equipment.hasStat(stat)
      ) {
        return
      }
      step.appendStat(stat.itemBase, stat.type, stat.value)
      stat.value = 0
    })
  }

  finalFill() {
    const step = this.equipment.appendStep()
    this.positiveStats
      .filter(stat => stat.value !== 0)
      .forEach(stat => {
        step.appendStat(stat.itemBase, stat.type, stat.value)
        stat.value = 0
      })
    this.negativeStats
      .filter(stat => stat.value !== 0)
      .forEach(stat => {
        step.appendStat(stat.itemBase, stat.type, stat.value)
        stat.value = 0
      })
  }

  clone() {
    const itemCategorys = this.itemCategorys
    const equipment = this.equipment
    const positiveStats = this.positiveStats
    const negativeStats = this.negativeStats
    const newContainer = new EnchantDollEquipmentContainer({
      itemCategorys,
      equipment,
      positiveStats,
      negativeStats,
    })
    newContainer.virtualStats = this.virtualStats.map(_stat => _stat.clone())

    this.clones.push(newContainer)
    newContainer.copyFrom = this

    return newContainer
  }

  log(errorOnly = false) {
    const steps = this.equipment.steps()
    if (!errorOnly) {
      console.group(`[ ${this.cloneId} ]`)
    } else {
      if (steps.some(step => step.remainingPotential < 1)) {
        console.group(`[ ${this.cloneId} ]`)
      } else {
        console.groupCollapsed(`[ ${this.cloneId} ]`)
      }
    }
    steps.forEach(step => console.log(step.toString()))
    console.log(
      '  [pos] ' + this.positiveStats.map(stat => stat.show()).join('|')
    )
    console.log(
      '  [neg] ' + this.negativeStats.map(stat => stat.show()).join('|')
    )
    console.groupEnd()
  }
}
