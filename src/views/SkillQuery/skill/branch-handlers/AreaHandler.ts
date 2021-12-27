import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import { HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';
import { SkillBranchNames } from '@/lib/Skill/Skill/enums';
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer/enums';

import { cloneBranchAttrs, HandleBranchLangAttrsMap, handleDisplayData } from './utils';
import type { HandleDisplayDataOptionFilters } from './utils';
import MapContainer from './utils/MapContainer';

export default function AreaHandler(branchItem: SkillBranchItem, formulaDisplayMode?: FormulaDisplayModes) {
  const attrs = cloneBranchAttrs(branchItem);

  const basicBranch = branchItem.parent.branchItems.find(bch => bch.name === SkillBranchNames.Basic);
  attrs['@range'] = basicBranch?.attr('range') ?? '';

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    'move_distance': value => !!value,
    'angle': value => !!value,
    start_position_offsets: {
      validation: value => value !== '0',
      calc: true,
    },
    end_position_offsets: {
      validation: value => value !== '0',
      calc: true,
    },
  });

  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>({
    'angle': '°',
    'start_position_offsets': 'm',
    'end_position_offsets': 'm',
    'move_distance': 'm',
  });

  if (attrs['effective_area'] !== 'sector') {
    valueAttrsMap.append('radius', 'm');
  }

  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['effective_area']);

  const pureValues = [];
  if (attrs['@range'] && attrs['@range'] !== 'no_limit' && attrs['@range'] !== 'main') {
    pureValues.push('@range');
  }

  const titles = formulaDisplayMode === FormulaDisplayModes.Normal ? [] : [
    'effective_area',
    'radius',
    'move_distance',
    'angle',
    'start_position_offsets',
    'end_position_offsets',
  ];

  const pureDatas = ['target_offsets', 'end_position'];

  return handleDisplayData(branchItem, attrs, {
    filters: filters.value,
    values: valueAttrsMap.value,
    langs: langAttrsMap.value,
    titles,
    pureValues,
    pureDatas,
    formulaDisplayMode,
  });
}
