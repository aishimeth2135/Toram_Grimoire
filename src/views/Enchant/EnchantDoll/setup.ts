import { computed, Ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { StatBase } from '@/lib/Character/Stat'
import { StatNormalTypes, StatTypes } from '@/lib/Character/Stat/enums'
import { EnchantItem } from '@/lib/Enchant/Enchant'

export function setupParseEnchantShorthand(shorthandStr: Ref<string>) {
  const displayOrder = ['atk', 'matk', 'str', 'dex', 'int', 'vit', 'age', 'critical_damage', 'critical_rate']
  const shorthands = Object.entries({
    // longer in front
    'AGI': 'agi',
    'CD': 'critical_damage',
    'A': 'atk',
    'M': 'matk',
    'S': 'str',
    'D': 'dex',
    'V': 'vit',
    'I': 'int',
    'C': 'critical_rate',
  })
    .map(([key, id]) => [key, Grimoire.Character.findStatBase(id)] as [string, StatBase])
    .filter(([, value]) => value !== null)
    .map(([key, value]) => [key, Grimoire.Enchant.findEnchantItem(value!)!] as [string, EnchantItem])

  const parseEnchantShortHand = (str: string) => {
    const statItems: { origin: EnchantItem; type: StatNormalTypes; value: number }[] = []
    if (!str) {
      return statItems
    }
    str = str.toUpperCase().replace(/\s+/g, '')
    shorthands.forEach(([pat, origin]) => {
      const mulPattern = new RegExp(`${pat}(\\d+)?%`, 'g')
      let mulFlag = false
      str = str.replace(mulPattern, (match, m1) => {
        if (!mulFlag) {
          const type = StatTypes.Multiplier
          let value = 0
          const limit = origin.getLimit(type)
          if (m1) {
            value = parseInt(m1, 10)
            value = Number.isNaN(value) ? 0 : value
            if (typeof value === 'number') {
              value = Math.max(limit[0], Math.min(limit[1], value))
            }
          } else {
            value = limit[1]
          }
          if (value !== 0) {
            statItems.push({ origin, type, value })
          }
          mulFlag = true
        }
        return ''
      })
      const constPattern = new RegExp(`${pat}(\\d+)?`, 'g')
      let constFlag = false
      const useConst = mulFlag || pat === 'C' || pat === 'CD'
      str = str.replace(constPattern, (match, m1) => {
        if (!constFlag) {
          let type = useConst ? StatTypes.Constant : StatTypes.Multiplier
          let value = null
          let limit = origin.getLimit(type)
          if (m1) {
            value = parseInt(m1, 10)
            value = Number.isNaN(value) ? 0 : value
            if (typeof value === 'number') {
              if (type === StatTypes.Multiplier && value > limit[1]) {
                type = StatTypes.Constant
                limit = origin.getLimit(type)
              }
              value = Math.max(limit[0], Math.min(limit[1], value))
            }
          } else {
            value = limit[1]
          }
          if (value !== 0) {
            statItems.push({ origin, type, value })
          }
          constFlag = true
        }
        return ''
      })
    })
    return statItems.sort((item1, item2) => displayOrder.indexOf(item1.origin.statBase.baseId) - displayOrder.indexOf(item2.origin.statBase.baseId))
  }

  const enchantShortHandStatItems = computed(() => parseEnchantShortHand(shorthandStr.value))

  return { enchantShortHandStatItems }
}