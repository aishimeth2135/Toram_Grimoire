import { SkillBranch } from '@/lib/Skill/Skill';

import { handleFormula } from '@utils/data';

/**
 * @typedef SkillState
 * @type {Object}
 * @property {number} slv
 * @property {number} clv
 */
/**
 * @typedef StackStates
 * @type {Object}
 * @property {string} id
 * @property {number} value
 */
/**
 * @typedef EffectState
 * @type {Object}
 * @property {Array<StackStates>} stackStates
 */
/**
 * @param {string} str formula
 * @param {Object} param
 * @param {SkillState} param.skillState
 * @param {EffectState} param.effectState
 * @param {SkillBranch} param.branch
 * @returns
 */
export default function (str, { skillState, effectState, branch }) {
  const stack = [];

  if (branch && branch.attrs['stack_id']) {
    const ss = effectState.stackStates;
    const stackValues = branch.attrs['stack_id'].split(/\s*,\s*/)
      .map(p => {
        const item = ss.find(a => a.id === p);
        return item ? item.value : 0;
      });
    stack.push(...stackValues);
  }
  const stackMatches = Array.from(str.matchAll(/stack\[(\d+)\]/g));
  stackMatches.forEach(match => {
    const idxValue = parseInt(match[1], 10);
    if (!stack[idxValue] && stack[idxValue] !== 0) {
      stack[idxValue] = 0;
    }
  });

  const vars = {
    'SLv': skillState.slv,
    'CLv': skillState.clv,
    'stack': stackMatches.length === 0 ? stack[0] || '0' : stack,
  };
  const texts = {};

  const formulaExtra = branch ? branch.suffix.find(suf => suf.name === 'formula_extra') : null;
  if (formulaExtra) {
    const extraTexts = formulaExtra.attrs['texts'].split(/\s*,\s*/);
    str = str.replace(/&(\d+):/g, (match, p1) => {
      const key = '__FORMULA_EXTRA_' + p1 + '__';
      texts[key] = extraTexts[p1];
      return key;
    });
  }

  return handleFormula(str, { vars, texts });
}
