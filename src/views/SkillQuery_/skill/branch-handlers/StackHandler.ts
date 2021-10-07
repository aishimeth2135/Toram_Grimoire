import type { GetLangHandler } from '@/shared/services/Language';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';

import { cloneBranchAttrs, handleDisplayData } from './utils';
import type { HandleDisplayDataOptionFilters } from './utils';
import MapContainer from './utils/MapContainer';

export default function StackHandler(branchItem: SkillBranchItem, { lang }: {
  lang: GetLangHandler;
}) {
  const attrs = cloneBranchAttrs(branchItem);

  if (attrs['default'] === 'auto') {
    attrs['default'] = attrs['min'];
  }
  const pureValues = ['min', 'max', 'default'];

  const idx = branchItem.parent.branchItems
    .filter(item => item.name === 'stack')
    .indexOf(branchItem);
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    name: {
      validation: value => !!value && value !== 'auto',
      defaultValue: lang('stack/base name') + (idx + 1),
    },
  });

  return handleDisplayData(branchItem, attrs, {
    filters: filters.value,
    pureValues,
  });
}
