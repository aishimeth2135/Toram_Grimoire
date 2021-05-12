import { StatBase } from "@/lib/Character/Stat";
import Grimoire from "@grimoire";

import { EnchantCategory, EnchantItem } from "../base";
import { EnchantBuild, EnchantStat, EnchantEquipment } from "../build";
import EnchantDollEquipmentContainer from "./EnchantDollEquipmentContainer.js";
import STATE from "../state";

export default class EnchantDoll {
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
    if (negativeStats.find(stat => stat.value === 0) || positiveStats.find(stat => stat.value === 0)) {
      console.warn('[enchant-doll] value of some given stats is zero.');
      return;
    }
    if (negativeStats.length > 7) {
      console.warn('[enchant-doll] number given negative stats cannot exceed 7.');
      return;
    }

    // /**
    //  * 把同category的進行分類。
    //  * - positiveStats和negativeStats為基底倉庫。
    //  * - negatives和positives為主要倉庫。
    //  * - stat不會進行複製，因此兩倉庫的stat.value將會同步。
    //  * - stat.value為0的能力表示被拿完了。
    //  */
    // const negatives = this.classifyStats(negativeStats);
    // const positives = this.classifyStats(positiveStats);

    const dollEq = new EnchantDollEquipmentContainer({
      parent: this,
      equipment: this.build.equipment,
      positiveStats,
      negativeStats
    });

    if (originalPotential !== 0) {
      dollEq.equipment.originalPotential = originalPotential;
    }

    const firstResultEqs = [dollEq];
    firstResultEqs.push(...dollEq.beforeFillNegative());


    const resultEqs = firstResultEqs.filter(eq => eq.errorFlag === null);
    const errorEqs = firstResultEqs.filter(eq => eq.errorFlag !== null);

    // const logResultEqs = (id, reqs) => {
    //   // console.log('==== [', id, '] ===================');
    //   // console.log(reqs.map(req => req.positiveStats.map(stat => stat.show())));
    //   // console.log(reqs.map(req => req.copy().equipment.steps().map(step => step.toString())));
    // };

    if (resultEqs.length !== 0) {
      // logResultEqs('0', resultEqs);
      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.mostUseRemainingPotential()));
      // logResultEqs('1', resultEqs);

      // 負屬全上。這邊假設前面已確保格子夠用。
      resultEqs.forEach(cdollEq => cdollEq.fillNegative());
      // logResultEqs('2', resultEqs);

      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.checkStepTypeEach()));
      // logResultEqs('3', resultEqs);

      // 正屬和剩下來的負屬全上
      resultEqs.forEach(cdollEq => cdollEq.finalFill());
      // logResultEqs('4', resultEqs);

      // 回傳成功率最高的裝備
      const eqs = resultEqs.map(cdollEq => cdollEq.equipment);
      eqs.sort((a, b) => {
       const bv = b.successRate !== -1 ? b.successRate : 9999;
       const av = a.successRate !== -1 ? a.successRate : 9999;
       return bv - av;
      });
      // console.log('[normal] ==========================');
      // resultEqs.forEach(deq => {
      //   console.log('--------------------------');
      //   console.log(deq);
      //   console.log(deq.equipment.steps().map(step => step.toString()));
      //   console.log(deq.equipment.successRate);
      // });
      const resultEq = eqs[0];
      resultEq.steps().forEach(step => step.optimizeType(0));
      return resultEq;
    }
    else {
      errorEqs.forEach(dollEq => dollEq.finalFill());
      const eqs = errorEqs.map(cdollEq => cdollEq.equipment);
      eqs.sort((a, b) => {
        const bv = b.successRate !== -1 ? b.successRate : 9999;
        const av = a.successRate !== -1 ? a.successRate : 9999;
        return bv - av;
       });
      // console.log('[err] ==========================');
      // errorEqs.forEach(deq => {
      //   console.log('--------------------------');
      //   console.log(deq);
      //   console.log(deq.equipment.steps().map(step => step.toString()));
      //   console.log(deq.equipment.successRate);
      // });
      const resultEq = eqs[0];
      return resultEq;
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
      const originalNegativeStatsList = this.getNegativeStatsList(tshortlist, numNegativeStats);
      /** @param {EnchantDollCategory[]} categorys */
      const parseStats = stats => {
        const categorys = this.classifyStats(stats).slice().sort((a, b) => b.stats.length - a.stats.length);
        categorys.forEach(_category => _category.sortStats('max-effect'));
        const categoryEffectSum = categorys
          .map(_category => _category.originalPotentialEffectMaximumSum())
          .reduce((cur, effect) => cur + effect, 0);
        const materialPointSum = categorys
          .map(_category => _category.materialPointMaximumSum('min'))
          .reduce((cur, mpt) => cur + mpt, 0);
        const categorysId = categorys.map(_category => _category.stats.length).join('|');
        return {
          categorysId,
          potentialEffect: categoryEffectSum,
          materialPoint: materialPointSum
        };
      };
      const statsMap = new Map();
      originalNegativeStatsList.forEach(stats => {
        const { categorysId, potentialEffect, materialPoint } = parseStats(stats);
        if (statsMap.has(categorysId)) {
          const data = statsMap.get(categorysId);
          if (data.potentialEffect === potentialEffect && data.materialPoint <= materialPoint) {
            // 退潛量一樣時，保留素材耗量較低的，否則覆蓋
            return;
          }
          if (data.potentialEffect > potentialEffect) {
            // 保留退潛比較高的，否則覆蓋
            return;
          }
        }
        statsMap.set(categorysId, {
          potentialEffect,
          materialPoint,
          stats
        });
      });
      const negativeStatsList = Array.from(statsMap, el => el[1].stats);
      // console.log('optimize:', originalNegativeStatsList.length, negativeStatsList.length);
      const finaleList = negativeStatsList.map(stats => {
        const _stats = [...stats, ...manuallyStats];
        const eq = this.calc(_stats, originalPotential);
        return {
          successRate: eq.realSuccessRate,
          stats: _stats,
          equipment: eq
        };
      });
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
     * @param {number} num - 指定的能力數量
     */
    const calcPotentialPriority = (category, num) => {
      return category.originalPotentialEffectMaximumSum(num);
    };

    /**
     * 計算指定的能力數量下，最多會花多少素材
     * @param {EnchantDollCategory} category
     * @param {number} num - 指定的能力數量
     */
     const calcMaterialPriority = (category, num) => {
      return category.materialPointMaximumSum('min', num);
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
     *
     * 只看橫排。
     * el: [0, 1] (A B), [0, 2] (A C), [0, 1, 2] (A B C) ....
     * el[el.length - 1] < n時才寫入。
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
        const bv = b.itemBase.getPotential(b.type, equipment);
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

  /**
   * get sum of potential effect maximum of stats
   * @param {number} [num]
   * @returns {number} sum of potential effect of stats
   */
   originalPotentialEffectMaximumSum(num) {
    num = num === void 0 ? this.stats.length : num;
    return -1 * this.stats.slice(num)
      .reduce((cur, stat) => cur + stat.calcMaterialPointCost(stat.limit[0], 0), 0)
  }

  /**
   * get sum of material point maximum of stats by limit.min of stat
   * @param {"min"|"max"} type - which limit to calc
   * @param {number} [num]
   * @returns {number} sum of material point of stats
   */
  materialPointMaximumSum(type, num) {
    type = { 'min': 0, 'max': 1 }[type];
    num = num === void 0 ? this.stats.length : num;
    return this.stats.slice(num)
      .reduce((cur, stat) => cur + stat.calcMaterialPointCost(stat.limit[type], 0), 0);
  }
}

export { EnchantDollCategory, EnchantDoll };