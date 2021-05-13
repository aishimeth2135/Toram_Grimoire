import { EnchantStat, EnchantStepStat, EnchantEquipment, EnchantStep } from "../build";
import { EnchantDoll, EnchantDollCategory } from "./index.js";

export default class EnchantDollEquipmentContainer {
  /**
   * @param {object} param
   * @param {EnchantDoll} param.parent
   * @param {EnchantEquipment} param.equipment
   * @param {EnchantStat[]} param.positiveStats
   * @param {EnchantStat[]} param.negativeStats
   */
  constructor({ itemCategorys, equipment, positiveStats, negativeStats }) {
    this.itemCategorys = itemCategorys;
    this.equipment = equipment.copy(itemCategorys);
    this.positiveStats = positiveStats.map(stat => stat.copy());
    this.negativeStats = negativeStats.map(stat => stat.copy());

    this.errorFlag = null;
  }

  /**
   * ==== 退潛之前，把有倍率的能力先至少都附1，確保退最多的潛力值。
   * 1. 能力格優先保留給負屬，中途隨時確認剩下的格子夠不夠負屬全上，不夠的話就直接中止。
   * 2. 過程中裝備原本的潛力不夠用時，就從負屬裡拿能力去補。
   *   - 如果負屬被拿完了還是不夠用，就直接中止。
   * 3. 過程中確保附正屬的步驟都只有附一個正屬，不附任何其他能力。
   *  - 先確保步驟單純，在「判定step.type要不要轉成TYPE_EACH」和「退潛前最大化利用剩餘潛力」時不會出錯。
   *  - 全部事情做完後才開始將可以合併的step合併、可以把type轉回TYPE_NORMAL的step轉回去。
   * @returns {EnchantDollEquipmentContainer[]}
   */
  beforeFillNegative() {
    if (this.equipment.stats.length === 0) {
      const newDollEq = this.copy();
      const res1 = this.handleBeforeFillNegative({ positivesFilter: 'positive' });
      const res2 = newDollEq.handleBeforeFillNegative({ positivesFilter: 'both' });
      return [...res1, ...res2];
    }
    return this.handleBeforeFillNegative({ positivesFilter: 'positive' });
  }

  /**
   * @param {object} param
   * @param {"positive"|"both"} positivesFilter - positive: 只管正屬有無倍率, both: 同時考慮正屬及負屬來確認正屬有無倍率
   * @returns {EnchantDollEquipmentContainer[]}
   */
  handleBeforeFillNegative({ positivesFilter = 'positive' } = {}) {
    const positives = EnchantDollCategory.classifyStats(this.positiveStats);
    let negatives = EnchantDollCategory.classifyStats(this.negativeStats);

    // console.log(this.positiveStats.map(stat => stat.copy()));

    // 耗潛高的能力擺前面
    positives.forEach(category => category.sortStats('max-cost', { equipment: this.equipment }));
    // 最大退潛越高的擺越前面
    negatives.forEach(category => category.sortStats('max-effect'));

    const eq = this.equipment;

    const resultEqs = [];

    // 倍率低的擺後面，補潛力時會被優先取用
    negatives.sort((a, b) => b.stats.length - a.stats.length);

    let errorFlag = null, appendFlag = false;

    // 有倍率的能力。
    const positivesHasRate = positivesFilter === 'positive' ?
      positives.filter(category => category.stats.length > 1) :
      positives.filter(category => category.stats.length > 1 || negatives.find(ncategory => ncategory.category === category.category));

    this.refreshCategorys(positives);
    this.refreshCategorys(negatives);

    positivesHasRate
      // 倍率低的擺前面，把耗潛最小化
      .sort((a, b) => a.stats.length - b.stats.length)
      .find(category => {
        // category.sortStats('max-cost', { equipment: this.equipment });
        category.stats.find(pstat => {
          if (!this.checkFillNegativeStats() && !appendFlag) {
            /**
             * 表示正屬再上，下次步驟負屬會沒辦法全上。
             * - 建立一個副本保存當前狀態，嘗試「以負屬為優先」。
             * - 原本的裝備嘗試「以正屬為優先，多的負屬拉到最後一個步驟」。
             */
            appendFlag = true;
            resultEqs.push(this.copy());
          }
          if (eq.hasStat(pstat)) {
            // 表示這件裝備這能力已經做過了
            return false;
          }

          const step = eq.appendStep();
          step.appendStat(pstat.itemBase, pstat.type, 1);
          pstat.value -= 1;
          const currentExtraRate = step.potentialExtraRate;

          if (step.index === 0 && pstat.originalPotential >= 10) {
            const maxv = Math.min(Math.floor((eq.originalPotential - 1) / pstat.originalPotential), pstat.value + 1);
            // let newDollEq = this, curv = 1;
            // const newDollEqs = [];
            // while (curv < maxv) {
            //   newDollEq = newDollEq.copy();
            //   const cstep = newDollEq.equipment.steps()[0];
            //   const cstat = cstep.stats[0];
            //   cstat.value += 1;
            //   curv = cstat.value;
            //   newDollEq.positiveStats.find(_pstat => _pstat.equals(cstat)).value -= 1;
            //   newDollEqs.push(newDollEq);
            // }
            // newDollEqs.forEach(dollEq => resultEqs.push(dollEq, ...dollEq.beforeFillNegative()));
            const newDollEq = this.copy();
            const cstep = newDollEq.equipment.steps()[0];
            const cstat = cstep.stats[0];
            cstat.value = maxv;
            newDollEq.positiveStats.find(_pstat => _pstat.equals(cstat)).value -= (cstat.value - 1);
            resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative());
          }

          if (pstat.originalPotential === 3 && currentExtraRate === 1.2 && step.remainingPotential > 0)  {
            /**
             * ==== 遇到耗潛3的能力，且倍率為1.2。
             *  - 嘗試在這裡就把耗潛3的能力先分次附完的附法。
             *  - 建立一個副本去做正常的附法。
             */
            const newDollEq = this.copy();
            newDollEq.checkMakeUpPotential();
            resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative());

            const newStep = eq.appendStep();
            newStep.type = EnchantStep.TYPE_EACH;
            newStep.appendStat(pstat.itemBase, pstat.type, pstat.value);
            pstat.value = 0;
          }

          this.checkMakeUpPotential();
          return false;
        });
        if (errorFlag !== null) {
          return true;
        }
        return false;
      });
    if (errorFlag) {
      this.equipment.errorFlag = errorFlag;
    }
    // this.refreshCategorys(positives);
    return resultEqs;
  }

  /**
   * 確認能力數量，確保有足夠的格子退潛
   * @returns {boolean}
   */
   checkFillNegativeStats() {
    const cstats = this.equipment.stats();
    const numNegs = cstats.filter(stat => this.negativeStats.find(nstat => nstat.equals(stat))).length;
    const negativeStatsLength = this.negativeStats.length;
    return cstats.length + negativeStatsLength - numNegs < 7;
  }

  /**
   * 在退潛前前置動作時，每次附完一個正屬，確認是否需要補潛力
   */
  checkMakeUpPotential() {
    const eq = this.equipment;
    const steps = this.equipment.steps();
    const step = steps[steps.length - 1];
    const negatives = EnchantDollCategory.classifyStats(this.negativeStats);
    this.refreshCategorys(negatives);

    const restore = () => {
      const cstat = step.stats[0];
      const pstat = this.positiveStats.find(stat => stat.equals(cstat));
      pstat.value += cstat.value;
      step.remove();
    };

    // 如果中途潛力不夠，從退潛中拿能力去補。
    if (step.remainingPotential <= 0) {
      const errorFlag = (() => {
          // 如果給予的退潛連補潛力都不夠用，或是已經補到能力格不夠用了
        if (negatives.length === 0) {
          restore();
          return 'base-potential-not-enough';
        }

        // 建一個新的step，來放補潛力用的能力
        const bstep = eq.insertStepBefore(step);

        // 留著還原
        const originalNegativeStats = this.negativeStats.map(stat => stat.copy());
        const restoreNegative = () => {
          this.negativeStats = originalNegativeStats;
          bstep.remove();
        };

        // 補到夠為止
        while (step.remainingPotential <= 0) {
          if (negatives.length === 0) {
            restoreNegative();
            restore();
            return 'base-potential-not-enough';
          }
          const ccategory = negatives[negatives.length - 1];
          const nstat = ccategory.stats[0];

          const find = bstep.stat(nstat.itemBase, nstat.type);
          if (find) {
            find.value -= 1;
          } else {
            const append = bstep.appendStat(nstat.itemBase, nstat.type, -1);
            if (!append) {
              restoreNegative();
              restore();
              return 'base-potential-not-enough';
            }
          }
          nstat.value += 1;
          this.refreshCategorys(negatives);
        }
        return null;
      })();
      if (errorFlag) {
        this.errorFlag = errorFlag;
      }
    }
  }

  /**
   * 確實清除已經拿完的能力，並且要確保不影響到category和stats的拿取順序。
   * @param {EnchantDollCategory[]} target
   */
  refreshCategorys(target) {
    const removes = [];
    target.forEach((category, pi) => {
      category.stats = category.stats.filter(stat => stat.value !== 0);
      if (category.stats.length === 0) {
        removes.push(pi);
      }
    });
    // removes必定是由小到大排序，陣列從尾端開始刪就不會影響順序
    while (removes.length !== 0)
      target.splice(removes.pop(), 1);
  }

  /**
   * 退潛之前，嘗試最大化利用剩餘的潛。
   */
  mostUseRemainingPotential() {
    const eq = this.equipment;
    eq.steps().forEach(step => step.optimizeType(-1));

    const resultEqs = [];

    const baseOriginalPotentialList = this.getOriginalPotentialList();

    if (baseOriginalPotentialList.length > 0) {
      /* ==== 嘗試最大利用剩下的潛。 */
      const newDollEq = this.copy();
      const ceq = newDollEq.equipment;
      const originalPotentialList = newDollEq.getOriginalPotentialList();

      const positiveStats = newDollEq.positiveStats;

      // 特殊組合，為了最大化利用潛力。
      // 目前先捨棄，等遇到需要這東西的狀況再說
      // const special = originalPotentialList
      //   .find(p => p.stat.originalPotential === 3 || p.stat.originalPotential === 6);

      // 從最大的開始拿
      let cur = originalPotentialList[originalPotentialList.length - 1];
      const allSteps = ceq.steps();
      const firstStep = allSteps[0];
      const checkStepsRemainingPotential = () => allSteps.every(step => step.remainingPotential > 0);

      while (originalPotentialList.length !== 0) {
        const pstat = positiveStats.find(stat => stat.equals(cur.stat));
        while (checkStepsRemainingPotential() && pstat.value !== 0) {
          if (cur.type === 'step') {
            cur.stat.value += 1;
            pstat.value -= 1;
          } else {
            cur.stat = firstStep.appendStat(cur.stat.itemBase, cur.stat.type, 1);
            cur.type = 'step';
            pstat.value -= 1;
          }
        }
        if (!checkStepsRemainingPotential()) {
          cur.stat.value -= 1;
          pstat.value += 1;
        }
        if (cur.stat.value === 0) {
          cur.stat.remove();
        }
        originalPotentialList.pop();
        cur = originalPotentialList[originalPotentialList.length - 1];
      }
      resultEqs.push(newDollEq);
    }
    return resultEqs;
  }

  /**
   * 退潛之後，確認有沒有耗潛為1的正屬可以嘗試分次附
   */
  checkStepTypeEach() {
    const finds = this.positiveStats.filter(stat => stat.value !== 0 && stat.originalPotential === 1);
    if (finds.length !== 0) {
      const newDollEq = this.copy();
      const ceq = newDollEq.equipment;
      finds.forEach(find => {
        if (this.equipment.stats().length === 7 && !this.equipment.hasStat(find)) {
          return [];
        }
        const pstat = newDollEq.positiveStats.find(stat => stat.equals(find));
        if (pstat.value > 0) {
          const tstep = ceq.appendStep();
          tstep.type = EnchantStep.TYPE_EACH;
          const tstat = tstep.appendStat(pstat.itemBase, pstat.type, 0);
          while (ceq.stepRemainingPotential() > 0 && pstat.value > 0) {
            tstat.value += 1;
            pstat.value -= 1;
          }
          if (ceq.stepRemainingPotential() <= 0) {
            tstat.value -= 1;
            pstat.value += 1;
          }
          if (tstat.value === 0) {
            tstep.remove();
          }
        }
      });
      return [newDollEq];
    }
    return [];
  }
  getOriginalPotentialList() {
    const targetEq = this.equipment;
    const positiveStats = this.positiveStats;
    /**
     * 1. 先處理有倍率的能力。
     *  - 前面已經確保耗潛高的正屬一定在前面
     */
    /** @type {{ type: "step"|"unused", stat: EnchantStepStat|EnchantStat, value: number }[]} */
    const list = targetEq.steps()
      .filter(step=> {
        if (step.type !== EnchantStep.TYPE_EACH) {
          return false;
        }
        const stat = step.stats[0];
        if (stat.value !== 1) {
          return false;
        }
        const pstat = positiveStats.find(_pstat => _pstat.equals(stat));
        return pstat.value !== 0;
      })
      .map(step => {
        const stat = step.stats[0];
        return {
          type: 'step',
          stat,
          value: stat.potentialCost
        };
      });
    if (list.length === 0) {
      // 表示正屬都沒倍率，就不需要退潛前最大化利用潛力了
      return [];
    }
    /**
     * 2. 再處理沒倍率的能力。
     */
    if (targetEq.stats().length !== 7) {
      const positives = EnchantDollCategory.classifyStats(positiveStats);
      const noRatePositiveStats = positives
        .filter(category => category.stats.length === 1 && category.stats[0].value !== 0)
        .map(category => category.stats[0]);
      if (noRatePositiveStats.length !== 0) {
        noRatePositiveStats.sort((a, b) => b.originalPotential - a.originalPotential); // 大的擺前面
        if (list[0].value < noRatePositiveStats[0].originalPotential) {
          const tstat = noRatePositiveStats[0];
          const value = tstat.itemBase.getPotential(tstat.type, targetEq);
          // if (value)
          list.push({
            type: 'unused',
            stat: tstat,
            value
          })
        }
      }
    }
    return list.sort((a, b) => a.value - b.value); // 小的擺前面
  }

  fillNegative() {
    const step = this.equipment.appendStep();
    this.negativeStats.filter(stat => stat.value !== 0).find(stat => {
      if (this.equipment.stats().length === 7) {
        return true; // break
      }
      step.appendStat(stat.itemBase, stat.type, stat.value);
      stat.value = 0;
      return false;
    });
  }

  finalFill() {
    const step = this.equipment.appendStep();
    this.positiveStats.filter(stat => stat.value !== 0).forEach(stat => {
      step.appendStat(stat.itemBase, stat.type, stat.value);
      stat.value = 0;
    });
    this.negativeStats.filter(stat => stat.value !== 0).forEach(stat => {
      step.appendStat(stat.itemBase, stat.type, stat.value);
      stat.value = 0;
    });
  }

  copy() {
    const itemCategorys = this.itemCategorys;
    const equipment = this.equipment;
    const positiveStats = this.positiveStats;
    const negativeStats = this.negativeStats;
    return new EnchantDollEquipmentContainer({ itemCategorys, equipment, positiveStats, negativeStats });
  }
}