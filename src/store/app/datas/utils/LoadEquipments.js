import { Prop } from '@/lib/Items/Item';

export default function(root, c) {
  const NAME = 0,
    CATEGORY = 1,
    BASE_VALUE = 2,
    BASE_STABILITY = 3,
    ATTRIBUTE_CATEGORY = 4,
    ATTRIBUTE_NAME = 5,
    ATTRIBUTE_VALUES = [6, 7],
    CAPTION = 8,
    CATEGORY_LIST = {
      '單手劍': 0, '雙手劍': 1, '弓': 2, '弩': 3, '法杖': 4,
      '魔導具': 5, '拳套': 6, '旋風槍': 7, '拔刀劍': 8,
      '箭矢': 100, '小刀': 101, '忍術卷軸': 102,
      '盾牌': 200,
      '身體裝備': 300,
      '追加裝備': 400,
      '特殊裝備': 500,
    };

  function processMaterails(s) {
    const ms = [];
    const mat_pt_list = ['金屬', '布料', '藥品', '獸品', '木材', '魔素'];
    const list = s.split(/\s*,\s*/);
    list.forEach(a => {
      const t = a.split('#');
      const n = t[0],
        v = t[1];
      if (n && v) {
        const type = mat_pt_list.indexOf(n) != -1 ? Prop.CATEGORY_MATERIAL_POINT : Prop.CATEGORY_MATERIAL;
        ms.push(new Prop(n, v, type));
      }
    });
    return ms;
  }

  let cur, cur_equip, cur_attrcat;
  c.forEach((p, index) => {
    if (!p || index === 0 || p.every(a => a === '')) {
      return;
    }
    try {
      if (p[NAME] !== '' && p[CATEGORY] !== '') {
        const type = CATEGORY_LIST[p[CATEGORY]];
        cur = root.appendEquipment(p[NAME], type === undefined ? -1 : type,
          p[BASE_VALUE], p[BASE_STABILITY], p[CAPTION]);
        if (type === undefined) {
          cur.unknowCategory = p[CATEGORY];
        }
        cur_equip = cur;
      }
      if (p[ATTRIBUTE_CATEGORY] !== '')
        cur_attrcat = p[ATTRIBUTE_CATEGORY];
      switch (p[ATTRIBUTE_CATEGORY]) {
      case 'obtain':
        cur = cur_equip.appendObtain();
        break;
      case 'recipe':
        cur = cur_equip.setRecipe();
        break;
      case 'extra':
        cur = cur_equip.setExtra();
      }
      if (cur_attrcat === 'stats') {
        const t = p[ATTRIBUTE_VALUES[0]];
        let tail = t.slice(-1),
          v = t;
        if (tail !== '%' && tail !== '~')
          tail = '';
        else
          v = t.slice(0, -1);
        cur_equip.appendStat(p[ATTRIBUTE_NAME], v, tail, p[ATTRIBUTE_VALUES[1]]);
      } else if (cur_attrcat === 'obtain' || cur_attrcat === 'extra') {
        cur[p[ATTRIBUTE_NAME]] = p[ATTRIBUTE_VALUES[0]];
      } else if (cur_attrcat === 'recipe') {
        cur[p[ATTRIBUTE_NAME]] = p[ATTRIBUTE_NAME] != 'materials' ? p[ATTRIBUTE_VALUES[0]] : processMaterails(p[ATTRIBUTE_VALUES[0]]);
      }
    } catch (e) {
      console.log(p, index);
      console.log(e);
    }
  });
}
