import { HandleLanguageData } from '@services/Language';

export default function(character_system, datas) {
  const
    BASE_NAME = 0,
    CAPTION = 1,
    CONSTANT_FORMULA = 2,
    HAS_MULTIPLIER = 3,
    ORDER = 4,
    HIDDEN = 5,
    LANG_DATA = {
      CAPTION: 0,
      CONSTANT_FORMULA: 1,
    };

  const c = datas[0];
  // language data
  HandleLanguageData(datas, {
    [CAPTION]: LANG_DATA.CAPTION,
    [CONSTANT_FORMULA]: LANG_DATA.CONSTANT_FORMULA,
  });

  c.forEach((p, index) => {
    if (index == 0 || character_system.findStatBase(p[BASE_NAME]))
      return;
    const stat = character_system.appendStatBase(p[BASE_NAME], p[CAPTION], p[HAS_MULTIPLIER] == '無' ? false : true, parseInt(p[ORDER], 10) || 999);
    if (p[CONSTANT_FORMULA])
      stat.appendAttribute('constant_formula', p[CONSTANT_FORMULA]);
    stat.appendAttribute('hidden', p[HIDDEN] != '');
    // if ( p[MULTIPLIER_FORMULA] )
    //  stat.appendAttribute('multiplier_formula', p[MULTIPLIER_FORMULA]);
  });
}
