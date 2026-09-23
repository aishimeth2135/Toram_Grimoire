import type { SkillEffect } from '../Skill'
import type { SkillEffectItem, SkillEffectItemBase } from './SkillEffectItem'
import {
  classifyBranches,
  effectOverwrite,
  handleVirtualBranches,
  initBranchSpecialProps,
  initBranchesPostpone,
  initHistoryNexts,
  initStackStates,
  regressHistoryBranches,
  resolveExtendBranches,
  setBranchAttrsDefaultValue,
} from './utils'

function resolveEffectProperties(effectItem: SkillEffectItem, override?: SkillEffect): void {
  if (override) {
    effectOverwrite(effectItem, override)
  }
  setBranchAttrsDefaultValue(effectItem)
}

/** Classification consumes the flat branch list; run exactly once per effect. */
function assembleBranchTree(effectItem: SkillEffectItemBase): void {
  classifyBranches(effectItem)
  handleVirtualBranches(effectItem)
}

/** Preserve overwrite and history ordering: history rollback requires flat branches. */
export function initializeEffectBranches(
  effectItem: SkillEffectItem,
  override?: SkillEffect
): void {
  resolveEffectProperties(effectItem, override)
  regressHistoryBranches(effectItem)

  resolveExtendBranches(effectItem)
  initBranchSpecialProps(effectItem)
  effectItem.historys.forEach(history => {
    resolveExtendBranches(history)
    initBranchSpecialProps(history)
  })

  assembleBranchTree(effectItem)
  initBranchesPostpone(effectItem)

  // Histories are newest first. Their next effect must already have a branch tree.
  effectItem.historys.forEach(history => {
    assembleBranchTree(history)
    initStackStates(history)
    initHistoryNexts(history)
  })
  initStackStates(effectItem)
}
