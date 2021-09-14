import Grimoire from '@/shared/Grimoire';

import { StatTypes, StatNormalTypes } from '@/lib/Character/Stat/enums';

import { EnchantCategory, EnchantItem } from '../base';
import { EnchantBuild, EnchantStat, EnchantEquipment } from '../build';
import STATE from '../state';
import { EnchantDollBaseTypes, AutoFindNegaitveStatsTypes } from './enums';
import EnchantDollEquipmentContainer from './EnchantDollEquipmentContainer';
import { EnchantEquipmentTypes } from '../enums';

interface AutoFindNegaitveStatsResultIntegral {
  stats: EnchantStat[];
  realSuccessRate: number;
  equipment: EnchantEquipment;
}

interface AutoFindNegaitveStatsResultPartial {
  stats: EnchantStat[];
  realSuccessRate: null;
  equipment: null;
}


export default class EnchantDoll {
  private _positiveStats: EnchantStat[];

  build: EnchantBuild;
  config: {
    baseType: EnchantDollBaseTypes;
    autoFindNegaitveStatsType: AutoFindNegaitveStatsTypes;
  };

  constructor() {
    this.build = new EnchantBuild('Potum');
    this._positiveStats = [];
    this.config = {
      baseType: EnchantDollBaseTypes.None,
      autoFindNegaitveStatsType: AutoFindNegaitveStatsTypes.SuccessRate,
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

  appendPositiveStat(itemBase: EnchantItem, type: StatNormalTypes, value: number) {
    const stat = new EnchantStat(itemBase, type, value);
    if (this._positiveStats.length === STATE.EquipmentItemMaximumNumber) {
      return null;
    }
    this._positiveStats.push(stat);
    return stat;
  }
  removePositiveStat(stat: EnchantStat) {
    const index = this.positiveStats.indexOf(stat);
    this._positiveStats.splice(index, 1);
  }

  getPositiveStat(itemBase: EnchantItem, type: StatNormalTypes) {
    return this._positiveStats.find(stat => stat.itemBase === itemBase && stat.type === type);
  }

  hasPositiveStat(itemBase: EnchantItem, type: StatNormalTypes) {
    return this.getPositiveStat(itemBase, type) ? true : false;
  }


  calc(originalNegativeStats: EnchantStat[], originalPotential: number = 0): EnchantEquipment | null {
    // 暫存要附的能力，如果能力都被拿完了表示已經計算完畢
    const negativeStats = originalNegativeStats.map(p => p.copy());
    const positiveStats = this._positiveStats.map(p => p.copy());
    if (negativeStats.find(stat => stat.value === 0) || positiveStats.find(stat => stat.value === 0)) {
      console.warn('[enchant-doll] value of some given stats is zero.');
      return null;
    }
    if (negativeStats.length > 7) {
      console.warn('[enchant-doll] number given negative stats cannot exceed 7.');
      return null;
    }

    /**
     * 把同category的進行分類。
     * - positiveStats和negativeStats為基底倉庫。
     * - negatives和positives為主要倉庫。
     * - stat不會進行複製，因此兩倉庫的stat.value將會同步。
     * - stat.value為0的能力表示被拿完了。
     */
    // const negatives = EnchantDollCategory.classifyStats(negativeStats);
    // const positives = EnchantDollCategory.classifyStats(positiveStats);

    const dollEq = new EnchantDollEquipmentContainer({
      itemCategorys: this.build.categorys,
      equipment: this.build.equipment,
      positiveStats,
      negativeStats,
    });

    if (originalPotential !== 0) {
      dollEq.equipment.originalPotential = originalPotential;
    }

    const firstResultEqs = [dollEq];
    firstResultEqs.push(...dollEq.beforeFillNegative());

    let resultEqs = firstResultEqs.filter(eq => eq.flags.error === null);
    const errorEqs = firstResultEqs.filter(eq => eq.flags.error !== null);

    const clearRepeatEquipment = () => {
      const results = resultEqs;
      const map = new Map();
      results.forEach(res => {
        const eq = res.equipment;
        const steps = eq.steps();
        const stepsId = steps
          .filter((step, i) => i === steps.length - 1 || step.stats[0].value < 0)
          .map(step => step.stats.map(stat => stat.statId + stat.value).join(','))
          .join('->');
        const pre = eq.lastStep ? `${eq.lastStep.remainingPotential}/${eq.lastStep.potentialExtraRate}` : 'none';
        const id = `${pre}/${steps.length}::${stepsId}`;
        if (!map.has(id)) {
          map.set(id, res);
        }
      });
      resultEqs = Array.from(map.values());
      // console.log(`%c[clear repeat] from ${results.length} to ${resultEqs.length}`, 'color: #e8caed');
    };

    // const logResultEqs = (id, reqs) => {
    //   // console.log('==== [', id, '] ===================');
    //   // console.log(reqs.map(req => req.positiveStats.map(stat => stat.stat.show())));
    //   // console.log(reqs.map(req => req.copy().equipment.steps().map(step => step.toString())));
    //   console.group(`%c  %c [${id}] number of current equipments: ${resultEqs.length}`,
    //     'background-color: #e8caed; border-radius: 50%; margin-right: 12px',
    //     'color: #e8caed');
    //   reqs.forEach(eq => eq.log(true));
    //   console.groupEnd();
    // };

    const sortResult = (build1: EnchantDollEquipmentContainer, build2: EnchantDollEquipmentContainer) => {
      const sr2 = Math.floor(build2.equipment.realSuccessRate);
      const sr1 = Math.floor(build1.equipment.realSuccessRate);
      if (sr2 === sr1) {
        // 步驟少的
        return build1.equipment.operationStepsNum - build2.equipment.operationStepsNum;
      }
      // 成功率高的
      return sr2 - sr1;
    };

    if (resultEqs.length !== 0) {
      // logResultEqs('0', resultEqs);
      resultEqs.forEach(cdollEq => cdollEq.clearVirtualStats());
      clearRepeatEquipment();

      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.mostUseRemainingPotential()));
      clearRepeatEquipment();
      // logResultEqs('1', resultEqs);

      // 負屬全上
      resultEqs.forEach(cdollEq => cdollEq.checkRemainingPotentialBeforeFillNegative());
      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.checkMergeStepToFillNegative()));
      resultEqs.forEach(cdollEq => cdollEq.fillNegative());
      // logResultEqs('2', resultEqs);

      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.checkStepTypeEach()));
      // logResultEqs('3', resultEqs);

      // 正屬和剩下來的負屬全上
      resultEqs.forEach(cdollEq => cdollEq.finalFill());
      // logResultEqs('4', resultEqs);

      // 回傳成功率最高的裝備
      resultEqs.sort(sortResult);

      // console.group(`%c  %c${resultEqs.length} kinds of results\n%c  %c${errorEqs.length} kinds of error-results`,
      //   'background-color: #e8caed; border-radius: 50%; margin-right: 12px',
      //   'color: #e8caed',
      //   'background-color: red; border-radius: 50%; margin-right: 12px',
      //   'color: #e8caed');
      // resultEqs.forEach(deq => {
      //   console.group(`[ ${deq.equipment.successRate} ] [steps: ${deq.equipment.operationStepsNum}]`);
      //   deq.equipment.steps().forEach(step => console.log(step.toString()));
      //   console.groupEnd();
      // });
      // console.groupEnd();

      const result = resultEqs[0];
      result.checkMergeSteps();
      const resultEq = result.equipment;
      resultEq.steps().forEach(step => step.optimizeType(0));
      return resultEq;
    }
    else {
      errorEqs.forEach(item => item.finalFill());
      errorEqs.sort(sortResult);

      // console.group(`%c  %c${errorEqs.length} kinds of results`,
      //   'background-color: red; border-radius: 50%; margin-right: 12px',
      //   'color: #e8caed');
      // errorEqs.forEach(deq => {
      //   console.group(`[ ${deq.equipment.successRate} ]`);
      //   deq.equipment.steps().forEach(step => console.log(step.toString()));
      //   console.groupEnd();
      // });
      // console.groupEnd();

      const result = resultEqs[0];
      result.checkMergeSteps();
      const resultEq = result.equipment;
      resultEq.steps().forEach(step => step.optimizeType(0));
      return resultEq;
    }
  }

  autoFindNegaitveStats(manuallyStats: EnchantStat[] = [], originalPotential: number = 0): AutoFindNegaitveStatsResultIntegral | AutoFindNegaitveStatsResultPartial {
    const limit = this.numNegativeStats;
    const categorys = Grimoire.Enchant.categorys;

    const buildEquipment = this.build.equipment;

    const prioritizedShortList = {
      [EnchantEquipmentTypes.MainWeapon]: ['def', 'mdef', 'dodge', 'natural_hp_regen', {
        baseName: 'natural_mp_regen',
        types: [StatTypes.Multiplier] as StatNormalTypes[],
      }],
      [EnchantEquipmentTypes.BodyArmor]: ['accuracy'],
    }[buildEquipment.fieldType];

    if (buildEquipment.fieldType === EnchantEquipmentTypes.BodyArmor) {
      switch (this.config.baseType) {
        case 'physical':
          prioritizedShortList.unshift('matk', 'magic_pierce'); break;
        case 'magic':
          prioritizedShortList.unshift('atk', 'physical_pierce'); break;
        case 'none':
          prioritizedShortList.unshift('atk', 'matk', 'physical_pierce', 'magic_pierce');
      }
    }

    const shortlist: EnchantStat[] = [];

    categorys.forEach(category => {
      category.items.forEach(item => {
        const find = prioritizedShortList.find(statBaseItem => {
          if (typeof statBaseItem === 'object') {
            return statBaseItem.baseName === item.statBase.baseName;
          }
          return statBaseItem === item.statBase.baseName;
        });
        if (find) {
          const types = typeof find === 'object' ? find.types : [StatTypes.Constant, StatTypes.Multiplier] as StatNormalTypes[];
          types.forEach(type => {
            if (type === StatTypes.Multiplier && !item.statBase.hasMultiplier) {
              return;
            }
            if (this.hasPositiveStat(item, type)) {
              return;
            }
            const stat = new EnchantStat(item, type, item.getLimit(type)[0]);
            shortlist.push(stat);
          });
        }
      });
    });

    const negatives: EnchantDollCategory[] = EnchantDollCategory.classifyStats(shortlist);

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
      const parseStats = (stats: EnchantStat[]) => {
        const tmpCategorys = EnchantDollCategory.classifyStats(stats).sort((a, b) => b.stats.length - a.stats.length);
        tmpCategorys.forEach(_category => _category.sortStats('max-effect'));
        const categoryEffectSum = tmpCategorys
          .map(_category => _category.originalPotentialEffectMaximumSum())
          .reduce((cur, effect) => cur + effect, 0);
        const materialPointSum = tmpCategorys
          .map(_category => _category.materialPointMaximumSum('min'))
          .reduce((cur, mpt) => cur + mpt, 0);
        const categorysId = tmpCategorys.map(_category => _category.stats.length).join('|');
        return {
          categorysId,
          potentialEffect: categoryEffectSum,
          materialPoint: materialPointSum,
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
          stats,
        });
      });
      const negativeStatsList = Array.from(statsMap, el => el[1].stats);
      const finaleList = negativeStatsList.map(stats => {
        const _stats = [...stats, ...manuallyStats];
        const eq = this.calc(_stats, originalPotential);
        if (!eq) {
          return null;
        }
        return {
          realSuccessRate: eq.realSuccessRate,
          stats: _stats,
          equipment: eq,
        };
      }).filter(item => item !== null) as AutoFindNegaitveStatsResultIntegral[];
      return finaleList.sort((item1, item2) => item2.realSuccessRate - item1.realSuccessRate)[0];
    }

    return {
      realSuccessRate: null,
      equipment: null,
      stats: this.parseNegativeCategorys(negatives, limit),
    };
  }

  parseNegativeCategorys(negatives: EnchantDollCategory[], limit: number): EnchantStat[] {
    const numNegatives = limit;

    /**
     * 計算指定的能力數量下，最多能退多少潛
     * @param category
     * @param num - 指定的能力數量
     */
    const calcPotentialPriority = (category: EnchantDollCategory, num: number) => {
      return category.originalPotentialEffectMaximumSum(num);
    };

    /**
     * 計算指定的能力數量下，最多會花多少素材
     * @param category
     * @param num - 指定的能力數量
     */
    const calcMaterialPriority = (category: EnchantDollCategory, num: number) => {
      return category.materialPointMaximumSum('min', num);
    };

    const calcPriority =  (category: EnchantDollCategory, nums: number) => {
      return this.config.autoFindNegaitveStatsType === AutoFindNegaitveStatsTypes.SuccessRate ?
        calcPotentialPriority(category, nums) :
        calcMaterialPriority(category, nums);
    };

    negatives.sort((cat1, cat2) => {
      for (let i = 1; i <= numNegatives; ++i) {
        if (i >= cat1.stats.length && i >= cat2.stats.length) {
          return 0;
        }
        const av = calcPriority(cat1, i);
        const bv = calcPriority(cat2, i);
        if (av > bv) {
          return -1;
        }
        if (av < bv) {
          return 1;
        }
      }
      return 0;
    });

    const negativeStats: EnchantStat[] = [];
    negatives.find(category => {
      return category.stats.find(stat => {
        negativeStats.push(stat.copy());
        return negativeStats.length === numNegatives;
      });
    });

    return negativeStats;
  }

  getNegativeStatsList(stats: EnchantStat[], length: number) {
    const finaleRes = [];

    const merge = (ary: number[][]) => {
      const res = [];
      for (let i = 0; i < ary.length - 1; ++i) {
        for (let j = 0; j < stats.length; ++j) {
          const p = ary[i];
          if (p[p.length - 1] < j) {
            const newEl = p.slice();
            newEl.push(j);
            res.push(newEl);
          }
        }
      }
      return res;
    };
    let res = Array(stats.length).fill([]).map((_, idx) => [idx]);
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
  category: EnchantCategory;
  stats: EnchantStat[];

  constructor(category: EnchantCategory) {
    this.category = category;
    this.stats = [];
  }

  static classifyStats(stats: EnchantStat[]): EnchantDollCategory[] {
    const target: EnchantDollCategory[] = [];
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

  sortStats(type: 'max-effect' | 'max-cost' | 'negaitve--min-material-cost', payload?: { equipment: EnchantEquipment }) {
    if (type === 'max-effect') {
      this.stats.sort((a, b) => {
        const av = -1 * a.originalPotential * a.limit[0];
        const bv = -1 * b.originalPotential * b.limit[0];
        return bv - av;
      });
    }
    else if (type === 'max-cost') {
      const { equipment } = payload as { equipment: EnchantEquipment };
      this.stats.sort((a, b) => {
        const av = a.itemBase.getPotential(a.type, equipment);
        const bv = b.itemBase.getPotential(b.type, equipment);
        if (av === bv) {
          return b.value - a.value;
        }
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
   */
  originalPotentialEffectMaximumSum(num?: number): number {
    num = num === undefined ? this.stats.length : num;
    return -1 * this.stats.slice(0, num)
      .reduce((cur, stat) => cur + stat.originalPotential * stat.limit[0], 0);
  }

  /**
   * get sum of material point maximum of stats by limit.min of stat
   * @param type - which limit to calc
   * @returns sum of material point of stats
   */
  materialPointMaximumSum(type: 'min' | 'max', num?: number): number {
    const typeToIdx = { 'min': 0, 'max': 1 }[type];
    num = num === undefined ? this.stats.length : num;
    return this.stats.slice(0, num)
      .reduce((cur, stat) => cur + stat.calcMaterialPointCost(stat.limit[typeToIdx], 0), 0);
  }
}

export { EnchantDollCategory, EnchantDoll };
