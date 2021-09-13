import { EnchantItem } from '@/lib/Enchant/Enchant';

export default function LoadEnchantData(root, csvData) {
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

  const handleItemValue = (value) => value !== '' ? parseFloat(value) : null;

  const handleLimit = (str) => {
    if (str === '')
      return [null, null];
    const limitStrs = str.split('::');
    const l1 = handleItemValue(limitStrs[0]);
    const l2 = limitStrs[1] === undefined ? (l1 !== null ? -1 * l1 : l1) : handleItemValue(limitStrs[1]);
    return [l1, l2];
  };

  const handleUnitValue = (str) => {
    const [str1, str2] = str.split('|');
    const v1 = str1 ? parseInt(str1) : 1;
    const v2 = str2 ? parseInt(str2) : v1;
    return [v1, v2];
  };

  const processItemProps = (targetRow) => {
    return [
      handleItemValue(targetRow[POTENTIAL_CONSTANT]),
      handleItemValue(targetRow[POTENTIAL_MULTIPLIER]),
    ];
  };

  let currentCategory, currentItem;
  csvData.forEach((row, idx) => {
    if (idx === 0)
      return;
    if (row[STAT_ID] === '') {
      const check = row[CHECK];
      if (check === '')
        return;
      if (check === '0') {
        currentCategory = root.appendCategory(row[CATEGORY_TITLE]);
        if (row[CATEGORY_EXTRA] === 'weapon-only')
          currentCategory.setWeaponOnly();
        return;
      }
      const conditionId = CONDITION_LIST.indexOf(row[CONDITION]);
      if (conditionId !== -1) {
        const cond = [
          EnchantItem.CONDITION_MAIN_WEAPON,
          EnchantItem.CONDITION_BODY_ARMOR,
          EnchantItem.CONDITION_ORIGINAL_ELEMENT,
        ][conditionId];
        currentItem.appendConditionalProps(cond, { potential: processItemProps(row) });
      }
    } else {
      currentItem = currentCategory
        .appendItem({
          baseName: row[STAT_ID],
          limit: [
            handleLimit(row[LIMIT_CONSTANT]),
            handleLimit(row[LIMIT_MULTIPLIER]),
          ],
          unitValue: [
            handleUnitValue(row[UNIT_VALUE_CONSTANT]),
            handleUnitValue(row[UNIT_VALUE_MULTIPLIER])],
          materialPointType: MATERIAL_POINT_TYPE_LIST.indexOf(row[MATERIAL_POINT_TYPE]),
          materialPointValue: [
            handleItemValue(row[MATERIAL_POINT_VALUE_CONSTANT]),
            handleItemValue(row[MATERIAL_POINT_VALUE_MULTIPLIER]),
          ],
          potentialConvertThreshold: [
            handleItemValue(row[POTENTIAL_CONVERT_THRESHOLD_CONSTANT]),
            handleItemValue(row[POTENTIAL_CONVERT_THRESHOLD_MULTIPLIER]),
          ],
          potential: processItemProps(row),
        });
    }
  });
}
