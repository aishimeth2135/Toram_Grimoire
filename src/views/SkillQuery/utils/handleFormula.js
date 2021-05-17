import { SkillBranch } from "@/lib/Skill/Skill";

import { parseFormula } from "@utils/data";

/**
 * @typedef SkillState
 * @type {object}
 * @property {number} slv
 * @property {number} clv
 */
/**
 * @typedef StackStates
 * @type {object}
 * @property {number} id
 * @property {number} value
 */
/**
 * @typedef EffectState
 * @type {object}
 * @property {StackStates[]} stackStates
 */
/**
 * @param {string} str formula
 * @param {object} param
 * @param {SkillState} param.skillState
 * @param {EffectState} param.effectState
 * @param {SkillBranch} param.branch
 * @returns
 */
export default function (str, { skillState, effectState, branch }) {
  if (!str) {
    console.log('input str is empty.');
    return '0';
  }
  const slv = skillState.slv,
    clv = skillState.clv;

  str = str.replace(/SLv/g, slv)
    .replace(/CLv/g, clv);

  const stack = [];

  if (branch && branch.attrs['stack_id']) {
    const ss = effectState.stackStates;
    const t = branch.attrs['stack_id'].split(/\s*,\s*/)
      .map(p => parseInt(p, 10))
      .map(p => {
        const t = ss.find(a => a.id == p);
        return t ? t.value : 0;
      });
    stack.push(...t);
    str = str.replace(/stack(?!\[)/g, 'stack[0]');
  } else {
    str = str.replace(/stack(\[\d+\])?/g, '0');
  }

  str = str = str.replace(/stack\[(\d+)\]/g, (m, m1) => stack[parseInt(m1, 10)]);

  const formulaExtra = branch ? branch.suffix.find(suf => suf.name === 'formula_extra') : null;
  if (formulaExtra)
    str = str.replace(/&(\d+):/g, (m, m1) => '__FORMULA_EXTRA_' + m1 + '__');

  function safeEval(str, dftv) {
    try {
      return eval(str);
    } catch (e) {
      console.warn('Unable to process: ' + str);
      return dftv === void 0 ? '??' : dftv;
    }
  }
  str = parseFormula(str, safeEval);

  if (formulaExtra) {
    const texts = formulaExtra.attrs['texts'].split(/\s*,\s*/);
    str = str.replace(/__FORMULA_EXTRA_(\d+)__/g, (m, m1) => texts[parseInt(m1, 0)]);
  }

  return str;
}
