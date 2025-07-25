import Grimoire from '@/shared/Grimoire'
import { lastElement } from '@/shared/utils/array'

import { type StatNormalTypes, StatTypes } from '@/lib/Character/Stat'

import {
  EnchantBuild,
  EnchantEquipment,
  EnchantEquipmentTypes,
  EnchantItem,
  EnchantStat,
  enchantStates,
} from '../Enchant'
import { EnchantDollCategory } from './EnchantDollCategory'
import EnchantDollEquipmentContainer from './EnchantDollEquipmentContainer'
import { AutoFindNegaitveStatsTypes, EnchantDollBaseTypes } from './enums'

export interface AutoFindNegaitveStatsResult {
  stats: EnchantStat[]
  realSuccessRate: number
  equipment: EnchantEquipment | null
}

class EnchantDoll {
  private _positiveStats: EnchantStat[]

  build: EnchantBuild
  lastResults: EnchantEquipment[]
  config: {
    baseType: EnchantDollBaseTypes
    autoFindNegaitveStatsType: AutoFindNegaitveStatsTypes
    containsNaturalMpRegenConstant: boolean
  }

  constructor() {
    this.build = new EnchantBuild('Potum')
    this._positiveStats = []
    this.lastResults = []
    this.config = {
      baseType: EnchantDollBaseTypes.None,
      autoFindNegaitveStatsType: AutoFindNegaitveStatsTypes.SuccessRate,
      containsNaturalMpRegenConstant: false,
    }
  }

  get numPositiveStats() {
    return this._positiveStats.length
  }
  get numNegativeStats() {
    return enchantStates.EquipmentItemMaximumNumber - this.numPositiveStats
  }

  get positiveStats() {
    return this._positiveStats
  }

  appendPositiveStat(itemBase: EnchantItem, type: StatNormalTypes, value: number) {
    const stat = new EnchantStat(itemBase, type, value)
    if (this._positiveStats.length === enchantStates.EquipmentItemMaximumNumber) {
      return null
    }
    this._positiveStats.push(stat)
    return stat
  }
  removePositiveStat(stat: EnchantStat) {
    const index = this.positiveStats.indexOf(stat)
    this._positiveStats.splice(index, 1)
  }

  getPositiveStat(itemBase: EnchantItem, type: StatNormalTypes) {
    return this._positiveStats.find(stat => stat.itemBase === itemBase && stat.type === type)
  }

  hasPositiveStat(itemBase: EnchantItem, type: StatNormalTypes) {
    return this.getPositiveStat(itemBase, type) ? true : false
  }

  calc(
    originalNegativeStats: EnchantStat[],
    originalPotential: number = 0
  ): EnchantEquipment | null {
    // 暫存要附的能力，如果能力都被拿完了表示已經計算完畢
    const negativeStats = originalNegativeStats.map(item => item.clone())
    const positiveStats = this._positiveStats.map(item => item.clone())
    if (
      negativeStats.find(stat => stat.value === 0) ||
      positiveStats.find(stat => stat.value === 0)
    ) {
      console.warn('[enchant-doll] value of some given stats is zero.')
      return null
    }
    if (negativeStats.length > 7) {
      console.warn('[enchant-doll] number given negative stats cannot exceed 7.')
      return null
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
    })

    if (originalPotential !== 0) {
      dollEq.equipment.originalPotential = originalPotential
    }

    const firstResultEqs = [dollEq]
    firstResultEqs.push(...dollEq.beforeFillNegative())

    let resultEqs = firstResultEqs.filter(eq => eq.flags.error === null)
    const errorEqs = firstResultEqs.filter(eq => eq.flags.error !== null)

    const clearRepeatEquipment = () => {
      const results = resultEqs
      const map = new Map()
      results.forEach(res => {
        const eq = res.equipment
        const steps = eq.steps()
        const stepsId = steps
          .filter((step, idx) => idx === steps.length - 1 || step.stats[0].value < 0)
          .map(step => step.stats.map(stat => stat.statId + stat.value).join(','))
          .join('->')
        const pre = eq.lastStep
          ? `${eq.lastStep.remainingPotential}/${eq.lastStep.potentialExtraRate}`
          : 'none'
        const id = `${pre}/${steps.length}::${stepsId}`
        if (!map.has(id)) {
          map.set(id, res)
        }
      })
      resultEqs = Array.from(map.values())
      // console.log(`%c[clear repeat] from ${results.length} to ${resultEqs.length}`, 'color: #e8caed');
    }

    // const logResultEqs = (id: string, reqs: EnchantDollEquipmentContainer[]) => {
    //   // console.log('==== [', id, '] ===================');
    //   // console.log(reqs.map(req => req.positiveStats.map(stat => stat.stat.show())));
    //   // console.log(reqs.map(req => req.clone().equipment.steps().map(step => step.toString())));
    //   console.group(`%c  %c [${id}] number of current equipments: ${resultEqs.length}`,
    //     'background-color: #e8caed; border-radius: 50%; margin-right: 12px',
    //     'color: #e8caed')
    //   reqs.forEach(eq => eq.log(true))
    //   console.groupEnd()
    // }

    const sortResult = (
      build1: EnchantDollEquipmentContainer,
      build2: EnchantDollEquipmentContainer
    ) => {
      const sr2 = Math.floor(build2.equipment.realSuccessRate)
      const sr1 = Math.floor(build1.equipment.realSuccessRate)
      if (sr2 === sr1) {
        // 步驟少的
        return build1.equipment.operationStepsQuantity - build2.equipment.operationStepsQuantity
      }
      // 成功率高的
      return sr2 - sr1
    }

    if (resultEqs.length !== 0) {
      // logResultEqs('0', resultEqs)
      resultEqs.forEach(cdollEq => cdollEq.clearVirtualStats())
      clearRepeatEquipment()

      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.mostUseRemainingPotential()))
      clearRepeatEquipment()
      // logResultEqs('1', resultEqs)

      // 負屬全上
      resultEqs.forEach(cdollEq => cdollEq.checkRemainingPotentialBeforeFillNegative())
      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.checkMergeStepToFillNegative()))
      resultEqs.forEach(cdollEq => cdollEq.fillNegative())
      // logResultEqs('2', resultEqs);

      resultEqs.forEach(cdollEq => resultEqs.push(...cdollEq.checkStepTypeEach()))
      // logResultEqs('3', resultEqs);

      // 正屬和剩下來的負屬全上
      resultEqs.forEach(cdollEq => cdollEq.finalFill())
      // logResultEqs('4', resultEqs);

      // 回傳成功率最高的裝備
      resultEqs.sort(sortResult)

      // console.group(`%c  %c${resultEqs.length} results\n%c  %c${errorEqs.length} error results`,
      //   'background-color: #e8caed; border-radius: 50%; margin-right: 12px; font-size: 12px',
      //   'color: #e8caed',
      //   'background-color: red; border-radius: 50%; margin-right: 12px; font-size: 12px',
      //   'color: #e8caed')
      // resultEqs.forEach(deq => {
      //   console.group(`[ ${deq.equipment.successRate} ] [steps: ${deq.equipment.operationStepsQuantity}]`)
      //   deq.equipment.steps().forEach(step => console.log(step.toString()))
      //   console.groupEnd()
      // })
      // console.groupEnd()

      this.lastResults = resultEqs.slice(0, 11).map(res => res.equipment)
      return this.lastResults[0]
    } else {
      errorEqs.forEach(item => item.finalFill())
      errorEqs.sort(sortResult)

      // console.group(`%c  %c${errorEqs.length} kinds of results`,
      //   'background-color: red; border-radius: 50%; margin-right: 12px',
      //   'color: #e8caed');
      // errorEqs.forEach(deq => {
      //   console.group(`[ ${deq.equipment.successRate} ]`);
      //   deq.equipment.steps().forEach(step => console.log(step.toString()));
      //   console.groupEnd();
      // });
      // console.groupEnd();

      this.lastResults = resultEqs.slice(0, 11).map(res => res.equipment)
      return this.lastResults[0]
    }
  }

  optimizeResults() {
    this.lastResults.forEach(eq => {
      eq.checkMergeSteps()
      eq.steps().forEach(step => step.optimizeType(0))
    })
  }

  autoFindNegaitveStats(
    manuallyStats: EnchantStat[] = [],
    originalPotential: number = 0
  ): AutoFindNegaitveStatsResult {
    const limit = this.numNegativeStats
    const categorys = Grimoire.Enchant.categorys

    const buildEquipment = this.build.equipment

    const prioritizedShortList = {
      [EnchantEquipmentTypes.MainWeapon]: [
        'def',
        'mdef',
        'dodge',
        'natural_hp_regen',
        this.config.containsNaturalMpRegenConstant
          ? 'natural_mp_regen'
          : {
              baseId: 'natural_mp_regen',
              types: [StatTypes.Multiplier] as StatNormalTypes[],
            },
      ],
      [EnchantEquipmentTypes.BodyArmor]: ['accuracy'],
    }[buildEquipment.fieldType]

    if (buildEquipment.fieldType === EnchantEquipmentTypes.BodyArmor) {
      switch (this.config.baseType) {
        case 'physical':
          prioritizedShortList.unshift('matk', 'magic_pierce')
          break
        case 'magic':
          prioritizedShortList.unshift('atk', 'physical_pierce')
          break
        case 'none':
          prioritizedShortList.unshift('atk', 'matk', 'physical_pierce', 'magic_pierce')
      }
    }

    const shortlist: EnchantStat[] = []

    const defaultStatTypes: StatNormalTypes[] = [StatTypes.Constant, StatTypes.Multiplier]
    categorys.forEach(category => {
      category.items.forEach(item => {
        const find = prioritizedShortList.find(statBaseItem => {
          if (typeof statBaseItem === 'object') {
            return statBaseItem.baseId === item.statBase.baseId
          }
          return statBaseItem === item.statBase.baseId
        })
        if (find) {
          const types = typeof find === 'object' ? find.types : defaultStatTypes
          types.forEach(type => {
            if (type === StatTypes.Multiplier && !item.statBase.hasMultiplier) {
              return
            }
            if (this.hasPositiveStat(item, type)) {
              return
            }
            const stat = new EnchantStat(item, type, item.getLimit(type).min)
            shortlist.push(stat)
          })
        }
      })
    })

    const negatives: EnchantDollCategory[] = EnchantDollCategory.classifyStats(shortlist)

    // 先排好能力
    negatives.forEach(category => {
      if (this.config.autoFindNegaitveStatsType === 'success-rate') {
        category.sortStats('negaitve--min-material-cost') // 素材耗量低的先擺前面
        category.sortStats('max-effect') // 最大退潛越高的擺越前面
      } else {
        category.sortStats('negaitve--min-material-cost') // 素材耗量低的擺前面
      }
    })
    const tshortlist = negatives.map(category => category.stats).flat()
    manuallyStats = manuallyStats.filter(mstat => !tshortlist.find(nstat => nstat.equals(mstat)))

    const numNegativeStats = Math.min(
      Math.max(this.numNegativeStats - manuallyStats.length, tshortlist.length),
      this.numNegativeStats
    )

    if (tshortlist.length >= numNegativeStats) {
      manuallyStats = manuallyStats.slice(0, this.numNegativeStats - numNegativeStats)
      const originalNegativeStatsList = this.getNegativeStatsList(tshortlist, numNegativeStats)
      const parseStats = (stats: EnchantStat[]) => {
        const tmpCategorys = EnchantDollCategory.classifyStats(stats).sort(
          (item1, item2) => item2.stats.length - item1.stats.length
        )
        tmpCategorys.forEach(_category => _category.sortStats('max-effect'))
        const categoryEffectSum = tmpCategorys
          .map(_category => _category.originalPotentialEffectMaximumSum())
          .reduce((cur, effect) => cur + effect, 0)
        const materialPointSum = tmpCategorys
          .map(_category => _category.materialPointMaximumSum('min'))
          .reduce((cur, mpt) => cur + mpt, 0)
        const categorysId = tmpCategorys.map(_category => _category.stats.length).join('|')
        return {
          categorysId,
          potentialEffect: categoryEffectSum,
          materialPoint: materialPointSum,
        }
      }
      const statsMap = new Map()
      originalNegativeStatsList.forEach(stats => {
        const { categorysId, potentialEffect, materialPoint } = parseStats(stats)
        if (statsMap.has(categorysId)) {
          const data = statsMap.get(categorysId)
          if (data.potentialEffect === potentialEffect && data.materialPoint <= materialPoint) {
            // 退潛量一樣時，保留素材耗量較低的，否則覆蓋
            return
          }
          if (data.potentialEffect > potentialEffect) {
            // 保留退潛比較高的，否則覆蓋
            return
          }
        }
        statsMap.set(categorysId, {
          potentialEffect,
          materialPoint,
          stats,
        })
      })
      const negativeStatsList = Array.from(statsMap, el => el[1].stats)
      const finaleList = negativeStatsList
        .map(stats => {
          const _stats = [...stats, ...manuallyStats]
          const eq = this.calc(_stats, originalPotential)
          if (!eq) {
            return null
          }
          return {
            realSuccessRate: eq.realSuccessRate,
            stats: _stats,
            equipment: eq,
          }
        })
        .filter(item => item !== null) as AutoFindNegaitveStatsResult[]
      return finaleList.sort((item1, item2) => item2.realSuccessRate - item1.realSuccessRate)[0]
    }

    return {
      realSuccessRate: 0,
      equipment: null,
      stats: this.parseNegativeCategorys(negatives, limit),
    }
  }

  parseNegativeCategorys(negatives: EnchantDollCategory[], limit: number): EnchantStat[] {
    const numNegatives = limit

    /**
     * 計算指定的能力數量下，最多能退多少潛
     * @param category
     * @param num - 指定的能力數量
     */
    const calcPotentialPriority = (category: EnchantDollCategory, num: number) => {
      return category.originalPotentialEffectMaximumSum(num)
    }

    /**
     * 計算指定的能力數量下，最多會花多少素材
     * @param category
     * @param num - 指定的能力數量
     */
    const calcMaterialPriority = (category: EnchantDollCategory, num: number) => {
      return category.materialPointMaximumSum('min', num)
    }

    const calcPriority = (category: EnchantDollCategory, nums: number) => {
      return this.config.autoFindNegaitveStatsType === AutoFindNegaitveStatsTypes.SuccessRate
        ? calcPotentialPriority(category, nums)
        : calcMaterialPriority(category, nums)
    }

    negatives.sort((cat1, cat2) => {
      for (let idx = 1; idx <= numNegatives; ++idx) {
        if (idx >= cat1.stats.length && idx >= cat2.stats.length) {
          return 0
        }
        const av = calcPriority(cat1, idx)
        const bv = calcPriority(cat2, idx)
        if (av > bv) {
          return -1
        }
        if (av < bv) {
          return 1
        }
      }
      return 0
    })

    const negativeStats: EnchantStat[] = []
    negatives.find(category => {
      return category.stats.find(stat => {
        negativeStats.push(stat.clone())
        return negativeStats.length === numNegatives
      })
    })

    return negativeStats
  }

  getNegativeStatsList(stats: EnchantStat[], length: number) {
    const finaleRes = []

    const merge = (ary: number[][]) => {
      const res = []
      for (let idx = 0; idx < ary.length - 1; ++idx) {
        for (let idx2 = 0; idx2 < stats.length; ++idx2) {
          const items = ary[idx]
          if (lastElement(items) < idx2) {
            const newEl = items.slice()
            newEl.push(idx2)
            res.push(newEl)
          }
        }
      }
      return res
    }
    let res = Array(stats.length)
      .fill([])
      .map((_value, idx) => [idx])
    while (res.length !== 0 && res[0].length !== stats.length) {
      res = merge(res)
      if (res[0].length === length) {
        finaleRes.push(...res)
        break
      }
    }

    return finaleRes.map(item => item.map(idx => stats[idx]))

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

export { EnchantDoll }
