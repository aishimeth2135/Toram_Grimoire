import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';

function cloneBranchAttrs(branchItem: SkillBranchItem): Record<string, string> {
  const attrs = {} as Record<string, string>;
  Object.entries(branchItem.attrs).forEach(([key, value]) => {
    attrs[key] = value;
  });
  return attrs;
}

export { cloneBranchAttrs };
