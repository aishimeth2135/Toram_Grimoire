import Grimoire from '@/shared/Grimoire';

import { FoodsBase } from './index';
import type { FoodAmount } from './index';

function initFoodsBase(foodsBase: FoodsBase) {
  const foodList: Record<string, FoodAmount | { positive: FoodAmount; negative: FoodAmount }> = {
    'max_hp': [400, 600],
    'max_mp': [60, 140],
    'str': [2, 4],
    'dex': [2, 4],
    'int': [2, 4],
    'agi': [2, 4],
    'vit': [2, 4],
    'atk': [6, 14],
    'matk': [6, 14],
    'weapon_atk': [6, 14],
    'physical_resistance': [4, 6],
    'magic_resistance': [4, 6],
    'aggro': {
      positive: [6, 14],
      negative: [6, 14],
    },
    'attack_mp_recovery': [2, 4],
    'critical_rate': [2, 4],
    'accuracy': [6, 14],
    'dodge': [6, 14],
    'def': [6, 14],
    'mdef': [6, 14],
    'drop_rate': [1, 2],
    'physical_barrier': [400, 600],
    'magical_barrier': [400, 600],
    'fractional_barrier': [2, 4],
    'stronger_against_neutral': [1, 2],
    'stronger_against_fire': [1, 2],
    'stronger_against_water': [1, 2],
    'stronger_against_earth': [1, 2],
    'stronger_against_wind': [1, 2],
    'stronger_against_light': [1, 2],
    'stronger_against_dark': [1, 2],
    'neutral_resistance': [2, 4],
    'fire_resistance': [2, 4],
    'water_resistance': [2, 4],
    'earth_resistance': [2, 4],
    'wind_resistance': [2, 4],
    'light_resistance': [2, 4],
    'dark_resistance': [2, 4],
  };

  Object.keys(foodList).forEach(key => {
    const value = foodList[key];
    const base = Grimoire.Character.findStatBase(key);
    if (!base) {
      console.warn('Can not find Statbase which base-name: ' + key);
      return;
    }
    if (Array.isArray(value)) {
      foodsBase.appendFoodBase(base, value);
    }
    else {
      foodsBase.appendFoodBase(base, value.positive);
      foodsBase.appendFoodBase(base, value.negative, true);
    }
  });
}

export { initFoodsBase };
