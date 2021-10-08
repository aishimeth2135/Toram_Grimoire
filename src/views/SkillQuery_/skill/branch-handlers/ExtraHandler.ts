import type { GetLangHandler } from '@/shared/services/Language';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import type { HandleBranchTextAttrsMap, HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, handleDisplayData } from './utils';
import MapContainer from './utils/MapContainer';
import type { HandleDisplayDataOptionFilters } from './utils';

export default function ExtraHandler(branchItem: SkillBranchItem, { lang }: {
  lang: GetLangHandler;
  rootLang: GetLangHandler;
}) {
  const mainBranch = branchItem.mainBranch;
  if (!mainBranch) {
    return {} as Record<string, string>;
  }
  const filters = new MapContainer<HandleDisplayDataOptionFilters>();
  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>();
  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>();

  if (mainBranch.name === 'damage') {
    valueAttrsMap.set('ailment_chance', '%');
    filters.set('condition', {
      validation: value => !!value,
      defaultValue: lang('global suffix: extra/condition default'),
    });
    textAttrsMap.append('caption');
    textAttrsMap.append('condition');
  } else if (['effect', 'next', 'passive'].includes(branchItem.name)) {
    filters.set('condition', {
      validation: value => !!value,
      defaultValue: lang('global suffix: extra/condition default'),
    });
    textAttrsMap.append('caption');
    textAttrsMap.append('condition');
  }

  const attrs = cloneBranchAttrs(branchItem);

  return handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    texts: textAttrsMap.value,
    filters: filters.value,
    langHandler: lang,
  });
}
