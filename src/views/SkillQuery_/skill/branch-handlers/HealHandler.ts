import type { GetLangHandler } from '@/shared/services/Language';
import { isNumberString } from '@/shared/utils/string';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import { computeBranchValue, computedBranchHelper, HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, handleDisplayData, numberStringToPercentage } from './utils';
import MapContainer from './utils/MapContainer';
import type { HandleDisplayDataOptionFilters, HandleBranchLangAttrsMap } from './utils';

export default function HealHandler(branchItem: SkillBranchItem, { lang }: {
  lang: GetLangHandler;
  rootLang: GetLangHandler;
}) {
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    name: {
      validation: value => !!value,
      defaultValue: lang('heal/base name'),
    },
    constant: value => value !== '0',
    frequency: {
      validation: value => parseInt(value, 10) > 1,
      calc: true,
    },
  });
  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>(['duration', 'cycle', 'constant']);
  valueAttrsMap.set('frequency', lang('global/times'));

  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['type']);

  const attrs = cloneBranchAttrs(branchItem);

  const extraValueList: { text: string; value: string }[] = [];
  if (attrs['extra_value'] && attrs['extra_text']) {
    const helper = computedBranchHelper(branchItem);
    const values = attrs['extra_value'].split(/\s*,,\s*/)
      .map(item => {
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

  const displayData = handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    langHandler: lang,
  });

  displayData.customDatas.extraValueList = extraValueList;

  return displayData;
}
