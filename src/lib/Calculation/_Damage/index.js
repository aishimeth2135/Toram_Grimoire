import { CalcItemBase, Calculation, CalcItemContainer } from "./Calculation";

export default class {
  constructor() {
    this.itemBases = [];
    this.init();
  }
  init() {
    const fac = (id, title, unit) => {
      return new CalcItemBase(id, title, unit);
    };
    this.itemBases.push(
      fac()
    );
  }
  createCalculation(name) {
    const calculation = new Calculation(name);

    calculation.appendContainer('atk', CalcItemContainer.CATEGORY_ADD);

    return calculation;
  }
}
