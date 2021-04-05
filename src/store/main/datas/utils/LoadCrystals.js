export default function(root, c) {
  const NAME = 0,
    ATTRIBUTE_CATEGORY = 1,
    ATTRIBUTE_NAME = 2,
    ATTRIBUTE_VALUES = [3, 4],
    TYPE_ID = 1,
    BOSS_TYPE_ID = 1;

  let cur, cur_crystal, cur_attrcat, cur_type, cur_boss_type;
  c.forEach((p, index) => {
    // if ( index == 0 )
    //     return;
    if (!p[NAME] && !p[ATTRIBUTE_CATEGORY] && !p[ATTRIBUTE_NAME])
        return;
    try {
      if (p[NAME] == '0') {
        cur_type = parseInt(p[TYPE_ID], 10);
        return;
      }
      if (p[NAME] == '1') {
        cur_boss_type = parseInt(p[BOSS_TYPE_ID], 10);
        return;
      }

      if (p[NAME] !== '' && p[ATTRIBUTE_CATEGORY] !== '') {
        cur = root.appendCrystal(p[NAME], cur_type, cur_boss_type);
        cur_crystal = cur;
      }
      if (p[ATTRIBUTE_CATEGORY] !== '')
        cur_attrcat = p[ATTRIBUTE_CATEGORY];
      switch (p[ATTRIBUTE_CATEGORY]) {
        case 'obtain':
          cur = cur_crystal.appendObtain();
          break;
        case 'other':
          cur = null;
          break;
      }
      switch (cur_attrcat) {
        case 'stats':
          {
            const t = p[ATTRIBUTE_VALUES[0]];
            let tail = t.slice(-1),
              v = t;
            if (tail !== '%' && tail !== '~')
              tail = '';
            else
              v = t.slice(0, -1);
            cur_crystal.appendStat(p[ATTRIBUTE_NAME], parseFloat(v), tail, p[ATTRIBUTE_VALUES[1]]);
          }
          break;
        case 'obtain':
          cur[p[ATTRIBUTE_NAME]] = p[ATTRIBUTE_VALUES[0]];
          break;
        case 'other':
          if (p[ATTRIBUTE_NAME] == 'enhancer')
            cur_crystal.setEnhancer(p[ATTRIBUTE_VALUES[0]]);
      }
    } catch (e) {
      console.log(p, index);
      console.log(e);
    }
  });
}