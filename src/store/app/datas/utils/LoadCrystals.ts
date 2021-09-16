import ItemsSystem from '@/lib/Items';
import { Crystal, ItemObtain } from '@/lib/Items/Item';

import type { CsvData } from './DownloadDatas';

export default function(root: ItemsSystem, csvData: CsvData) {
  const NAME = 0,
    ATTRIBUTE_CATEGORY = 1,
    ATTRIBUTE_NAME = 2,
    ATTRIBUTE_VALUES = [3, 4],
    TYPE_ID = 1,
    BOSS_TYPE_ID = 1;

  let currentCrystal: Crystal;
  let currentObtain: ItemObtain;
  let currentCategory: string;
  let currentType: number;
  let currentBossType: number;
  csvData.forEach((row, index) => {
    // if ( index == 0 )
    //     return;
    if (!row[NAME] && !row[ATTRIBUTE_CATEGORY] && !row[ATTRIBUTE_NAME])
      return;
    try {
      if (row[NAME] === '0') {
        currentType = parseInt(row[TYPE_ID], 10);
        return;
      }
      if (row[NAME] === '1') {
        currentBossType = parseInt(row[BOSS_TYPE_ID], 10);
        return;
      }

      if (row[NAME] !== '' && row[ATTRIBUTE_CATEGORY] !== '') {
        currentCrystal = root.appendCrystal(row[NAME], currentType, currentBossType);
      }
      if (row[ATTRIBUTE_CATEGORY] !== '') {
        currentCategory = row[ATTRIBUTE_CATEGORY];
        if (currentCategory === 'obtain') {
          currentObtain = currentCrystal.appendObtain();
        }
      }
      const propName = row[ATTRIBUTE_NAME];
      const propValue = row[ATTRIBUTE_VALUES[0]];
      if (currentCategory === 'stats') {
        let tail = propValue.slice(-1),
          value = propValue;
        if (tail !== '%' && tail !== '~')
          tail = '';
        else
          value = propValue.slice(0, -1);
        currentCrystal.appendStat(propName, value, tail, row[ATTRIBUTE_VALUES[1]]);
      } else if (currentCategory === 'obtain') {
        if ((['name', 'map', 'dye', 'type', 'npc']).includes(propName)) {
          currentObtain[propName as keyof ItemObtain] = propValue;
        }
      } else if (currentCategory === 'other') {
        if (propName === 'enhancer') {
          currentCrystal.setEnhancer(propValue);
        }
      }
    } catch (error) {
      console.warn('[LoadCrystal] unknow error');
      console.log(row, index);
      console.log(error);
    }
  });
}
