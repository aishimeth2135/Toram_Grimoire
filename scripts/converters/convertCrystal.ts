import type { CsvData } from '../utils'
import type { CrystalData, CrystalEntry, ItemObtain, ItemStat } from '../../src/data/types/crystal'

const TYPE_CHECKING_ID = '0'
const BOSS_TYPE_CHECKING_ID = '1'

export function convertCrystal(csv: CsvData): CrystalData {
  const result: CrystalData = []
  let currentCrystal: CrystalEntry | null = null
  let currentObtain: ItemObtain | null = null
  let currentCategory = ''
  let currentType = -1
  let currentBossType = -1

  csv.forEach((row, index) => {
    if (index === 0) return
    if (!row[0] && !row[1] && !row[2]) return

    const name = row[0]
    const col1 = row[1]
    const attrName = row[2]
    const attrValue1 = row[3] ?? ''
    const attrValue2 = row[4] ?? ''

    if (name === TYPE_CHECKING_ID) {
      currentType = parseInt(col1) ?? -1
      return
    }
    if (name === BOSS_TYPE_CHECKING_ID) {
      currentBossType = parseInt(col1) ?? -1
      return
    }

    if (name !== '' && col1 !== '') {
      currentCrystal = {
        name,
        type: currentType,
        bossType: currentBossType,
        stats: [],
        obtains: [],
      }
      result.push(currentCrystal)
    }

    if (col1 !== '') {
      currentCategory = col1
      if (currentCategory === 'obtain' && currentCrystal) {
        currentObtain = {}
        currentCrystal.obtains.push(currentObtain)
      }
    }

    if (!currentCrystal) return

    if (currentCategory === 'stats' && attrName) {
      currentCrystal.stats.push({ name: attrName, value1: attrValue1, value2: attrValue2 })
    } else if (currentCategory === 'obtain' && currentObtain && attrName) {
      if (['name', 'map', 'dye', 'type', 'npc'].includes(attrName)) {
        currentObtain[attrName as keyof ItemObtain] = attrValue1
      }
    } else if (currentCategory === 'other' && attrName === 'enhancer') {
      currentCrystal.enhancer = attrValue1
    }
  })

  return result
}
