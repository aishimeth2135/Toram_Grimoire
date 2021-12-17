import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import type { HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, HandleBranchLangAttrsMap, handleDisplayData } from './utils';
import MapContainer from './utils/MapContainer';
import type { HandleDisplayDataOptionFilters } from './utils';
import { createTagButtons } from '../../utils';

export default function ExtraHandler(branchItem: SkillBranchItem) {

  const attrs = cloneBranchAttrs(branchItem);

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    'mp_cost': value => !!value,
    'range': value => !!value,
    'skill_type': value => !!value,
    'in_combo': value => !!value,
    'action_time': value => !!value,
    'casting_time': value => !!value,
  });
  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>({
    'casting_time': 's',
  });
  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>({
    'skill_type': { type: 'normal' },
    'in_combo': { type: 'normal' },
    'action_time': { type: 'normal' },
  });

  if (attrs['mp_cost'] !== '0') {
    valueAttrsMap.append('mp_cost');
  } else {
    langAttrsMap.append('mp_cost');
  }
  if (attrs['range'] === 'main') {
    langAttrsMap.set('range', { afterHandle: value => createTagButtons(value) });
  } else if (attrs['range'] === 'no_limit') {
    langAttrsMap.append('range');
  } else {
    valueAttrsMap.set('range', 'm');
  }

  return handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
  });
}
