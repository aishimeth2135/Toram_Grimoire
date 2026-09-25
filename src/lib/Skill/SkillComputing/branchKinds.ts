import { SkillBranchNames } from '../Skill/enums'

interface BranchKindDefinition {
  readonly parent?: SkillBranchNames
  readonly translationKey?: string
}

// An omitted translationKey inherits the parent's key; roots use their own key.
const BRANCH_KIND_DEFINITIONS: Readonly<Partial<Record<SkillBranchNames, BranchKindDefinition>>> = {
  [SkillBranchNames.Buff]: { parent: SkillBranchNames.Effect },
  [SkillBranchNames.Next]: { parent: SkillBranchNames.Buff },
}

/** Ordered from the kind itself to its oldest ancestor. */
export function getBranchKindChain(kind: SkillBranchNames): SkillBranchNames[] {
  const chain: SkillBranchNames[] = []
  let current: SkillBranchNames | undefined = kind
  while (current !== undefined && !chain.includes(current)) {
    chain.push(current)
    current = BRANCH_KIND_DEFINITIONS[current]?.parent
  }
  return chain
}

export function getBranchTranslationKey(kind: SkillBranchNames): string {
  const chain = getBranchKindChain(kind)
  for (const current of chain) {
    const key = BRANCH_KIND_DEFINITIONS[current]?.translationKey
    if (key !== undefined) {
      return key
    }
  }
  return chain[chain.length - 1] ?? kind
}
