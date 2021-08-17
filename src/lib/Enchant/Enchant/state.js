import store from '@/store';

const STATE = {
  PotentialCapacity: 100,
  EquipmentBasePotentialMinimum: 15,
  EquipmentItemMaximumNumber: 8,
  PotentialConvertDefaultThreshold: 20,
  Character: {
    get level() {
      return store.state.enchant.config.characterLevel;
    },
    get smithLevel() {
      return store.state.enchant.config.smithLevel;
    },
    tec: 255,
  },
};

export default STATE;
