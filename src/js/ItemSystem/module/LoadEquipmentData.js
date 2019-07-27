import Grimoire from "../../main/Grimoire.js";
import {Prop} from "./ItemElements.js";

export default function(root, c){
    const NAME = 0,
        CATEGORY = 1,
        BASE_VALUE = 2,
        BASE_STABILITY = 3,
        ATTRIBUTE_CATEGORY = 4,
        ATTRIBUTE_NAME = 5,
        ATTRIBUTE_VALUES = [6, 7],
        CAPTION = 8,
        CATEGORY_LIST = ['單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '箭矢', '盾牌', '小刀', '身體裝備', '追加裝備', '特殊裝備'];

    function processMaterails(s){
        const ms = [];
        const mat_pt_list = ['金屬', '布料', '藥品', '獸品', '木材','魔素']
        const list = s.split(/\s*,\s*/);
        list.forEach(a => {
            const t = a.split('#');
            const n = t[0], v = t[1];
            if ( n && v ){
                const type = mat_pt_list.indexOf(n) != -1 ? Prop.CATEGORY_MATERIAL_POINT : Prop.CATEGORY_MATERIAL;
                ms.push(new Prop(n, v, type));
            }
        });
        return ms;
    }

    let cur, cur_equip, cur_attrcat;
    c.forEach((p, index) => {
        if ( index == 0 ) return;
        if ( p[NAME] !== '' && p[CATEGORY] !== '' ){
            cur = root.appendEquipment(p[NAME], CATEGORY_LIST.indexOf(p[CATEGORY]), p[BASE_VALUE], p[BASE_STABILITY], p[CAPTION]);
            cur_equip = cur;
        }
        if ( p[ATTRIBUTE_CATEGORY] !== '' )
            cur_attrcat = p[ATTRIBUTE_CATEGORY];
        switch ( p[ATTRIBUTE_CATEGORY] ) {
            case 'obtain':
                cur = cur_equip.appendObtain();
                break;
            case 'recipe':
                cur = cur_equip.setRecipe();
                break;
        }
        switch (cur_attrcat){
            case 'stats': {
                const t = p[ATTRIBUTE_VALUES[0]];
                let tail = t.slice(-1), v = t;
                if ( tail !== '%' && tail !== '~' )
                    tail = '';
                else
                    v = t.slice(0, -1);
                cur_equip.appendStat(p[ATTRIBUTE_NAME], v, tail, p[ATTRIBUTE_VALUES[1]]);
            } break;
            case 'obtain':
                cur[p[ATTRIBUTE_NAME]] = p[ATTRIBUTE_VALUES[0]];
                break;
            case 'recipe':
                cur[p[ATTRIBUTE_NAME]] = p[ATTRIBUTE_NAME] != 'materials' ? p[ATTRIBUTE_VALUES[0]] : processMaterails(p[ATTRIBUTE_VALUES[0]]);
        }
    });
}