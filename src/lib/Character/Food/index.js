import { StatBase } from "@/lib/Character/Stat";

class Foods {
  constructor(name) {
    this.name = name;
    this.foods = [];

    this.selectedFoodIndexes = [];
  }

  get selectedFoods() {
    return this.selectedFoodIndexes.map(idx => this.foods[idx]);
  }

  appendFood(base, amount, negative = false) {
    this.foods.push(new Food(base, amount, negative));
  }
  checkSelectedFoodsMaximum() {
    return this.selectedFoodIndexes.length < 5;
  }
  foodSelected(idx) {
    return this.selectedFoodIndexes.includes(idx);
  }
  appendSelectedFood(idx) {
    if (this.checkSelectedFoodsMaximum() && !this.foodSelected(idx))
      this.selectedFoodIndexes.push(idx);
  }
  removeSelectedFood(idx) {
    const i = this.selectedFoodIndexes.indexOf(idx);
    this.selectedFoodIndexes.splice(i, 1);
  }

  copy() {
    const newFood = new Foods(this.name + '*');
    newFood.foods = this.foods.map(p => p.copy());
    newFood.selectedFoodIndexes = this.selectedFoodIndexes.slice();
    return newFood;
  }

  // save and load with json-data
  save() {
    const data = {};
    data.name = this.name;

    data.foods = this.foods.map((p, i) => ({
      statId: p.base.baseName,
      level: p.level,
      negative: p.negative,
      selected: this.foodSelected(i),
    }));

    return data;
  }
  load(data) {
    try {
      let success = true;

      const { name, foods } = data;
      this.name = name;
      foods.forEach(p => {
        const findIdx = this.foods.findIndex(a => a.base.baseName == p.statId && a.negative == p.negative);
        if (findIdx != -1) {
          const find = this.foods[findIdx];
          find.level = p.level;
          if (p.selected)
            this.appendSelectedFood(findIdx);
        } else {
          success = false;
          console.warn(`Can not find Food which stat-base-name: ${p.statId}, negative: ${p.negative}` );
        }
      });

      return {
        success,
      };
    } catch(e) {
      console.warn(e);
      return {
        error: true,
      };
    }
  }
}

class Food {
  constructor(base, amount, negative) {
    this.base = base
    this.amount = amount,
    this.level = 0;
    this.negative = negative;
  }
  stat() {
    const v = Math.min(this.level, 5) * this.amount[0] + Math.max(this.level - 5, 0) * this.amount[1];
    return this.base.createStat(StatBase.TYPE_CONSTANT, this.negative ? -1 * v : v);
  }
  statTitle() {
    return this.base.title(StatBase.TYPE_CONSTANT);
  }
  copy() {
    const t = new Food(this.base, this.amount, this.negative);
    t.level = this.level;
    return t;
  }
}

export { Foods };
