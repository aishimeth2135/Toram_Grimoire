import { handleFormula, HandleFormulaTexts, HandleFormulaVars } from '@/shared/utils/data';
import { isNumberString } from '@/shared/utils/string';

import { StatComputed } from '@/lib/Character/Stat';

import { SkillBranchItem } from '.';
import ResultContainer from './ResultContainer';

interface HighlightTextOptions {
  beforeHighlight?: (current: string) => string;
}

function handleHighlight(container: ResultContainer, originalFormula: string = '', { beforeHighlight }: HighlightTextOptions = {}) {
  if (!isNumberString(container.value)) {
    container.handle(value => `<span class="cy--text-separate">${value}</span>`);
  }
  if (beforeHighlight) {
    container.handle(beforeHighlight);
  }
  const className = isNumberString(container.value) && parseFloat(container.value) < 0 ?
    (originalFormula.includes('stack') ? 'text-blue-green' : 'text-red') :
    (originalFormula.includes('stack') ? 'text-water-blue' : 'text-light-3');
  container.handle(value => `<span class="${className}">${value}</span>`);
}

function computedBranchHelper(branchItem: SkillBranchItem, values: string[]) {
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

  const getTextKey = (idx: number) => '__FORMULA_EXTRA_' + idx + '__';

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
    handleFormulaExtra: (str: string) => str.replace(/&(\d+):/g, (match, p1) => getTextKey(p1)),
  };
}

function formulaPretreatment(value: string) {
  return value
    // convert "A,,B" to "(A)+(B)"
    .split(/\s*,,\s*/).map(part => `(${part})`).join('+')
    // convert "stack+A" to "stack[0]+A"
    .replace(/stack(?!\[)/g, 'stack[0]');
}

function computeBranchValueAttrs<Key extends string>(branchItem: SkillBranchItem, attrKeys: Key[]): Record<Key, string> {
  const {
    vars,
    texts,
    handleFormulaExtra,
  } = computedBranchHelper(branchItem, attrKeys.map(attrKey => branchItem.attrs[attrKey] || '0'));

  const attrValues = {} as Record<Key, string>;
  attrKeys.forEach(attrKey => {
    let str = branchItem.attrs[attrKey];
    if (str === undefined) {
      attrValues[attrKey] = '0';
      return;
    }
    str = formulaPretreatment(str);
    str = handleFormulaExtra(str);

    attrValues[attrKey] = handleFormula(str, { vars, texts }) as string;
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
function handleBranchValueAttrs<AttrMap extends HandleBranchValueAttrsMap>(branchItem: SkillBranchItem, attrMap: AttrMap): HandleBranchValueAttrsResult<AttrMap> {
  const attrKeys = Object.keys(attrMap) as (keyof AttrMap)[];
  const attrValues = computeBranchValueAttrs(branchItem, attrKeys as string[]) as Record<keyof AttrMap, string>;
  const attrResult = {} as HandleBranchValueAttrsResult<AttrMap>;
  attrKeys.forEach(attrKey => {
    const originalFormula = branchItem.attrs[attrKey as string];
    if (originalFormula === undefined) {
      attrResult[attrKey] = new ResultContainer('0');
      return;
    }
    const options = (attrMap[attrKey] || {}) as HighlightTextOptions;
    const container = new ResultContainer(attrValues[attrKey]);
    handleHighlight(container, originalFormula, options);

    attrResult[attrKey] = container;
  });

  return attrResult;
}

// interface HandleBranchTextAttrsMap {
//   [key: string]: null;
// }
// function computedBranchTextAttrs<AttrMap extends HandleBranchTextAttrsMap>(branchItem: SkillBranchItem, attrMap: AttrMap): HandleBranchValueAttrsResult<AttrMap> {

// }

function computedBranchStats(branchItem: SkillBranchItem): StatComputed[] {
  const stats = branchItem.stats;
  const {
    vars,
    texts,
    handleFormulaExtra,
  } = computedBranchHelper(branchItem, stats.map(stat => stat.value));

  return stats.map(stat => {
    let str = stat.value;
    str = formulaPretreatment(str);
    str = handleFormulaExtra(str);
    const newStat = stat.copy();
    newStat.value = handleFormula(str, { vars, texts }) as string;
    return newStat;
  });
}

function handleBranchStats(branchItem: SkillBranchItem): ResultContainer[] {
  const newStats = computedBranchStats(branchItem);
  return newStats.map(stat => {
    const container = new ResultContainer(stat.value);
    const sign = isNumberString(container.value) && parseFloat(stat.value) < 0 ? '' : '+';
    const originalStat = branchItem.stats.find(_stat => _stat.equals(stat)) as StatComputed;
    const showData = stat.getShowData();
    handleHighlight(container, originalStat.value, {
      beforeHighlight: value => value + showData.tail,
    });
    container.handle(value => showData.title + sign + value);
    return container;
  });
}

export {
  computeBranchValueAttrs,
  handleBranchValueAttrs,
  computedBranchStats,
  handleBranchStats,
};
