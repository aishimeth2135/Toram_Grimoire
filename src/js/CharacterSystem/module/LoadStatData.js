import {ProcessLanguageData} from "../../main/module/LanguageSystem.js";

export default function(character_system, c, lang_c, slang_c){
	const
		BASE_NAME = 0,
		CAPTION = 1,
		HAS_MULTIPLIER = 2,
		CONSTANT_FORMULA = 3,
		ORDER = 11,
		LANG_DATA = {
			CAPTION: 0,
			CONSTANT_FORMULA: 1
		};

	const datas = [c, lang_c, slang_c];
	// language data
	ProcessLanguageData(datas, CAPTION, LANG_DATA.CAPTION);
	ProcessLanguageData(datas, CONSTANT_FORMULA, LANG_DATA.CONSTANT_FORMULA);

	c.forEach((p, index) => {
		if ( index == 0 )
			return;
		const stat = character_system.appendStatBase(p[BASE_NAME], p[CAPTION], p[HAS_MULTIPLIER] == '無' ? false : true, p[ORDER] || 999);
		if ( p[CONSTANT_FORMULA] )
			stat.appendAttribute('constant_formula', p[CONSTANT_FORMULA]);
		// if ( p[MULTIPLIER_FORMULA] )
		// 	stat.appendAttribute('multiplier_formula', p[MULTIPLIER_FORMULA]);
	});
};