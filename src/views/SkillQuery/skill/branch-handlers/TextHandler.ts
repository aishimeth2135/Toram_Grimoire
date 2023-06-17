import {
  SkillBranchItemBaseChilds,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputing'
import type { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputing/compute'

import { cloneBranchProps, handleDisplayData } from './handle'
import MapContainer from './handle/MapContainer'

export default function TextHandler<
  BranchItem extends SkillBranchItemBaseChilds
>(computing: SkillComputingContainer, branchItem: BranchItem) {
  const attrs = cloneBranchProps(branchItem)
  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>(['text'])

  return handleDisplayData(computing, branchItem, attrs, {
    texts: textPropsMap.value,
  })
}
