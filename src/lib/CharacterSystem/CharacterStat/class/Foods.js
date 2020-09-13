import StatBase from "@lib/CharacterSystem/module/StatBase.js";

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
    if (this.checkSelectedFoodsMaximum())
      this.selectedFoodIndexes.push(idx);
  }
  removeSelectedFood(idx) {
    const i = this.selectedFoodIndexes.indexOf(idx);
    this.selectedFoodIndexes.splice(i, 1);
  }

  // save and load with json-data
  save() {
    const data = {};
    data.name = this.name;

    data.foods = this.foods.map(p => ({
      statId: p.base.baseName,
      level: p.level,
      negative: p.negative
    }));

    data.selectedFoods = this.selectedFoodIndexes;

    return data;
  }
  load(data) {
    try {
      let success = true;

      const { name, foods, selectedFoods } = data;
      this.name = name;
      foods.forEach(p => {
        const find = this.foods.find(a => a.base.baseName == p.statId && a.negative == p.negative);
        if (find) {
          find.level = p.level;
        } else {
          success = false;
          console.warn(`Can not find Food which stat-base-name: ${p.statId}, negative: ${p.negative}` );
        }
      });

      this.selectedFoodIndexes = selectedFoods;

      return {
        success
      };
    } catch(e) {
      console.warn(e);
      return {
        error: true
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
    return this.base.createSimpleStat(StatBase.TYPE_CONSTANT, this.negative ? -1 * v : v);
  }
  statTitle() {
    return this.base.title(StatBase.TYPE_CONSTANT);
  }
}

export default Foods;