import {EnchantItemBase} from "./EnchantElement.js";


export default function LoadEnchantData(r, c){
    const STAT_ID = 0,
        CONDITION = 1,
        CONDITION_LIST = ['主手武器', '身體裝備', '原有屬性'],
        CONSTANT_POTENTIAL = 2,
        CONSTANT_LIMIT = 3,
        MULTIPLIER_POTENTIAL = 4,
        MULTIPLIER_LIMIT = 5,
        UNIT_VALUE = 6,
        MATERIAL_POINT_TYPE = 7,
        MATERIAL_POINT_TYPE_LIST = ['金屬' ,'獸品', '木材', '布料','藥品', '魔素'],
        MATERIAL_POINT_CONSTANT_VALUE = 8,
        MATERIAL_POINT_MULTIPLIER_VALUE = 9,
        CHECK = 1,
        CATEGORY_TITLE = 2;

    function processLimit(s){
        if ( s === '' )
            return s;
        s = s.split('::').map(a => parseInt(a));
        return [s[0], s[1] || -1*s[0]];
    }
    function processItemAttribute(p){
        return [
            parseInt(p[CONSTANT_POTENTIAL]),
            parseInt(p[MULTIPLIER_POTENTIAL])
        ];
    }

    let cur_cat, cur_item;
    c.forEach((p, i) => {
        if ( i == 0 )
            return;
        if ( p[STAT_ID] === '' ){
            const check = p[CHECK];
            if ( check === '' )
                return;
            if ( check == '0' ){
                cur_cat = r.appendCategory(p[CATEGORY_TITLE]);
                return;
            }
            const condition_no = CONDITION_LIST.indexOf(p[CONDITION]);
            if ( condition_no != -1 ){
                const cond = [
                    EnchantItemBase.CONDITION_MAIN_WEAPON,
                    EnchantItemBase.CONDITION_BODY_ARMOR,
                    EnchantItemBase.CONDITION_ORIGINAL_ELEMENT
                ][condition_no];
                cur_item.appendConditionalAttributes(cond, ...processItemAttribute(p));
            }
        }
        else {
            cur_item = cur_cat
            .appendItem(
                p[STAT_ID],
                processLimit(p[CONSTANT_LIMIT]),
                processLimit(p[MULTIPLIER_LIMIT]),
                parseInt(p[UNIT_VALUE]),
                MATERIAL_POINT_TYPE_LIST.indexOf(p[MATERIAL_POINT_TYPE]),
                p[MATERIAL_POINT_CONSTANT_VALUE],
                p[MATERIAL_POINT_MULTIPLIER_VALUE]
            )
            .initAttributes(...processItemAttribute(p));
        }
    });
}