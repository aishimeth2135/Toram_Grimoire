import {CharacterStatCategory, CharacterStat} from "./class/main.js";

export default function (character_system, c, lang_c, slang_c){
    const ID = 0,
        NAME = 1,
        UNIT = 2,
        LINK = 3,
        FORMULA = 4,
        MAX = 5,
        MIN = 6,
        HIDDEN_OPTION = 7,
        CAPTION = 8,
        CONDITIONAL = 3,
        CONDITION_VALUE = 4,
        CONFIRM_CATEGORY = '0',
        CATEGORY_NAME = 1;

    function handleHiddenOption(v){
        return ['永久', '變數值為0時'].indexOf(v);
    }

    let cur_category, cur_stat, cur_formula;
    c.forEach((p, index) => {
        if ( index == 0 )
            return;

        const id = p[ID];
        if ( id == CONFIRM_CATEGORY ){
            cur_category = new CharacterStatCategory(p[CATEGORY_NAME]);
            character_system.characterStatCategoryList.push(cur_category);
        }
        else if ( id == '' ){
            cur_formula.appendConditionValue(p[CONDITIONAL], p[CONDITION_VALUE]);
        }
        else {
            const max = p[MAX] === '' ? null : p[MAX],
                min = p[MIN] === '' ? null : p[MIN];
            cur_stat = cur_category.appendStat(id, p[NAME], p[UNIT], p[LINK], max, min, p[CAPTION], handleHiddenOption(p[HIDDEN_OPTION]));
            cur_formula = cur_stat.setFormula(p[FORMULA]);
        }
    });
};