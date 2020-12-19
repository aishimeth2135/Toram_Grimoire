import { EnchantItemBase } from "./EnchantElement.js";


export default function LoadEnchantData(r, c) {
  const STAT_ID = 0,
    CONDITION = 1,
    CONDITION_LIST = ['主手武器', '身體裝備', '原有屬性'],
    POTENTIAL_CONSTANT = 2,
    LIMIT_CONSTANT = 3,
    POTENTIAL_MULTIPLIER = 4,
    LIMIT_MULTIPLIER = 5,
    UNIT_VALUE_CONSTANT = 6,
    UNIT_VALUE_MULTIPLIER = 7,
    MATERIAL_POINT_TYPE = 8,
    MATERIAL_POINT_TYPE_LIST = ['金屬', '獸品', '木材', '布料', '藥品', '魔素'],
    MATERIAL_POINT_VALUE_CONSTANT = 9,
    MATERIAL_POINT_VALUE_MULTIPLIER = 10,
    POTENTIAL_CONVERT_THRESHOLD_CONSTANT = 11,
    POTENTIAL_CONVERT_THRESHOLD_MULTIPLIER = 12,
    CHECK = 1,
    CATEGORY_TITLE = 2,
    CATEGORY_EXTRA = 3;

  function processLimit(s) {
    if (s === '')
      return ['', ''];
    s = s.split('::');
    const l1 = s[0] ? parseInt(s[0], 10) : s[0];
    const l2 = s[1] === void 0 ? (typeof s[0] == 'number' ? -1 * s[0]: s[0]) : s[1];
    return [l1, l2];
  }

  function processItemAttribute(p) {
    return [
      parseInt(p[POTENTIAL_CONSTANT]),
      parseInt(p[POTENTIAL_MULTIPLIER])
    ];
  }

  let cur_cat, cur_item;
  c.forEach((p, i) => {
    if (i == 0)
      return;
    if (p[STAT_ID] === '') {
      const check = p[CHECK];
      if (check === '')
        return;
      if (check == '0') {
        cur_cat = r.appendCategory(p[CATEGORY_TITLE]);
        if (p[CATEGORY_EXTRA] == 'weapon-only')
          cur_cat.status['isWeaponOnly'] = true;
        return;
      }
      const condition_no = CONDITION_LIST.indexOf(p[CONDITION]);
      if (condition_no != -1) {
        const cond = [
          EnchantItemBase.CONDITION_MAIN_WEAPON,
          EnchantItemBase.CONDITION_BODY_ARMOR,
          EnchantItemBase.CONDITION_ORIGINAL_ELEMENT
        ][condition_no];
        cur_item.appendConditionalAttributes(cond, ...processItemAttribute(p));
      }
    } else {
      cur_item = cur_cat
        .appendItem({
          baseName: p[STAT_ID],
          limit: [processLimit(p[LIMIT_CONSTANT]), processLimit(p[LIMIT_MULTIPLIER])],
          unitValue: [p[UNIT_VALUE_CONSTANT], p[UNIT_VALUE_MULTIPLIER]],
          materialPointType: MATERIAL_POINT_TYPE_LIST.indexOf(p[MATERIAL_POINT_TYPE]),
          materialPointValue: [p[MATERIAL_POINT_VALUE_CONSTANT], p[MATERIAL_POINT_VALUE_MULTIPLIER]],
          potentialConvertThreshold: [p[POTENTIAL_CONVERT_THRESHOLD_CONSTANT], p[POTENTIAL_CONVERT_THRESHOLD_MULTIPLIER]]
        })
        .initAttributes(...processItemAttribute(p));
    }
  });
}