import CharacterSystem from '@/lib/Character';

/**
 * @param {CharacterSystem} characterSystem
 * @param {{Array<Array<Array<string>}>>} datas
 */
export default function(characterSystem, datas) {
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

  const handleHiddenOption = value => ['永久', '變數值為0時', '計算結果為0時'].indexOf(value);

  const c = datas[0];

  let curCategory, curStat, curFormula;
  c.forEach((p, index) => {
    if (index === 0) {
      return;
    }
    if (p.every(col => col === '')) {
      return;
    }

    const id = p[ID];
    if (id === CONFIRM_CATEGORY) {
      curCategory = characterSystem.appendCharacterStatCategory(p[CATEGORY_NAME]);
    } else if (id === '') {
      curFormula.appendConditionValue(p[CONDITIONAL], p[CONDITION_VALUE], p[CONDITIONAL_OPTIONS]);
    } else {
      let [min = null, max = null] = p[LIMIT].split('~');
      min = min !== null ? parseFloat(min) : min;
      max = max !== null ? parseFloat(max) : max;
      curStat = curCategory.appendStat(id, p[NAME], p[DISPLAY_FORMULA], p[LINK], max, min, p[CAPTION], handleHiddenOption(p[HIDDEN_OPTION]));
      curFormula = curStat.setFormula(p[FORMULA]);
    }
  });
}
