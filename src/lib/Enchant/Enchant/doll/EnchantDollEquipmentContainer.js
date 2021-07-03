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

    this.virtualStats = [];

    this.flags = {
      error: null
    };

    /** @type {EnchantDollEquipmentContainer[]} */
    this.clones = [];

    /** @type {EnchantDollEquipmentContainer} */
    this.copyFrom = null;
  }

  get cloneId() {
    if (!this.copyFrom) {
      return '@';
    }
    return this.copyFrom.cloneId + '-' + this.copyFrom.clones.indexOf(this).toString();
  }

  /**
   * 退潛之前，把有倍率的能力先至少都附1，確保退最多的潛力值。
   * 1. 能力格優先保留給負屬，中途隨時確認剩下的格子夠不夠負屬全上，不夠的話就直接中止。
   * 2. 過程中裝備原本的潛力不夠用時，就從負屬裡拿能力去補。
   *   - 如果負屬被拿完了還是不夠用，就直接中止。
   * 3. 過程中確保附正屬的步驟都只有附一個正屬，不附任何其他能力。
   *   - 先確保步驟單純，在「判定step.type要不要轉成TYPE_EACH」和「退潛前最大化利用剩餘潛力」時不會出錯。
   *   - 全部事情做完後才開始將可以合併的step合併、可以把type轉回TYPE_NORMAL的step轉回去。
   * @param {object} param
   * @returns {EnchantDollEquipmentContainer[]}
   */
  beforeFillNegative() {
    if (this.equipment.stats().length === 0) {
      const newDollEq = this.copy();
      const res1 = this.handleBeforeFillNegative({ positivesFilter: 'positive' });
      const res2 = newDollEq.handleBeforeFillNegative({ positivesFilter: 'both' });
      return [...res1, newDollEq, ...res2];
    }
    return this.handleBeforeFillNegative({ positivesFilter: 'positive' });
  }

  /**
   * @param {object} param
   * @param {"positive"|"both"} param.positivesFilter - positive: 只管正屬有無倍率, both: 同時考慮正屬及負屬來確認正屬有無倍率
   * @returns {EnchantDollEquipmentContainer[]}
   */
  handleBeforeFillNegative({ positivesFilter = 'positive' } = {}) {
    const positives = EnchantDollCategory.classifyStats(this.positiveStats);
    let negatives = EnchantDollCategory.classifyStats(this.negativeStats);

    // 耗潛高的能力擺前面
    positives.forEach(category => category.sortStats('max-cost', { equipment: this.equipment }));
    // 最大退潛越高的擺越前面
    negatives.forEach(category => category.sortStats('max-effect'));

    const eq = this.equipment;
    const resultEqs = [];

    // 倍率低的擺後面，補潛力時會被優先取用
    negatives.sort((a, b) => b.stats.length - a.stats.length);

    const rateBetweenBoth = positives.find(category => negatives.find(ncategory => ncategory.category === category.category));
    // both只用於正屬和負屬有倍率時。如果正屬和負屬之間沒倍率就略過。
    if (positivesFilter === 'both' && !rateBetweenBoth) {
      return [];
    }

    // 有倍率的能力。
    const positivesHasRate = positivesFilter === 'positive' ?
      positives.filter(category => category.stats.length > 1) :
      positives.filter(category => category.stats.length > 1 || negatives.find(ncategory => ncategory.category === category.category));

    if (positivesHasRate.length === 0) {
      return [];
    }

    // 所有能力都有倍率，正常附法可能行不通
    const allPositivesHasRate = positivesHasRate.length === positives.length || rateBetweenBoth;

    this.refreshCategorys(positives);
    this.refreshCategorys(negatives);

    // 倍率低的擺前面，把耗潛最小化
    positivesHasRate.sort((a, b) => {
      const av = a.stats.length;
      const bv = b.stats.length;
      if (av === bv) {
        // 倍率一樣的話，耗潛高的擺前面
        const _av = a.stats.reduce((cur, stat) => cur + stat.itemBase.getPotential(stat.type, this.equipment), 0);
        const _bv = b.stats.reduce((cur, stat) => cur + stat.itemBase.getPotential(stat.type, this.equipment), 0);
        return _bv - _av;
      }
      return av - bv;
    });
    if (eq.steps().length === 0 && allPositivesHasRate) {
      const currentCategory = positivesHasRate[0];
      const pstat = currentCategory.stats[0];
      const step = eq.appendStep();
      step.appendStat(pstat.itemBase, pstat.type, 1);
      pstat.value -= 1;

      {
        const pstatPotentialCost = pstat.itemBase.getPotential(pstat.type, eq);
        const maxv = Math.min(Math.floor((eq.originalPotential - 1) / pstatPotentialCost), pstat.value + 1);
        if (maxv > 1) {
          let newDollEq = this, curv = 1;
          const newDollEqs = [];
          while (curv < maxv) {
            newDollEq = newDollEq.copy();
            const cstep = newDollEq.equipment.steps()[0];
            const cstat = cstep.firstStat;
            cstat.value += 1;
            curv = cstat.value;
            newDollEq.positiveStats.find(_pstat => _pstat.equals(cstat)).value -= 1;
            newDollEqs.push(newDollEq);
          }
          newDollEqs.forEach(dollEq => resultEqs.push(dollEq, ...dollEq.beforeFillNegative()));
          // const newDollEq = this.copy();
          // const cstep = newDollEq.equipment.steps()[0];
          // const cstat = cstep.stats[0];
          // cstat.value = maxv;
          // newDollEq.positiveStats.find(_pstat => _pstat.equals(cstat)).value -= (cstat.value - 1);
          // resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative());
        }
      }

      this.checkMakeUpPotential();

      if (positivesFilter === 'both' && currentCategory.stats.length > 1) {
          // 把一個正屬移到退潛後再附的附法
          const newDollEq = this.copy();
          const fakeStat = currentCategory.stats[currentCategory.stats.length - 1].copy();
          newDollEq.virtualStats.push(fakeStat);
          resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative());
      }
      // 倍率為1.2且耗潛為3且在第二順位
      const special = positivesHasRate
        .find((category, i) => i !== 0 && category.stats.length > 2 && category.stats[1].originalPotential === 3);
      /**
       * 忽略其他能力，優先把耗潛3的能力往前附在第二個的附法
       */
      if (special) {
        // 建立副本，去做正常的附法
        const newDollEq = this.copy();

        const originalPositiveStats = this.positiveStats.map(stat => stat.copy());

        special.stats.slice(0, 2).forEach(_pstat => {
          const step = eq.appendStep();
          step.appendStat(_pstat.itemBase, _pstat.type, 1);
          _pstat.value -= 1;
          this.checkMakeUpPotential();
        });
        if (eq.lastStep.potentialExtraRate > 1.2) {
          // 例外狀況，補潛力導致倍率不正確。還原至原本的狀態
          while (eq.allSteps.length !== 1) {
            eq.allSteps[eq.allSteps.length - 1].remove();
          }
          this.positiveStats = originalPositiveStats;
        } else {
          resultEqs.push(newDollEq, ...newDollEq.beforeFillNegative());
        }
      }
    }


    let errorFlag = null, appendFlag = false;
    positivesHasRate
      .find(category => {
        category.stats.forEach(pstat => {
          if (!this.checkFillNegativeStats() && !appendFlag) {
            /**
             * 表示正屬再上，下次步驟負屬會沒辦法全上。
             * - 建立一個副本保存當前狀態，嘗試「以負屬為優先」。
             * - 原本的裝備嘗試「以正屬為優先，多的負屬拉到最後一個步驟」。
             */
            appendFlag = true;
            resultEqs.push(this.copy());
          }
          if (eq.hasStat(pstat) || this.virtualStats.find(_stat => _stat.equals(pstat))) {
            // 表示這件裝備這能力已經做過了
            return;
          }

          const step = eq.appendStep();
          step.appendStat(pstat.itemBase, pstat.type, 1);
          pstat.value -= 1;
          const currentExtraRate = step.potentialExtraRate;

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
          return;
        });
        if (errorFlag !== null) {
          return true;
        }
        return false;
      });
    if (errorFlag) {
      this.equipment.flags.error = errorFlag;
    }
    return resultEqs;
  }

  clearVirtualStats() {
    this.virtualStats = [];
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
      const cstat = step.firstStat;
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
        this.flags.error = errorFlag;
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
   * @returns {EnchantDollEquipmentContainer[]}
   */
  mostUseRemainingPotential() {
    this.equipment.steps().forEach(step => step.optimizeType(-1));
    return this.handleMostUseRemainingPotential();
  }

  /**
   * @returns {EnchantDollEquipmentContainer[]}
   */
  handleMostUseRemainingPotential() {
    const resultEqs = [];

    const newDollEq = this.copy();
    const originalPotentialList = newDollEq.getMostUsePotentialStatlList();

    if (originalPotentialList.length > 0) {
      const ceq = newDollEq.equipment;
      const positiveStats = newDollEq.positiveStats;
      let special = originalPotentialList
        .find(p => p.type === 'step' && p.stat.potential === 3 && p.stat.belongStep.potentialExtraRate <= 1.2);

      // 從最大的開始拿
      let cur = originalPotentialList[originalPotentialList.length - 1];
      const allSteps = ceq.steps();
      const firstStep = allSteps[0];
      const checkStepsRemainingPotential = () => allSteps.every(step => step.remainingPotential > 0);

      while (originalPotentialList.length !== 0) {
        const pstat = positiveStats.find(stat => stat.equals(cur.stat));
        while (checkStepsRemainingPotential() && pstat.value !== 0) {
          // if (special && cur.type === 'step') {
          //   // potential必定是3
          //   const POTENTIAL = 3;
          //   const lcm = getLcm(cur.stat.potential, POTENTIAL);
          //   const lastRemainingPotential = ceq.lastStep.remainingPotential;
          //   if (lastRemainingPotential < lcm + 1) {
          //     if ((lastRemainingPotential - 1) % POTENTIAL === 0 || lastRemainingPotential % POTENTIAL === 0) {
          //       const _pstat = positiveStats.find(stat => stat.equals(special.stat));
          //       if (Math.floor(lastRemainingPotential / POTENTIAL) <= _pstat.value) {
          //         // 把目前的拿掉，special移到最後面，並重新指定cur和pstat
          //         originalPotentialList.pop();
          //         originalPotentialList.splice(originalPotentialList.indexOf(special), 1);
          //         originalPotentialList.push(special);
          //         cur = special;
          //         pstat = _pstat;
          //       }
          //     }
          //   }
          // }
          if (cur.type === 'step') {
            cur.stat.value += 1;
            pstat.value -= 1;
          } else {
            cur.stat = firstStep.appendStat(cur.stat.itemBase, cur.stat.type, 1);
            cur.type = 'step';
            pstat.value -= 1;
          }
        }
        originalPotentialList.pop();
        const next = originalPotentialList[originalPotentialList.length - 1];
        if (!checkStepsRemainingPotential()) {
          // if (next) {
          //   /**
          //    * 看看耗潛1的步驟能不能合併到退潛
          //    * 能合併的話，下個步驟剩潛剛好是0。
          //    * 退潛那邊會判定剩潛為0就把退潛合到該步驟裡，而非新建步驟。
          //    */
          //   /** @type {EnchantStep} */
          //   const nextStep = next.stat.belongStep;
          //   const checkStepMergeToFillNegative = next.stat.potential === 1
          //     && allSteps.every((step, i) => step.remainingPotential > 0
          //       || (i === allSteps.length - 1 && nextStep === step && step.remainingPotential === 0));
          //   if (checkStepMergeToFillNegative) {
          //     // 保存剩潛為0的狀態
          //     resultEqs.push(newDollEq.copy());
          //   }
          // }
          cur.stat.value -= 1;
          pstat.value += 1;
        }
        if (cur.stat.value === 0) {
          cur.stat.remove();
        } else if (special && cur.type === 'step') {
          // potential必定是3
          const POTENTIAL = 3;
          const statOriginalValue = cur.stat.value;
          let specialFlag = false;
          while (cur.stat.value !== 1) {
            const lastRemainingPotential = ceq.lastStep.remainingPotential;
            if ((lastRemainingPotential - 1) % POTENTIAL === 0) {
              const _pstat = positiveStats.find(stat => stat.equals(special.stat));
              const maxv = Math.floor(lastRemainingPotential / POTENTIAL);
              if (maxv <= _pstat.value) {
                originalPotentialList.splice(originalPotentialList.indexOf(special), 1);
                pstat.value += (statOriginalValue - cur.stat.value);
                _pstat.value -= maxv;
                special.stat.value += maxv;
                specialFlag = true;
                break;
              }
            }
            cur.stat.value -= 1;
          }
          if (!specialFlag) {
            // 復原cur.stat.value
            cur.stat.value = statOriginalValue;
          } else {
            // 潛力已經用完，不用繼續做了
            break;
          }
        }
        cur = next;
        if (special === cur) {
          special = null;
        }
      }
      resultEqs.push(newDollEq);
    }
    return resultEqs;
  }

  /**
   * 如果前面步驟就有退潛，測試最後步驟是否剩太多潛。
   * FOR: A%CD%CDC的衣服
   * @returns {void}
   */
  checkRemainingPotentialBeforeFillNegative() {
    const eq = this.equipment;
    const steps = eq.steps();
    const minPotential = steps
      .map(step => step.firstStat)
      .filter(stat => stat.value > 0)
      .map(stat => stat.potential)
      .filter(potential => potential > 1)
      .sort((a, b) => a - b)[0];
    if (minPotential && eq.lastStep.remainingPotential > minPotential) {
      const firstNegativeStep = steps.find(step => step.firstStat.value < -1);
      const lastStep = eq.lastStep;
      if (firstNegativeStep && firstNegativeStep !== lastStep) {
        const nextStep = firstNegativeStep.nextStep;
        const nstat = firstNegativeStep.firstStat;
        const pstat = nextStep.firstStat;
        if (pstat.value > 1 && nextStep !== lastStep) {
          const lastStepStatValueOffset = lastStep.firstStat.value - 1;
          nstat.value += 1;
          lastStep.firstStat.value = 1;
          let pv = 0;
          while (nextStep.remainingPotential < 1 || lastStep.remainingPotential < 1) {
            if (pstat.value === 1) {
              pstat.value += pv;
              nstat.value -= 1;
              lastStep.firstStat.value += lastStepStatValueOffset;
              return;
            }
            pstat.value -= 1;
            pv += 1;
          }
          this.positiveStats.find(stat => stat.equals(pstat)).value += pv;
          this.positiveStats.find(stat => stat.equals(lastStep.firstStat)).value += lastStepStatValueOffset;
          this.negativeStats.find(stat => stat.equals(nstat)).value -= 1;
        }
      }
    }
  }

  /**
   * 確認耗潛1的步驟是否能合併到退潛
   */
  checkMergeStepToFillNegative() {
    const resultEqs = [];
    const lastStep = this.equipment.lastStep;
    const lastStat = lastStep.firstStat;
    if (lastStat.potential === 1) {
      const previousStep = lastStep.previousStep;
      if (previousStep) {
        const preStat = previousStep.firstStat;
        const prePstat = this.positiveStats.find(stat => stat.equals(preStat));
        const lastPstat = this.positiveStats.find(stat => stat.equals(lastStat));
        if (prePstat && prePstat.value > 0) {
          const lastStatValueOffset = lastStat.value - 1;
          lastStat.value = 1;
          preStat.value += 1;

          lastPstat.value += lastStatValueOffset;
          prePstat.value -= 1;

          if (previousStep.remainingPotential > 0 && lastStep.remainingPotential === 0) {
            // 複製一份
            resultEqs.push(this.copy());
          }

          // 還原
          lastStat.value += lastStatValueOffset;
          lastPstat.value -= lastStatValueOffset;
          preStat.value -= 1;
          prePstat.value += 1;
        }
      }
    }
    return resultEqs;
  }

  /**
   * 退潛之後，確認有沒有耗潛為1的正屬可以嘗試分次附
   * @returns {EnchantDollEquipmentContainer[]}
   */
  checkStepTypeEach() {
    const finds = this.positiveStats.filter(stat => stat.value !== 0 && stat.originalPotential === 1);
    if (finds.length !== 0) {
      const newDollEq = this.copy();
      const ceq = newDollEq.equipment;
      const noChange = finds.every(find => {
        if (this.equipment.stats().length === 7 && !this.equipment.hasStat(find)) {
          return true;
        }
        const pstat = newDollEq.positiveStats.find(stat => stat.equals(find));
        if (pstat.value > 0) {
          const tstep = ceq.appendStep();
          tstep.type = EnchantStep.TYPE_EACH;
          const tstat = tstep.appendStat(pstat.itemBase, pstat.type, 0);
          const potentialConvertThreshold = tstat.potentialConvertThreshold;
          const preStat = ceq.stat(tstat.itemBase, tstat.type);
          const prev = preStat ? preStat.value : 0;
          while (prev + tstat.value < potentialConvertThreshold && ceq.stepRemainingPotential() > 0 && pstat.value > 0) {
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
        return false;
      });
      return noChange ? [] : [newDollEq];
    }
    return [];
  }

  getMostUsePotentialStatlList() {
    const targetEq = this.equipment;
    const positiveStats = this.positiveStats;
    /**
     * 1. 先處理有倍率的能力。
     *  - 前面已經確保耗潛高的正屬一定在前面
     */
    /** @type {{ type: "step"|"unused", stat: EnchantStepStat|EnchantStat, value: number }[]} */
    const list = targetEq.steps()
      .filter(step => {
        if (step.type !== EnchantStep.TYPE_EACH && !(step.potentialExtraRate === 1 && step.stats.length === 1)) {
          return false;
        }
        const stat = step.firstStat;
        if (stat.value !== 1) {
          return false;
        }
        const pstat = positiveStats.find(_pstat => _pstat.equals(stat));
        return pstat.value !== 0;
      })
      .map(step => {
        const stat = step.firstStat;
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
    if (this.checkFillNegativeStats()) {
      const positives = EnchantDollCategory.classifyStats(positiveStats);
      const noRatePositiveStats = positives
        .filter(category => category.stats.length === 1 && category.stats[0].value !== 0)
        .map(category => category.stats[0]);
      if (noRatePositiveStats.length !== 0) {
        noRatePositiveStats.sort((a, b) => {
          const av = a.originalPotential;
          const bv = b.originalPotential;
          if (av === bv) {
            return b.value - a.value;
          }
          return bv - av; // 大的擺前面
        });
        if (list[0].value < noRatePositiveStats[0].originalPotential) {
          const tstat = noRatePositiveStats[0];
          const value = tstat.itemBase.getPotential(tstat.type, targetEq);
          list.push({
            type: 'unused',
            stat: tstat,
            value,
            list: noRatePositiveStats
          })
        }
      }
    }
    return list.sort((a, b) => a.value - b.value); // 從最後開始拿，小的擺前面
  }

  fillNegative() {
    const eq = this.equipment;
    const lastStep = eq.lastStep;
    let step;
    if (lastStep && lastStep.remainingPotential === 0) {
      lastStep.type = EnchantStep.TYPE_NORMAL;
      step = lastStep;
    } else {
      step = eq.appendStep();
    }
    this.negativeStats.filter(stat => stat.value !== 0).forEach(stat => {
      if (this.equipment.stats().length === 7 && !this.equipment.hasStat(stat)) {
        return;
      }
      step.appendStat(stat.itemBase, stat.type, stat.value);
      stat.value = 0;
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

  checkMergeSteps() {
    const steps = this.equipment.steps();
    const ids = steps.map(step => {
      if (step.stats.length !== 1 || step.type !== EnchantStep.TYPE_EACH) {
        return {
          merged: true
        };
      }
      return {
        step,
        id: step.firstStat.statId,
        merged: false
      };
    });
    ids.forEach((cur, i) => {
      const next = ids[i + 1];
      if (cur.merged || next.merged || i === ids.length - 1) {
        return;
      }
      if (cur.id === next.id) {
        const value = next.step.firstStat.value;
        next.step.remove(); // 要先移除才加得進去
        cur.step.firstStat.value += value;
        next.merged = true;
      }
    });
  }

  copy() {
    const itemCategorys = this.itemCategorys;
    const equipment = this.equipment;
    const positiveStats = this.positiveStats;
    const negativeStats = this.negativeStats;
    const t = new EnchantDollEquipmentContainer({ itemCategorys, equipment, positiveStats, negativeStats });
    t.virtualStats = this.virtualStats.map(_stat => _stat.copy());

    this.clones.push(t);
    t.copyFrom = this;

    return t;
  }

  log(errorOnly = false) {
    const steps = this.equipment.steps();
    if (!errorOnly) {
      console.group(`[ ${this.cloneId} ]`);
    }
    else {
      if (steps.some(step => step.remainingPotential < 1)) {
        console.group(`[ ${this.cloneId} ]`);
      } else {
        console.groupCollapsed(`[ ${this.cloneId} ]`);
      }
    }
    steps.forEach(step => console.log(step.toString()));
    console.groupEnd();
  }
}