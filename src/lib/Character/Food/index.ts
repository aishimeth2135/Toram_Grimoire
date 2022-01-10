import { markRaw } from 'vue';

import { StatTypes } from '@/lib/Character/Stat/enums';

import { StatBase } from '../Stat';
import { initFoodsBase } from './utils';

type FoodAmount = [number, number];
type FoodsSaveData = {
  name: string;
  foods: {
    statId: string;
    level: number;
    negative: boolean;
    selected: boolean;
  }[];
};

class FoodsBase {
  foodBases: FoodBase[];

  constructor() {
    this.foodBases = markRaw([]);
    initFoodsBase(this);
  }

  appendFoodBase(base: StatBase, amount: FoodAmount, negative: boolean = false) {
    const foodBase = markRaw(new FoodBase(base, amount, negative));
    this.foodBases.push(foodBase);
    return foodBase;
  }

  createFoods(name: string = 'Potum') {
    const foods = new Foods(name);
    this.foodBases.forEach(foodBase => foods.appendFood(foodBase));
    return foods;
  }
}

class FoodBase {
  base: StatBase;
  amount: FoodAmount;
  negative: boolean;

  constructor(base: StatBase, amount: FoodAmount, negative: boolean) {
    this.base = base;
    this.amount = amount,
    this.negative = negative;
  }
  getStat(level: number) {
    const value = Math.min(level, 5) * this.amount[0] + Math.max(level - 5, 0) * this.amount[1];
    return this.base.createStat(StatTypes.Constant, this.negative ? -1 * value : value);
  }
  statTitle() {
    return this.base.title(StatTypes.Constant);
  }
}

class Foods {
  name: string;
  foods: Food[];
  selectedFoodIndexes: number[];

  constructor(name: string) {
    this.name = name;
    this.foods = [];

    this.selectedFoodIndexes = [];
  }

  get selectedFoods() {
    return this.selectedFoodIndexes.map(idx => this.foods[idx]);
  }

  appendFood(foodBase: FoodBase) {
    this.foods.push(new Food(foodBase));
  }
  checkSelectedFoodsMaximum() {
    return this.selectedFoodIndexes.length < 5;
  }
  foodSelected(idx: number) {
    return this.selectedFoodIndexes.includes(idx);
  }
  appendSelectedFood(idx: number) {
    if (this.checkSelectedFoodsMaximum() && !this.foodSelected(idx))
      this.selectedFoodIndexes.push(idx);
  }
  removeSelectedFood(idx: number) {
    const i = this.selectedFoodIndexes.indexOf(idx);
    this.selectedFoodIndexes.splice(i, 1);
  }

  clone() {
    const newFood = new Foods(this.name + '*');
    newFood.foods = this.foods.map(p => p.clone());
    newFood.selectedFoodIndexes = this.selectedFoodIndexes.slice();
    return newFood;
  }

  // save and load with json-data
  save(): FoodsSaveData {
    const data = {} as FoodsSaveData;
    data.name = this.name;

    data.foods = this.foods.map((p, i) => ({
      statId: p.foodBase.base.baseName,
      level: p.level,
      negative: p.foodBase.negative,
      selected: this.foodSelected(i),
    }));

    return data;
  }
  load(data: FoodsSaveData): { success?: boolean; error?: boolean } {
    try {
      let success = true;

      const { name, foods } = data;
      this.name = name;
      foods.forEach(p => {
        const findIdx = this.foods.findIndex(a => a.foodBase.base.baseName === p.statId && a.foodBase.negative === p.negative);
        if (findIdx !== -1) {
          const find = this.foods[findIdx];
          find.level = p.level;
          if (p.selected)
            this.appendSelectedFood(findIdx);
        } else {
          success = false;
          console.warn(`[Foods.load] Can not find Food which stat-base-name: ${p.statId}, negative: ${p.negative}`);
        }
      });

      return {
        success,
      };
    } catch(error) {
      console.warn(error);
      return {
        error: true,
      };
    }
  }
}

class Food {
  foodBase: FoodBase;
  level: number;

  constructor(foodBase: FoodBase) {
    this.foodBase = foodBase;
    this.level = 0;
  }

  stat() {
    return this.foodBase.getStat(this.level);
  }

  statTitle() {
    return this.foodBase.statTitle();
  }

  clone() {
    const newFood = new Food(this.foodBase);
    newFood.level = this.level;
    return newFood;
  }
}

export { FoodsBase, Foods };
export type { FoodAmount, FoodsSaveData };

