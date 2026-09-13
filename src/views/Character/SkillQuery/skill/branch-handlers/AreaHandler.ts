import { SkillBranchNames } from '@/lib/Skill/Skill'
import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputing'
import { type HandleBranchValuePropsMap } from '@/lib/Skill/SkillComputing/compute'

import {
  type HandleBranchLangPropsMap,
  type HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import MapContainer from './handle/MapContainer'

export default function AreaHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem,
  formulaDisplayMode?: FormulaDisplayModes
) {
  const props = cloneBranchProps(branchItem)

  const basicBranch = branchItem.parent.branchItems.find(bch => bch.is(SkillBranchNames.Basic))
  props.set('@range', basicBranch?.prop('range') ?? '')

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    move_distance: value => !!value,
    angle: value => !!value,
    start_position_offsets: {
      validation: value => value !== '0',
      calc: true,
    },
    end_position_offsets: {
      validation: value => value !== '0',
      calc: true,
    },
  })

  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>({
    angle: '°',
    move_distance: 'm',
  })

  if (props.get('effective_area') !== 'sector') {
    valuePropsMap.set('radius', 'm')
  }

  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>({
    effective_area: null,
    start_position_offsets: { type: 'value' },
    end_position_offsets: { type: 'value' },
  })

  const pureValues = []
  if (props.has('@range') && props.get('@range') !== 'no_limit' && props.get('@range') !== 'main') {
    pureValues.push('@range')
  }

  const titles = [
    'effective_area',
    'radius',
    'move_distance',
    'angle',
    'start_position_offsets',
    'end_position_offsets',
  ]

  const pureDatas = ['target_offsets', 'end_position']

  return handleDisplayData(computing, branchItem, props, {
    filters: filters.value,
    values: valuePropsMap.value,
    langs: langAttrsMap.value,
    titles,
    pureValues,
    pureDatas,
    formulaDisplayMode,
  })
}
