import {CalcItemBase} from "./module/CalcElements.js";
import DamageCalculationController from "./module/Controller.js";

import {GetLang, InitLanguageData} from "../../main/module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";


export default class DamageCalculationSystem {
    constructor(){
        this.calcItemList = [];
    }
    init(node){
        InitLanguageData({zh_tw, en, ja, zh_cn});

        const p = (lid, u) => {
            const t = new CalcItemBase(lid, GetLang('Damage Calculation/Calc Item Base Text/' + lid), u);
            this.calcItemList.push(t);
            return t;
        };
        const p0 = (lid, u) => p(lid, u || '');
        const p1 = (lid, u) => p(lid, u || '%');

        p('physical_damage');
        p('magic_damage');
        p0('atk')
            .initDefaultValue(1000);
        p0('matk')
            .initDefaultValue(1000);
        p0('sub_atk');
        p0('sub_atk_multiplier', '%');
        p0('two_handed_skill_level')
            .initRange(0, 10);
        p0('character_level')
            .initRange(1, 200)
            .initDefaultValue(100);
        p0('target_level')
            .initRange(1, 500)
            .initDefaultValue(100);
        p0('target_def');
        p0('target_mdef');
        p0('physical_pierce', '%');
        p0('magic_pierce', '%');
        p0('skill_constant');
        p0('unsheathe_attack');
        p0('skill_constant_str', '%');
        p0('skill_constant_dex', '%');
        p0('skill_constant_agi', '%');
        p0('skill_constant_int', '%');
        p0('skill_constant_vit', '%');
        p0('dagger_atk');
        p0('other_constant');

        p1('skill_multiplier')
            .initRange(1)
            .initDefaultValue(100);
        p0('skill_multiplier_str', '%');
        p0('skill_multiplier_dex', '%');
        p0('skill_multiplier_agi', '%');
        p0('skill_multiplier_int', '%');
        p0('skill_multiplier_vit', '%');
        p1('critical_damage')
            .initRange(0)
            .initDefaultValue(150);
        p1('critical_rate')
            .initRange(0, 400)
            .initDefaultValue(25);
        p1('short_range_damage');
        p1('long_range_damage');
        p1('unsheathe_attack_multiplier');
        p('netural_element');
        p('fire_element');
        p('water_element');
        p('earth_element');
        p('wind_element');
        p('light_element');
        p('dark_element');

        p1('stronger_against_neutral');
        p1('stronger_against_fire');
        p1('stronger_against_water');
        p1('stronger_against_earth');
        p1('stronger_against_wind');
        p1('stronger_against_light');
        p1('stronger_against_dark');

        p1('target_neutral_resistance')
            .initRange(null, 99);
        p1('target_fire_resistance')
            .initRange(null, 99);
        p1('target_water_resistance')
            .initRange(null, 99);
        p1('target_earth_resistance')
            .initRange(null, 99);
        p1('target_wind_resistance')
            .initRange(null, 99);
        p1('target_light_resistance')
            .initRange(null, 99);
        p1('target_dark_resistance')
            .initRange(null, 99);

        p1('poration')
            .initRange(-50, 150, 5);
        p1('target_physical_resistance')
            .initRange(null, 99);
        p1('target_magic_resistance')
            .initRange(null, 99);
        p1('combo_multiplier')
            .initRange(10, 150)
            .initDefaultValue(100);
        p1('other_multiplier')
            .initDefaultValue(100);
        p1('stability')
            .initRange(1, 100)
            .initDefaultValue(50);
        p1('probability_of_graze')
            .initRange(0, 100);

        this.controller = new DamageCalculationController(this);
        this.controller.init(node);

        return this;
    }
    getCalcItemBase(id){
        try {
            const t = this.calcItemList.find(p => p.id == id);
            if ( !t )
                throw new Error("Can't find CalcItemBase of id: " + id);
            return t;
        }
        catch (e){
            console.warn(e.message);
            console.log(e.stack);
            return null;
        }
    }
}