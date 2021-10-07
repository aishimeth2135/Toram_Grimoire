import { GetLangHandler } from '@/shared/services/Language';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';

import { cloneBranchAttrs, handleDisplayData } from './utils';
import type { HandleBranchLangAttrsMap } from './utils';
import MapContainer from './utils/MapContainer';

export default function ProrationHandler(branchItem: SkillBranchItem, { lang }: {
  lang: GetLangHandler;
}) {
  const attrs = cloneBranchAttrs(branchItem);
  if (attrs['proration'] === 'auto') {
    attrs['proration'] = attrs['damage'];
  }
  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['damage', 'proration']);
  const labels = ['damage', 'proration'];

  return handleDisplayData(branchItem, attrs, {
    langs: langAttrsMap.value,
    labels,
    langHandler: lang,
  });
}
