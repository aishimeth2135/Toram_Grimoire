import { enchantConfig } from '@/stores/views/enchant'

const STATE = {
  PotentialCapacity: 100,
  EquipmentBasePotentialMinimum: 15,
  EquipmentItemMaximumNumber: 8,
  PotentialConvertDefaultThreshold: 20,
  Character: {
    get level() {
      return enchantConfig.characterLevel
    },
    get smithLevel() {
      return enchantConfig.smithLevel
    },
    tec: 255,
  },
}

export default STATE
