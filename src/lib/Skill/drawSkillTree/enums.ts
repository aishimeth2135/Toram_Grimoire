export const DrawSkillTreeDataTypes = {
  SkillCircle: 'skill-circle',
  SkillName: 'skill-name',
  TreeLine: 'tree-line',
  TreeDot: 'tree-dot',
  SkillLevelText: 'skill-level-text',
  StarGemLevelText: 'star-gem-level-text',
} as const
export type DrawSkillTreeDataTypes =
  (typeof DrawSkillTreeDataTypes)[keyof typeof DrawSkillTreeDataTypes]
