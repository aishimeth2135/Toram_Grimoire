import {Equipment} from "./ItemElements.js";
import Grimoire from "../../main/Grimoire.js";

export default function(c){
    const NAME = 0,
        CATEGORY = 1,
        BASE_VALUE = 2,
        BASE_STABILITY = 3,
        ATTRIBUTE_CATEGORY = 4,
        ATTRIBUTE_NAME = 5,
        ATTRIBUTE_VALUES = [6, 7],
        CAPTION = 8;
    let cur, cur_equip, cur_attrcat;
    c.forEach((p, index) => {
        if ( index == 0 ) return;
        if ( p[NAME] !== '' && p[CATEGORY] !== '' ){
            cur = new Equipment(p[NAME], p[CATEGORY], p[BASE_VALUE], p[BASE_STABILITY], p[CAPTION]);
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
                if ( tail !== '%' || tail !== '~' )
                    tail = '';
                else
                    v = t.slice(0, -1);
                cur_equip.appendStat(p[ATTRIBUTE_NAME], v, tail, p[ATTRIBUTE_VALUES[1]]);
            } break;
            case 'obtain':
            case 'recipe':
                cur[p[ATTRIBUTE_NAME]] = p[ATTRIBUTE_VALUES[0]];
        }
    });
}