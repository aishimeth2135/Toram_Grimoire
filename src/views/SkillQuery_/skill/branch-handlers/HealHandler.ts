import { isNumberString } from '@/shared/utils/string';
import Grimoire from '@/shared/Grimoire';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import { computeBranchValue, computedBranchHelper, HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, handleDisplayData, numberStringToPercentage } from './utils';
import MapContainer from './utils/MapContainer';
import type { HandleDisplayDataOptionFilters, HandleBranchLangAttrsMap } from './utils';

export default function HealHandler(branchItem: SkillBranchItem) {
  const { t } = Grimoire.i18n;

  const attrs = cloneBranchAttrs(branchItem, {
    name: t('skill-query.branch.heal.base-name'),
  });

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    constant: value => value !== '0',
    frequency: {
      validation: value => parseInt(value, 10) > 1,
      calc: true,
    },
  });
  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>(['duration', 'cycle', 'constant']);
  valueAttrsMap.set('frequency', t('global.times'));

  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['type']);

  const extraValueList: { text: string; value: string }[] = [];
  if (attrs['extra_value'] && attrs['extra_text']) {
    const originalValues = attrs['extra_value'].split(/\s*,,\s*/);
    const helper = computedBranchHelper(branchItem, originalValues);
    const values = originalValues.map(item => {
      let res = computeBranchValue(item, helper);
      if (isNumberString(res)) {
        res = numberStringToPercentage(res);
      }
      return res;
    });
    const texts = attrs['extra_text'].split(/\s*,\s*/);
    extraValueList.push(...values.map((value, idx) => ({
      text: texts[idx] || '@',
      value,
    })));
  }

  const pureDatas = ['name'];

  const displayData = handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  });

  displayData.customDatas.extraValueList = extraValueList;

  return displayData;
}
