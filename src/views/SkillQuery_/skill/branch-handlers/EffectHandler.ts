import type { GetLangHandler } from '@/shared/services/Language';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import type { HandleBranchTextAttrsMap, HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, handleDisplayData } from './utils';
import type { HandleBranchLangAttrsMap, HandleDisplayDataOptionFilters } from './utils';
import MapContainer from './utils/MapContainer';

export default function EffectHandler(branchItem: SkillBranchItem, { lang }: {
  lang: GetLangHandler;
}) {
  const attrs = cloneBranchAttrs(branchItem);

  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>({
    radius: 'm',
    duration: {
      beforeHighlight: value => lang('display duration', [value]),
    },
  });
  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>(['caption', 'condition', 'end_condition']);
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    condition: value => value !== 'none',
    type: value => value !== 'none',
    is_place: value => value !== '0',
    name: {
      validation: value => value !== 'none',
      defaultValue: lang('effect/base name'),
    },
    start_position_offsets: {
      validation: value => value !== '0',
      calc: true,
    },
    end_position_offsets: {
      validation: value => value !== '0',
      calc: true,
    },
  });

  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['is_place', 'type', 'effective_area']);
  if (['auto', 'hit'].includes(attrs['condition'])) {
    langAttrsMap.append('condition');
  }

  const labels = ['effective_area', 'radius'];

  return handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    texts: textAttrsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    labels,
    langHandler: lang,
  });
}
