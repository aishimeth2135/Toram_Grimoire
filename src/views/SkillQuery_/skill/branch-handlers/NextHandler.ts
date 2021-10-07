import type { GetLangHandler } from '@/shared/services/Language';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import type { HandleBranchTextAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, handleDisplayData } from './utils';
import type { HandleDisplayDataOptionFilters } from './utils';
import MapContainer from './utils/MapContainer';

export default function ProrationHandler(branchItem: SkillBranchItem, { lang }: {
  lang: GetLangHandler;
}) {
  const attrs = cloneBranchAttrs(branchItem);

  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>(['caption']);
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    condition: {
      validation: value => value !== 'none',
      defaultValue: lang('next/condition default'),
    },
    name: {
      validation: value => !!value,
      defaultValue: lang('effect/base name'),
    },
  });

  return handleDisplayData(branchItem, attrs, {
    texts: textAttrsMap.value,
    filters: filters.value,
  });
}
