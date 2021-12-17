import Grimoire from '@/shared/Grimoire';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import type { HandleBranchTextAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, handleDisplayData } from './utils';
import type { HandleDisplayDataOptionFilters } from './utils';
import MapContainer from './utils/MapContainer';

export default function ProrationHandler(branchItem: SkillBranchItem) {
  const { t } = Grimoire.i18n;

  const attrs = cloneBranchAttrs(branchItem, {
    condition: t('skill-query.branch.next.condition-default-value'),
    name: t('skill-query.branch.effect.base-name'),
  });

  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>(['caption']);
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    condition: value => value !== 'none',
  });

  return handleDisplayData(branchItem, attrs, {
    texts: textAttrsMap.value,
    filters: filters.value,
  });
}
