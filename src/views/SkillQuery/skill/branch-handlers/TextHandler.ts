import SkillComputingContainer, {
  SkillBranchItemBaseChilds,
} from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

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
