import { handleFormula, HandleFormulaTexts, HandleFormulaVars } from '@/shared/utils/data';
import { isNumberString } from '@/shared/utils/string';

import { StatComputed } from '@/lib/Character/Stat';

import { SkillBranchItem } from '.';
import { ResultContainerBase, ResultContainer, ResultContainerStat, TextResultContainer } from './ResultContainer';
import type { TextResultContainerParseResult } from './ResultContainer';

function computeBranchValue(str: string, helper: ComputedBranchHelperResult): string {
  const {
    vars,
    texts,
  } = helper;

  return handleFormula(str, { vars, texts }) as string;
}

interface HighlightTextOptions {
  beforeHighlight?: (current: string) => string;
}
function handleHighlight(container: ResultContainerBase, { beforeHighlight }: HighlightTextOptions = {}) {
  if (!isNumberString(container.value)) {
    container.handle(value => `<span class="cy--text-separate">${value}</span>`);
  }
  if (beforeHighlight) {
    container.handle(beforeHighlight);
  }
  const originalFormula = container.origin;
  const className = isNumberString(container.value) && parseFloat(container.value) < 0 ?
    (originalFormula.includes('stack') ? 'text-blue-green' : 'text-red') :
    (originalFormula.includes('stack') ? 'text-water-blue' : 'text-light-3');
  container.handle(value => `<span class="${className}">${value}</span>`);
}

interface ComputedBranchHelperResult {
  vars: HandleFormulaVars;
  texts: HandleFormulaTexts;
  handleFormulaExtra: (formula: string) => string;
}
function computedBranchHelper(branchItem: SkillBranchItem, values: string[]): ComputedBranchHelperResult {
  const stack: number[] = [];

  if (branchItem.attrs['stack_id']) {
    const stackStates = branchItem.parent.stackStates;
    const stackValues = branchItem.attrs['stack_id'].split(/\s*,\s*/)
      .map(id => parseInt(id, 10))
      .map(id => {
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

  const vars = {
    ...handleFormulaExtends.vars,
    'SLv': branchItem.belongContainer.vars.skillLevel,
    'CLv': branchItem.belongContainer.vars.characterLevel,
    'stack': stack,
  } as HandleFormulaVars;
  const texts = {
    ...handleFormulaExtends.texts,
  } as HandleFormulaTexts;

  const getTextKey = (idx: number) => '__FORMULA_EXTRA_' + idx.toString() + '__';

  const formulaExtra = branchItem.suffixBranches.find(suf => suf.name === 'formula_extra');
  if (formulaExtra) {
    const extraTexts = (formulaExtra.attrs['texts'] || '').split(/\s*,\s*/);
    extraTexts.forEach((text, idx) => {
      const key = getTextKey(idx);
      texts[key] = text;
    });
  }

  return {
    vars,
    texts,
    handleFormulaExtra: (str) => str.replace(/&(\d+):/g, (match, p1) => getTextKey(p1)),
  };
}

function formulaPretreatment(value: string) {
  return value
    // convert "A,,B" to "(A)+(B)"
    .split(/\s*,,\s*/).map(part => `(${part})`).join('+')
    // convert "stack+A" to "stack[0]+A"
    .replace(/stack(?!\[)/g, 'stack[0]');
}

function computeBranchValueAttrs<Key extends string>(
  helper: ComputedBranchHelperResult,
  attrs: Record<string, string>,
  attrKeys: Key[],
): Record<Key, string> {
  const { handleFormulaExtra } = helper;
  // computedBranchHelper(branchItem, attrKeys.map(attrKey => branchItem.attrs[attrKey] || '0'));

  const attrValues = {} as Record<Key, string>;
  attrKeys.forEach(attrKey => {
    let str = attrs[attrKey];
    if (str === undefined) {
      attrValues[attrKey] = '0';
      return;
    }
    str = formulaPretreatment(str);
    str = handleFormulaExtra(str);

    attrValues[attrKey] = computeBranchValue(str, helper);
  });

  return attrValues;
}

// type HandleBranchAttrValuesResultValueType<Value> = Value extends { pure: true } ? number : string;
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
      attrResult[attrKey] = new ResultContainer('0', '0');
      return;
    }
    const options = (attrMap[attrKey] || {}) as HighlightTextOptions;
    const container = new ResultContainer(originalFormula, attrValues[attrKey]);
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
  const { handleFormulaExtra } = helper;
  // computedBranchHelper(branchItem, attrKeys.map(attrKey => branchItem.attrs[attrKey] || '0'));

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
    const parseResult = TextResultContainer.parse(textStr);
    parseResult.containers.forEach(container => {
      let str = container.value;
      str = formulaPretreatment(str);
      str = handleFormulaExtra(str);

      container.value = computeBranchValue(str, helper);
    });
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
      attrResult[attrKey] = new TextResultContainer('0', '0', parseResult);
      return;
    }
    const options = (attrMap[attrKey] || {}) as HighlightTextOptions;
    const container = new TextResultContainer(originalFormula, attrs[attrKey as string], parseResult);
    handleHighlight(container, options);

    attrResult[attrKey] = container;
  });

  return attrResult;
}

function computedBranchStats(helper: ComputedBranchHelperResult, stats: StatComputed[]): StatComputed[] {
  const { handleFormulaExtra } = helper;
  // computedBranchHelper(branchItem, stats.map(stat => stat.value));

  return stats.map(stat => {
    let str = stat.value;
    str = formulaPretreatment(str);
    str = handleFormulaExtra(str);
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
