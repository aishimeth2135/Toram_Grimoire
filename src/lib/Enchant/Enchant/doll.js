import { StatBase } from "@/lib/Character/Stat";
import Grimoire from "@grimoire";
import { EnchantCategory, EnchantItem } from "./base";
import { EnchantBuild, EnchantStat, EnchantEquipment, EnchantStep } from "./build";
import STATE from "./state";

export default class EnchantDoll {
  // static NEGATIVES_LIST = {
  //   [EnchantEquipment.TYPE_MAIN_WEAPON]: [

  //   ],
  //   [EnchantEquipment.TYPE_BODY_ARMOR]: []
  // };

  constructor() {
    this.build = new EnchantBuild('Potum');

    /** @type {EnchantStat[]} */
    this._positiveStats = [];

    /**
     * @typedef EnchantDollConfig
     * @type {object}
     * @property {"physical"|"magic"|"none"} baseType
     * @property {"potential"|"material"} autoFindNegaitveStatsType
     */

    /** @type {EnchantDollConfig} */
    this.config = {
      baseType: 'none',
      autoFindNegaitveStatsType: 'success-rate'
    };

    // /** @type {EnchantDollCategory[]} */
    // this.negatives = [];
  }

  get numPositiveStats() {
    return this._positiveStats.length;
  }
  get numNegativeStats() {
    return STATE.EquipmentItemMaximumNumber - this.numPositiveStats;
  }

  get positiveStats() {
    return this._positiveStats;
  }

  /**
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   * @param {number} [v]
   */
  appendPositiveStat(itemBase, type, v) {
    const stat = new EnchantStat(itemBase, type, v);
    if (this._positiveStats.length === STATE.EquipmentItemMaximumNumber) {
      return null;
    }
    this._positiveStats.push(stat);
    return stat;
  }
  removePositiveStat(stat) {
    const index = this.positiveStats.indexOf(stat);
    this._positiveStats.splice(index, 1);
  }

  /**
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   */
  hasPositiveStat(itemBase, type) {
    return this._positiveStats.find(stat => stat.itemBase === itemBase && stat.type === type);
  }

  /**
   * @param {EnchantStat[]} originalNegativeStats
   * @param {number} [originalPotential] - default: this.build.equipment.originalPotential
   * @returns {EnchantEquipment}
   */
  calc(originalNegativeStats, originalPotential = 0) {
    // 暫存要附的能力，如果能力都被拿完了表示已經計算完畢
    const negativeStats = originalNegativeStats.map(p => p.copy());
    const positiveStats = this._positiveStats.map(p => p.copy());
    if (negativeStats.find(stat => stat.value === 0) || positiveStats.find(stat => stat.value == 0)) {
      console.warn('[enchant-doll] value of some given statt is zero.');
      return;
    }
    if (negativeStats.length > 7) {
      console.warn('[enchant-doll] number given negative stats cannot exceed 7.');
      return;
    }

    // /** @type {EnchantDollCategory[]} */
    // const negatives = [];
    // /** @type {EnchantDollCategory[]} */
    // const positives = [];

    // /**
    //  * 把同category的進行分類。
    //  * - positiveStats和negativeStats為基底倉庫。
    //  * - negatives和positives為主要倉庫。
    //  * - stat不會進行複製，因此兩倉庫的stat.value將會同步。
    //  * - stat.value為0的能力表示被拿完了。
    //  * - 下面的過程中都不會動到基底倉庫，只會去動主要倉庫。
    //  * - 主要倉庫被搬空時表示能力都附完了，而這時候基底倉庫的所有stat.value都會是0。
    //  */
    // this.classifyStats(negatives, negativeStats);
    // this.classifyStats(positives, positiveStats);

    const dollEq = new EnchantDollEquipmentContainer({
      parent: this,
      equipment: this.build.equipment,
      positiveStats,
      negativeStats
    });

    if (originalPotential !== 0) {
      dollEq.equipment.originalPotential = originalPotential;
    }

    const resultEqs = [dollEq];
    const beforeFillNegative = dollEq.beforeFillNegative();

    if (beforeFillNegative !== null) {
      // 一切正常的話
      resultEqs.push(...beforeFillNegative);

      resultEqs.forEach(cdollEq => {
        resultEqs.push(...cdollEq.mostUseRemainingPotential());
      });

      // 負屬全上。這邊假設前面已確保格子夠用。
      resultEqs.forEach(cdollEq => cdollEq.fillNegative());

      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.checkStepTypeEach()));

      // 正屬和剩下來的負屬全上
      resultEqs.forEach(cdollEq => cdollEq.finalFill());

      // 回傳成功率最高的裝備
      const eqs = resultEqs.map(cdollEq => cdollEq.equipment);
      eqs.sort((a, b) => {
       const bv = b.successRate !== -1 ? b.successRate : 999;
       const av = a.successRate !== -1 ? a.successRate : 999;
       return bv - av;
      });
      // console.log('==========================');
      // eqs.forEach(eq => {
      //   console.log(eq);
      //   console.log(eq.steps().map(step => step.toString()));
      //   console.log(eq.successRate);
      // });
      const resultEq = eqs[0];
      resultEq.steps().forEach(step => step.optimizeType(0));
      return resultEq;
    }
    else {
      // 不正常的話
      dollEq.finalFill();
      // console.log('[ERR] ==========================');
      // const eq = dollEq.equipment;
      // console.log(eq);
      // console.log(eq.steps().map(step => step.toString()));
      // console.log(eq.successRate);
      // console.log('==========================');
      return dollEq.equipment;
    }
  }

  /**
   * @param {EnchantStat[]} stats
   * @returns {EnchantDollCategory[]}
   */
  classifyStats(stats) {
    const target = [];
    // stats = stats.map(stat => stat.copy());
    stats.forEach(stat => {
      const statCategory = stat.itemBase.belongCategory;
      const find = target.find(category => category.category === statCategory);
      if (find) {
        find.stats.push(stat);
      } else {
        const category = new EnchantDollCategory(statCategory);
        category.stats.push(stat);
        target.push(category);
      }
    });
    return target;
  }

  /**
   * @param {EnchantStat[]} [manuallyStats]
   * @param {number} [originalPotential]
   * @returns {{
   *  stats: EnchantStat[],
   *  successRate: number|null,
   *  equipment: EnchantEquipment|null
   * }}
   */
   autoFindNegaitveStats(manuallyStats = [], originalPotential = 0) {
    const limit = this.numNegativeStats;
    const categorys = Grimoire.Enchant.categorys;
    const types = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    const shortlist = [];

    const eq = this.build.equipment;

    const prioritizedShortList = {
      [EnchantEquipment.TYPE_MAIN_WEAPON]: ['def', 'mdef', 'dodge', 'natural_hp_regen', 'natural_mp_regen'],
      [EnchantEquipment.TYPE_BODY_ARMOR]: ['accuracy']
    }[eq.fieldType];

    if (eq.fieldType === EnchantEquipment.TYPE_BODY_ARMOR) {
      switch (this.config.baseType) {
        case 'physical':
          prioritizedShortList.unshift('matk', 'magic_pierce'); break;
        case 'magic':
          prioritizedShortList.unshift('atk', 'physical_pierce'); break;
        case 'none':
          prioritizedShortList.unshift('atk', 'matk', 'physical_pierce', 'magic_pierce');
      }
    }

    categorys.forEach(category => {
      category.items.forEach(item => {
        if (prioritizedShortList.includes(item.statBase.baseName)) {
          types.forEach(type => {
            if (type === StatBase.TYPE_MULTIPLIER && !item.statBase.hasMultiplier) {
              return;
            }
            if (this.hasPositiveStat(item, type)) {
              return;
            }
            const stat = new EnchantStat(item, type, item.getLimit(type)[0]);
            shortlist.push(stat);
          })
        }
      });
    });
    // else {
    //   categorys.forEach(category => {
    //     category.items.forEach(item => {
    //       const check = item.conditionalProps.find(p => {
    //         if (p.condition === EnchantItem.CONDITION_MAIN_WEAPON || p.condition === EnchantItem.CONDITION_ORIGINAL_ELEMENT) {
    //           return eq.fieldType === EnchantEquipment.TYPE_MAIN_WEAPON;
    //         }
    //         return eq.fieldType === EnchantEquipment.TYPE_BODY_ARMOR;
    //       });
    //       if (check) {
    //         types.forEach(type => {
    //           if (type === StatBase.TYPE_MULTIPLIER && !item.statBase.hasMultiplier) {
    //             return;
    //           }
    //           if (item.materialPointType === 5) {
    //             // 是耗魔素，直接丟掉
    //             return;
    //           }
    //           if (this.config.baseType !== 'none') {
    //             const excludes = this.config.baseType === 'physical' ?
    //               ['atk', 'physical_pierce'] :
    //               ['matk', 'magic_pierce'];
    //             if (excludes.includes(item.statBase.baseName)) {
    //               return;
    //             }
    //           }
    //           const stat = new EnchantStat(item, type, item.getLimit(type)[0]);
    //           shortlist.push(stat);
    //         })
    //       }
    //     });
    //   });
    // }

    /** @type {EnchantDollCategory[]} */
    const negatives = this.classifyStats(shortlist);

    // 先排好能力
    negatives.forEach(category => {
      if (this.config.autoFindNegaitveStatsType === 'success-rate') {
        category.sortStats('negaitve--min-material-cost'); // 素材耗量低的先擺前面
        category.sortStats('max-effect'); // 最大退潛越高的擺越前面
      } else {
        category.sortStats('negaitve--min-material-cost'); // 素材耗量低的擺前面
      }
    });
    const tshortlist = negatives.map(category => category.stats).flat();
    manuallyStats = manuallyStats.filter(mstat => !tshortlist.find(nstat => nstat.equals(mstat)));

    const numNegativeStats = Math.min(Math.max(this.numNegativeStats - manuallyStats.length, tshortlist.length), this.numNegativeStats);

    if (tshortlist.length >= numNegativeStats) {
      manuallyStats = manuallyStats.slice(0, this.numNegativeStats - numNegativeStats);
      const finaleList = this.getNegativeStatsList(tshortlist, numNegativeStats).map(stats => {
        const _stats = [...stats, ...manuallyStats];
        const eq = this.calc(_stats, originalPotential);
        return {
          successRate: eq.realSuccessRate,
          stats: _stats,
          equipment: eq
        };
      });
      // console.log(finaleList.map(p => ({
      //   stats: p.stats.map(stat => stat.show()),
      //   successRate: p.successRate
      // })))
      return finaleList.sort((a, b) => b.successRate - a.successRate)[0];
    }

    return {
      successRate: null,
      equipment: null,
      stats: this.parseNegativeCategorys(negatives, limit)
    };
  }

  parseNegativeCategorys(negatives, limit) {
    const numNegatives = limit;

    /**
     * 計算指定的能力數量下，最多能退多少潛
     * @param {EnchantDollCategory} category
     * @param {number} nums - 指定的能力數量
     */
    const calcPotentialPriority = (category, nums) => {
      return -1 * category.stats.slice(nums)
        .reduce((cur, stat) => cur + stat.originalPotential * stat.limit[0], 0);
    };

    /**
     * 計算指定的能力數量下，最多會花多少素材
     * @param {EnchantDollCategory} category
     * @param {number} nums - 指定的能力數量
     */
     const calcMaterialPriority = (category, nums) => {
      return -1 * category.stats.slice(nums)
        .reduce((cur, stat) => cur + stat.calcMaterialPointCost(stat.limit[0], 0), 0);
    };

    const calcPriority =  (category, nums) => {
      return this.config.autoFindNegaitveStatsType === 'success-rate' ?
        calcPotentialPriority(category, nums) :
        calcMaterialPriority(category, nums);
    }

    // 退潛CP值最高的擺前面
    negatives.sort((a, b) => {
      for (let i=1; i<=numNegatives; ++i) {
        if (i >= a.stats.length && i >= b.stats.length) {
          return 0;
        }
        const av = calcPriority(a, i);
        const bv = calcPriority(b, i);
        if (av > bv) {
          return -1;
        }
        if (av < bv) {
          return 1;
        }
      }
      return 0;
    });

    const negativeStats = []

    negatives.find(category => {
      let p = 0;
      while (p !== category.stats.length) {
        const stat = category.stats[p];
        negativeStats.push(stat.copy());
        if (negativeStats.length === numNegatives) {
          return true;
        }
        ++p;
      }
    });

    return negativeStats;
  }

  /**
   * @param {EnchantStat[]} stats
   */
  getNegativeStatsList(stats, length) {
    const finaleRes = [];

    const merge = ary => {
      const res = [];
      for (let i=0; i<ary.length - 1; ++i) {
        for (let j=0; j<stats.length; ++j) {
          const p = ary[i];
          if (p[p.length - 1] < j) {
            const newEl = p.slice();
            newEl.push(j);
            res.push(newEl);
          }
        }
      }
      return res;
    }
    let res = Array(stats.length).fill().map((_, i) => [i]);
    while (res.length !== 0 && res[0].length !== stats.length) {
      res = merge(res);
      if (res[0].length === length) {
        finaleRes.push(...res);
        break;
      }
    }

    return finaleRes.map(p => p.map(i => stats[i]));

    /**
     * A  B  C  D
     * A  -
     * B AB  -
     * C AC BC  -
     * D AD BD CD  -
     *
     *    AB  AC  AD  BC  BD  CD
     * A   -   -
     * B   -   -   -
     * C ABC   -   -   -
     * D ABD ACD   - BCD   -
     * \
     * 橫的: ary1 直的ary2
     * el[el.length - 1] < n時才寫入。
     *
     * el: [0, 1] (A B), [0, 2] (A C), [0, 1, 2] (A B C) ....
     *
     * A B
     * A C
     * A D
     * B C
     * B D
     * C D
     * A B C
     * A B D
     * A C D
     * B C D
     * A B C D
    */
  }
}

class EnchantDollCategory {
  constructor(category) {
    /** @type {EnchantCategory} */
    this.category = category;

    /** @type {EnchantStat[]} */
    this.stats = [];
  }

  /**
   * @param {"max-effect"|"cost"} type
   * @param {any} payload
   */
  sortStats(type, payload) {
    if (type === 'max-effect') {
      this.stats.sort((a, b) => {
        const av = -1 * a.originalPotential * a.limit[0];
        const bv = -1 * b.originalPotential * b.limit[0];
        return bv - av;
      });
    }
    else if (type === 'max-cost') {
      const { equipment } = payload;
      this.stats.sort((a, b) => {
        const av = a.itemBase.getPotential(a.type, equipment);
        const bv = b.itemBase.getPotential(a.type, equipment);
        return bv - av;
      });
    }
    else if (type === 'negaitve--min-material-cost') {
      this.stats.sort((a, b) => {
        const av = a.calcMaterialPointCost(a.limit[0], 0);
        const bv = b.calcMaterialPointCost(b.limit[0], 0);
        return av - bv;
      });
    }
  }
}

class EnchantDollEquipmentContainer {
  /**
   * @param {object} param
   * @param {EnchantDoll} param.parent
   * @param {EnchantEquipment} param.equipment
   * @param {EnchantStat[]} param.positiveStats
   * @param {EnchantStat[]} param.negativeStats
   */
  constructor({ parent, equipment, positiveStats, negativeStats }) {
    this.parent = parent;
    this.equipment = equipment.copy(parent.build.categorys);
    this.positiveStats = positiveStats.map(stat => stat.copy());
    this.negativeStats = negativeStats.map(stat => stat.copy());
  }

/**
   * ==== 退潛之前，把有倍率的能力先至少都附1，確保退最多的潛力值。
   * 1. 能力格優先保留給負屬，中途隨時確認剩下的格子夠不夠負屬全上，不夠的話就直接中止。
   * 2. 過程中裝備原本的潛力不夠用時，就從負屬裡拿能力去補。
   *   - 如果負屬被拿完了還是不夠用，就直接中止。
   * 3. 過程中確保附正屬的步驟都只有附一個正屬，不附任何其他能力。
   *  - 先確保步驟單純，在「判定step.type要不要轉成TYPE_EACH」和「退潛前最大化利用剩餘潛力」時不會出錯。
   *  - 全部事情做完後才開始將可以合併的step合併、可以把type轉回TYPE_NORMAL的step轉回去。
   * @returns {EnchantDollEquipmentContainer[]|null} null if some error
   */
  beforeFillNegative() {
    const positives = this.parent.classifyStats(this.positiveStats);
    const negatives = this.parent.classifyStats(this.negativeStats);

    // 耗潛高的能力擺前面
    positives.forEach(category => category.sortStats('max-cost', { equipment: this.equipment }));
    // 最大退潛越高的擺越前面
    negatives.forEach(category => category.sortStats('max-effect'));

    const eq = this.equipment;

    const resultEqs = [];

    // 確認能力數量，確保有足夠的格子退潛
    const checkStatNums = () => {
      const cstats = eq.stats();
      const negsNum = cstats.filter(stat => stat.value < 0).length;
      const negativeStatsLength = negatives.reduce((cur, p) => cur + p.stats.length, 0);
      return cstats.length + negativeStatsLength - negsNum < 7;
    };

    // 倍率低的擺後面，補潛力時會被優先取用
    negatives.sort((a, b) => b.stats.length - a.stats.length);

    let errorFlag = null, appendFlag = false;

    positives
      // 忽略沒倍率的能力。負屬裡有和正屬同類的話，則視這個正屬有倍率。
      .filter(category => category.stats.length > 1 || negatives.find(ncategory => ncategory.category === category.category))
      // 倍率低的擺前面，把耗潛最小化
      .sort((a, b) => a.stats.length - b.stats.length)
      .find(category => {
        category.stats.find(pstat => {
          if (!checkStatNums() && !appendFlag) {
            /**
             * 表示正屬再上，下次步驟負屬會沒辦法全上。
             * - 建立一個副本保存當前狀態，嘗試「以負屬為優先」。
             * - 原本的裝備嘗試「以正屬為優先，多的負屬拉到最後一個步驟」。
             */
            appendFlag = true;
            resultEqs.push(this.copy());
          }
          const step = eq.appendStep();
          step.appendStat(pstat.itemBase, pstat.type, 1);
          pstat.value -= 1;

          // 如果中途潛力不夠附完有倍率的能力，從退潛中拿能力去補。
          if (step.remainingPotential <= 0) {
            // 如果給予的退潛連補潛力都不夠用，或是已經補到能力格不夠用了
            if (negatives.length === 0 || !checkStatNums()) {
              errorFlag = 'base-potential-not-enough';
              step.remove();
              return true; // break
            }

            // 建一個新的step，來放補潛力用的能力
            const bstep = eq.insertStepBefore(step);

            // 補到夠為止
            while (bstep.remainingPotential <= 0) {
              const ccategory = negatives[negatives.length - 1];
              const nstat = ccategory.stats[0];
              const find = bstep.stat(nstat.itemBase, nstat.type);
              if (find) {
                find.value -= 1;
              } else {
                bstep.appendStat(nstat.itemBase, nstat.type, -1);
              }
              nstat.value += 1;

              this.refreshCategorys(negatives);
            }

            // 不夠補
            if (bstep.stats.length === 0) {
              errorFlag = 'base-potential-not-enough';
              bstep.remove();
              step.remove();
              return true;
            }
          }

          return false;
        });

        if (errorFlag !== null) {
          return true;
        }

        return false;
      });
    this.refreshCategorys(positives);
    return errorFlag ? null : resultEqs;
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

    /**
     * @param {EnchantEquipment} targetEq
     */
    const getOriginalPotentialList = targetEq => {
      /**
       * 1. 先處理有倍率的能力。
       *  - 前面已經確保耗潛高的正屬一定在前面
       *  - 因為前面已經optimizeType過，這邊的potentialCost就可以不用管小數
       */
      const list = targetEq.steps()
        .filter((step, i) => step.stats[0].value > 0 && (i === 0 || step.type === EnchantStep.TYPE_EACH))
        .map(step => {
          const pstat = step.stats[0];
          return {
            type: 'step',
            stat: pstat,
            value: pstat.potentialCost
          };
        });
      if (list.length === 0) {
        // 表示正屬都沒倍率，就不需要退潛前最大化利用潛力了
        return [];
      }
      /**
       * 2. 再處理沒倍率的能力。
       */
      const positiveStats = this.positiveStats;
      const tstats = positiveStats.filter(stat => !list.find(p => p.stat.equals(stat)));
      if (tstats.length !== 0) {
        tstats.sort((a, b) => b.originalPotential - a.originalPotential);
        if (list.length === 0 || list[0].value < tstats[0].originalPotential) {
          const tstat = tstats[0];
          if (tstat) {
            list.push({
              type: 'unused',
              stat: tstat,
              value: tstat.originalPotential
            })
          }
        }
      }
      return list;
    }

    const resultEqs = [];

    const baseOriginalPotentialList = getOriginalPotentialList(eq);

    if (baseOriginalPotentialList.length > 0 && baseOriginalPotentialList[0].value < eq.stepRemainingPotential()) {
      /* ==== 嘗試最大利用剩下的潛。 */
      // 複製一個新的附法。
      const newDollEq = this.copy();
      const ceq = newDollEq.equipment;
      const originalPotentialList = getOriginalPotentialList(ceq);
      originalPotentialList.sort((a, b) => a.value - b.value); // 小的擺前面

      const positiveStats = newDollEq.positiveStats;
      // 從最大的開始拿
      let cur = originalPotentialList[originalPotentialList.length - 1];

      // 特殊組合，為了最大化利用潛力。
      const special = originalPotentialList
        .find(p => p.stat.originalPotential === 3 || p.stat.originalPotential === 6);

      while (originalPotentialList.length !== 0) {
        while (cur.value < ceq.stepRemainingPotential()) {
          const pstat = positiveStats.find(stat => stat.equals(cur.stat));
          if (cur.type === 'step') {
            cur.stat.value += 1;
            pstat.value -= 1;
          } else {
            const tsteps = ceq.steps;
            (tsteps.length !== 0 ? tsteps[0] : ceq.appendStep()).appendStat(cur.stat.itemBase, cur.stat.type, 1);
            cur.type = 'step';
            pstat.value -= 1;
          }
          if (pstat.value === 0) {
            break;
          }
          if (special && cur.value > special.value) {
            if ((ceq.stepRemainingPotential() - 1) % special.value === 0) {
              const tv = (ceq.stepRemainingPotential() - 1) / special.value;
              if (tv <= (special.stat.limit - special.stat.value)) {
                special.stat.value += tv;
                /* ==== 到這裡潛力應該剛好剩1。 ==== */
                break;
              }
            }
          }
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
    if (this.equipment.stats().length === 7) {
      return [];
    }
    const find = this.positiveStats.find(stat => stat.value !== 0 && stat.originalPotential === 1);
    if (find) {
      const newDollEq = this.copy();
      const ceq = newDollEq.equipment;
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
      return [newDollEq];
    }
    return [];
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
    const parent = this.parent;
    const equipment = this.equipment;
    const positiveStats = this.positiveStats;
    const negativeStats = this.negativeStats;
    return new EnchantDollEquipmentContainer({ parent, equipment, positiveStats, negativeStats });
  }
}