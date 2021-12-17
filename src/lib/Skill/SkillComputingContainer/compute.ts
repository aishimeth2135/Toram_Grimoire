import { handleFormula, HandleFormulaTexts, HandleFormulaVars } from '@/shared/utils/data';
import { isNumberString } from '@/shared/utils/string';
import Grimoire from '@/shared/Grimoire';

import { StatComputed } from '@/lib/Character/Stat';

import { SkillBranchItem, SkillBranchItemBase, SkillBranchItemSuffix } from '.';
import { ResultContainerBase, ResultContainer, ResultContainerStat, TextResultContainer } from './ResultContainer';
import type { TextResultContainerParseResult } from './ResultContainer';
import { FormulaDisplayModes } from './enums';

function computeBranchValue(str: string, helper: ComputedBranchHelperResult): string {
  const {
    vars,
    texts,
    handleFormulaExtra,
  } = helper;

  str = str
    // convert "A,,B" to "(A)+(B)"
    .split(/\s*,,\s*/).map(part => `(${part})`).join('+')
    // convert "stack+A" to "stack[0]+A"
    .replace(/stack(?!\[)/g, 'stack[0]');

  str = handleFormulaExtra(str);
  return handleFormula(str, { vars, texts }) as string;
}

interface HighlightTextOptionsDetail {
  beforeHighlight?: (current: string) => string | string;
}
type HighlightTextOptions = string | HighlightTextOptionsDetail;
function handleHighlight(container: ResultContainerBase, options: HighlightTextOptions = {}) {
  if (typeof options === 'string') {
    const unit = options;
    options = {
      beforeHighlight: value => value + unit,
    };
  }
  let { beforeHighlight } = options;
  if (typeof beforeHighlight === 'string') {
    const unit = beforeHighlight;
    beforeHighlight = value => value + unit;
  }
  container.handle(value => !isNumberString(value) ? `<span class="cy--text-separate">${value}</span>` : value);
  if (beforeHighlight) {
    container.handle(beforeHighlight);
  }
  const originalFormula = container.origin;
  const className = isNumberString(container.value) && parseFloat(container.value) < 0 ?
    (originalFormula.includes('stack') ? 'text-blue-green' : 'text-red') :
    (originalFormula.includes('stack') ? 'text-water-blue' : 'text-light-3');
  container.handle((value, suffix) => `<span class="${className}">${value + suffix}</span>`);
}

interface ComputedBranchHelperResult {
  vars: HandleFormulaVars;
  texts: HandleFormulaTexts;
  branchItem: SkillBranchItemBase;
  handleFormulaExtra: (formula: string) => string;
  formulaDisplayMode: FormulaDisplayModes;
}
/**
 * Create data contains vars and texts of branchItem to compute formula.
 * @param branchItem
 * @param values - it will check value of every values whether it contains "stack[n]", and ensure stack[n] is not undefined
 * @param [formulaDisplayMode] - formula display mode, default value is from ComoutingContainer.config
 * @returns data using for compute
 */
function computedBranchHelper(branchItem: SkillBranchItemBase, values: string[] = [], formulaDisplayMode?: FormulaDisplayModes): ComputedBranchHelperResult {
  let vars: HandleFormulaVars;
  let texts: HandleFormulaTexts;

  formulaDisplayMode = formulaDisplayMode ?? branchItem.parent.parent.parent.config.formulaDisplayMode;

  const branchItemStack = branchItem instanceof SkillBranchItemSuffix ? branchItem.mainBranch : branchItem;
  const stackIds = branchItemStack.hasAttr('stack_id') ?
    branchItemStack.attr('stack_id').split(/\s*,\s*/).map(id => parseInt(id, 10)) : [];

  if (formulaDisplayMode === 'original-formula') {
    const stack: string[] = [];
    const { t } = Grimoire.i18n;

    if (branchItemStack.attr('stack_id')) {
      const stackStates = branchItem.parent.stackStates;
      const stackNames = stackIds.map((id, idx) => {
        const item = stackStates.find(state => state.stackId === id);
        let name = item ? item.branch.attr('name') : 'auto';
        if (name === 'auto') {
          name = `${t('skill-query.branch.stack.base-name')}${idx + 1}`;
        }
        return name;
      });
      stack.push(...stackNames);
    }

    values.forEach(value => {
      const stackMatches = Array.from(value.matchAll(/stack\[(\d+)\]/g));
      stackMatches.forEach(match => {
        const idxValue = parseInt(match[1], 10);
        if (stack[idxValue] === undefined) {
          stack[idxValue] = `${t('skill-query.branch.stack.base-name')}${idxValue + 1}`;
        }
      });
    });

    const handleFormulaExtends = branchItem.belongContainer.handleFormulaExtends;

    vars = {
      ...handleFormulaExtends.vars,
    } as HandleFormulaVars;
    texts = {
      'SLv': t('skill-query.skill-level'),
      'CLv': t('skill-query.character-level'),
      'stack': stack,
      ...handleFormulaExtends.texts,
    } as HandleFormulaTexts;
  } else {
    const stack: number[] = [];

    if (branchItemStack.attr('stack_id')) {
      const stackStates = branchItem.parent.stackStates;
      const stackValues = stackIds.map(id => {
        const item = stackStates.find(state => state.stackId === id);
        return item ? item.value : 0;
      });
      stack.push(...stackValues);
    }

    values.forEach(value => {
      const stackMatches = Array.from(value.matchAll(/stack\[(\d+)\]/g));
      stackMatches.forEach(match => {
        const idxValue = parseInt(match[1], 10);
        if (stack[idxValue] === undefined) {
          stack[idxValue] = 0;
        }
      });
    });

    const handleFormulaExtends = branchItem.belongContainer.handleFormulaExtends;

    vars = {
      ...handleFormulaExtends.vars,
      'SLv': branchItem.belongContainer.vars.skillLevel,
      'CLv': branchItem.belongContainer.vars.characterLevel,
      'stack': stack,
    } as HandleFormulaVars;
    texts = {
      ...handleFormulaExtends.texts,
    } as HandleFormulaTexts;
  }

  const getTextKey = (idx: number) => '__FORMULA_EXTRA_' + idx.toString() + '__';

  if (branchItem instanceof SkillBranchItem) {
    const formulaExtra = branchItem.suffixBranches.find(suf => suf.name === 'formula_extra');
    if (formulaExtra) {
      const extraTexts = (formulaExtra.attr('texts')).split(/\s*,\s*/);
      extraTexts.forEach((text, idx) => {
        const key = getTextKey(idx);
        texts[key] = text;
      });
    }
  }

  return {
    vars,
    texts,
    handleFormulaExtra: (str) => str.replace(/&(\d+):/g, (match, p1) => getTextKey(p1)),
    branchItem,
    formulaDisplayMode,
  };
}

/**
 * Compute value-type data.
 * - If key not exist in attrs, its computed value is "0"
 * @param helper
 * @param attrs - current attrs data
 * @param attrKeys - attrs that want to computed
 * @returns object contains all pairs of key im attrKeys and computed value
 */
function computeBranchValueAttrs<Key extends string>(
  helper: ComputedBranchHelperResult,
  attrs: Record<string, string>,
  attrKeys: Key[],
): Record<Key, string> {
  const attrValues = {} as Record<Key, string>;
  attrKeys.forEach(attrKey => {
    const str = attrs[attrKey];
    if (str === undefined) {
      attrValues[attrKey] = '0';
      return;
    }

    attrValues[attrKey] = computeBranchValue(str, helper);
  });

  return attrValues;
}

// type HandleBranchAttrValuesResultValueType<Value> = Value extends { pure: true } ? number : string;
type HandleBranchValueAttrOptions = HighlightTextOptions;
interface HandleBranchValueAttrsMap {
  [key: string]: HighlightTextOptions | null;
}
type HandleBranchValueAttrsResult<AttrMap extends HandleBranchValueAttrsMap> = {
  [key in keyof AttrMap]: ResultContainer;
};
function handleBranchValueAttrs<AttrMap extends HandleBranchValueAttrsMap>(
  helper: ComputedBranchHelperResult,
  attrs: Record<string, string>,
  attrMap: AttrMap,
): HandleBranchValueAttrsResult<AttrMap> {
  const attrKeys = Object.keys(attrMap) as (keyof AttrMap)[];
  const attrValues = computeBranchValueAttrs(helper, attrs, attrKeys as string[]) as Record<keyof AttrMap, string>;
  const attrResult = {} as HandleBranchValueAttrsResult<AttrMap>;
  attrKeys.forEach(attrKey => {
    const originalFormula = attrs[attrKey as string];
    if (originalFormula === undefined) {
      attrResult[attrKey] = new ResultContainer(attrKey as string, '0', '0');
      return;
    }
    const options = (attrMap[attrKey] || {}) as HandleBranchValueAttrOptions;
    const container = new ResultContainer(attrKey as string, originalFormula, attrValues[attrKey]);
    handleHighlight(container, options);

    attrResult[attrKey] = container;
  });

  return attrResult;
}

function computedBranchTextAttrs<Key extends string>(
  helper: ComputedBranchHelperResult,
  attrs: Record<string, string>,
  attrKeys: Key[],
): Record<Key, TextResultContainerParseResult> {
  const attrValues = {} as Record<Key, TextResultContainerParseResult>;
  attrKeys.forEach(attrKey => {
    const textStr = attrs[attrKey];
    if (textStr === undefined) {
      attrValues[attrKey] = {
        containers: [],
        parts: ['0'],
      };
      return;
    }
    const parseResult = TextResultContainer.parse(attrKey, textStr, value => computeBranchValue(value, helper));
    attrValues[attrKey] = parseResult;
  });

  return attrValues;
}
interface HandleBranchTextAttrsMap {
  [key: string]: null;
}
type HandleBranchTextAttrsResult<AttrMap extends HandleBranchValueAttrsMap> = {
  [key in keyof AttrMap]: TextResultContainer;
};
function handleBranchTextAttrs<AttrMap extends HandleBranchTextAttrsMap>(
  helper: ComputedBranchHelperResult,
  attrs: Record<string, string>,
  attrMap: AttrMap,
): HandleBranchTextAttrsResult<AttrMap> {
  const attrKeys = Object.keys(attrMap) as (keyof AttrMap)[];
  const attrValues = computedBranchTextAttrs(helper, attrs, attrKeys as string[]) as Record<keyof AttrMap, TextResultContainerParseResult>;
  const attrResult = {} as HandleBranchTextAttrsResult<AttrMap>;
  attrKeys.forEach(attrKey => {
    const parseResult = attrValues[attrKey];
    const originalFormula = attrs[attrKey as string];
    if (originalFormula === undefined) {
      attrResult[attrKey] = new TextResultContainer(attrKey as string, '0', '0', parseResult);
      return;
    }
    const options = (attrMap[attrKey] || {}) as HighlightTextOptions;
    const container = new TextResultContainer(attrKey as string, originalFormula, attrs[attrKey as string], parseResult);
    handleHighlight(container, options);

    attrResult[attrKey] = container;
  });

  return attrResult;
}

function computedBranchStats(helper: ComputedBranchHelperResult, stats: StatComputed[]): StatComputed[] {
  return stats.map(stat => {
    const str = stat.value;
    const newStat = stat.copy();
    newStat.value = computeBranchValue(str, helper);
    return newStat;
  });
}

function handleBranchStats(helper: ComputedBranchHelperResult, stats: StatComputed[]): ResultContainerStat[] {
  const newStats = computedBranchStats(helper, stats);
  return newStats.map(stat => {
    const originalStat = stats.find(_stat => _stat.equals(stat)) as StatComputed;
    const container = new ResultContainerStat(originalStat, stat);
    const sign = isNumberString(container.value) && parseFloat(stat.value) < 0 ? '' : '+';
    const showData = stat.getShowData();
    handleHighlight(container, {
      beforeHighlight: value => value + showData.tail,
    });
    container.handle(value => showData.title + sign + value);
    return container;
  });
}

export {
  computeBranchValue,
  computedBranchHelper,
  computeBranchValueAttrs,
  handleBranchValueAttrs,
  computedBranchTextAttrs,
  handleBranchTextAttrs,
  computedBranchStats,
  handleBranchStats,
};
export type { HandleBranchValueAttrsMap, HandleBranchTextAttrsMap, ComputedBranchHelperResult };
