import { CharacterStatCategory } from "@/lib/Character/Character";

export default function(character_system, datas) {
  const ID = 0,
    NAME = 1,
    DISPLAY_FORMULA = 2,
    LINK = 3,
    FORMULA = 5,
    LIMIT = 6,
    HIDDEN_OPTION = 7,
    CAPTION = 8,
    CONDITIONAL = 3,
    CONDITIONAL_OPTIONS = 4,
    CONDITION_VALUE = 5,
    CONFIRM_CATEGORY = '0',
    CATEGORY_NAME = 1;

  const handleHiddenOption = v => ['永久', '變數值為0時', '計算結果為0時'].indexOf(v);

  const c = datas[0];

  let cur_category, cur_stat, cur_formula;
  c.forEach((p, index) => {
    if (index == 0)
      return;

    const id = p[ID];
    if (id == CONFIRM_CATEGORY) {
      cur_category = new CharacterStatCategory(p[CATEGORY_NAME]);
      character_system.characterStatCategoryList.push(cur_category);
    } else if (id == '') {
      cur_formula.appendConditionValue(p[CONDITIONAL], p[CONDITION_VALUE], p[CONDITIONAL_OPTIONS]);
    } else {
      let [min = null, max = null] = p[LIMIT].split('~');
      min = min !== null ? parseFloat(min) : min;
      max = max !== null ? parseFloat(max) : max;
      cur_stat = cur_category.appendStat(id, p[NAME], p[DISPLAY_FORMULA], p[LINK], max, min, p[CAPTION], handleHiddenOption(p[HIDDEN_OPTION]));
      cur_formula = cur_stat.setFormula(p[FORMULA]);
    }
  });
}
