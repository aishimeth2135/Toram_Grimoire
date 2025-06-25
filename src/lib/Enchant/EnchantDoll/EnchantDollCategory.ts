import type { EnchantCategory } from '../Enchant/EnchantBase'
import type { EnchantEquipment, EnchantStat } from '../Enchant/EnchantBuild'

class EnchantDollCategory {
  category: EnchantCategory
  stats: EnchantStat[]

  constructor(category: EnchantCategory) {
    this.category = category
    this.stats = []
  }

  static classifyStats(stats: EnchantStat[]): EnchantDollCategory[] {
    const target: EnchantDollCategory[] = []
    stats.forEach(stat => {
      const statCategory = stat.itemBase.belongCategory
      const find = target.find(category => category.category === statCategory)
      if (find) {
        find.stats.push(stat)
      } else {
        const category = new EnchantDollCategory(statCategory)
        category.stats.push(stat)
        target.push(category)
      }
    })
    return target
  }

  sortStats(
    type: 'max-effect' | 'max-cost' | 'negaitve--min-material-cost',
    payload?: { equipment: EnchantEquipment }
  ) {
    if (type === 'max-effect') {
      this.stats.sort((item1, item2) => {
        const av = -1 * item1.originalPotential * item1.limit.min
        const bv = -1 * item2.originalPotential * item2.limit.min
        return bv - av
      })
    } else if (type === 'max-cost') {
      const { equipment } = payload as { equipment: EnchantEquipment }
      this.stats.sort((item1, item2) => {
        const av = item1.itemBase.getPotential(item1.type, equipment)
        const bv = item2.itemBase.getPotential(item2.type, equipment)
        if (av === bv) {
          return item2.value - item1.value
        }
        return bv - av
      })
    } else if (type === 'negaitve--min-material-cost') {
      this.stats.sort((item1, item2) => {
        const av = item1.calcMaterialPointCost(item1.limit.min, 0)
        const bv = item2.calcMaterialPointCost(item2.limit.min, 0)
        return av - bv
      })
    }
  }

  /**
   * get sum of potential effect maximum of stats
   */
  originalPotentialEffectMaximumSum(num?: number): number {
    num = num === undefined ? this.stats.length : num
    return (
      -1 *
      this.stats
        .slice(0, num)
        .reduce((cur, stat) => cur + stat.originalPotential * stat.limit.min, 0)
    )
  }

  /**
   * get sum of material point maximum of stats by limit.min of stat
   * @param type - which limit to calc
   * @returns sum of material point of stats
   */
  materialPointMaximumSum(type: 'min' | 'max', num?: number): number {
    num = num === undefined ? this.stats.length : num
    return this.stats
      .slice(0, num)
      .reduce((cur, stat) => cur + stat.calcMaterialPointCost(stat.limit[type], 0), 0)
  }
}

export { EnchantDollCategory }
