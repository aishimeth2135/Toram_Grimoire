import { isNumberString, trimZero } from '@/shared/utils/string';
import { numberToFixed } from '@/shared/utils/number';
import Grimoire from '@/shared/Grimoire';

import { SkillBranchItemSuffix, SkillEffectItemHistory } from '@/lib/Skill/SkillComputingContainer';
import type { SkillBranchItemBase, SkillBranchItemOverwriteRecords } from '@/lib/Skill/SkillComputingContainer';
import {
  computeBranchValue,
  computedBranchHelper,
  ComputedBranchHelperResult,
  handleBranchStats,
  handleBranchTextAttrs,
  handleBranchValueAttrs,
} from '@/lib/Skill/SkillComputingContainer/compute';
import type { HandleBranchValueAttrsMap, HandleBranchTextAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';
import { ResultContainer, ResultContainerBase } from '@/lib/Skill/SkillComputingContainer/ResultContainer';
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer/enums';
import { StatComputed } from '@/lib/Character/Stat';

import { createTagButtons } from '@/views/SkillQuery/utils';

import DisplayDataContainer from './DisplayDataContainer';
import { handleFunctionHighlight } from './utils';

function cloneBranchAttrs(
  branchItem: SkillBranchItemBase,
  initValueMap?: Record<string, string | ((value: string) => string)>,
): Record<string, string> {
  const attrs = {} as Record<string, string>;
  Object.entries(branchItem.allAttrs).forEach(([key, value]) => {
    attrs[key] = value;
  });
  if (typeof initValueMap === 'object') {
    Object.entries(initValueMap).forEach(([key, value]) => {
      if (typeof value === 'function') {
        attrs[key] = value(attrs[key]);
      } else if (attrs[key] === undefined) {
        attrs[key] = value;
      }
    });
  }
  return attrs;
}

type SkillDisplayData = Record<string, string>;

interface HandleBranchLangAttrsOptions {
  prefix?: string; // unused now
  type?: 'auto' | 'normal' | 'value' | 'boolean';
  afterHandle?: ((value: string) => string) | null;
}
interface HandleBranchLangAttrsMap {
  [key: string]: HandleBranchLangAttrsOptions | null;
}
function handleBranchLangAttrs<AttrMap extends HandleBranchLangAttrsMap>(
  branchItem: SkillBranchItemBase,
  helper: ComputedBranchHelperResult,
  attrs: Record<string, string>,
  attrMap: AttrMap,
): Record<keyof AttrMap, ResultContainer> {
  const { t } = Grimoire.i18n;

  const attrValues = {} as Record<keyof AttrMap, ResultContainer>;
  const attrKeys = Object.keys(attrMap) as (keyof AttrMap)[];
  attrKeys.forEach((attrKey) => {
    const { type = 'auto', prefix = '', afterHandle = null } = (attrMap[attrKey] || {}) as HandleBranchLangAttrsOptions;
    const value = attrs[attrKey as string];
    if (!value) {
      return;
    }
    let resultStr: string;
    if (type === 'value') {
      const resultValue = computeBranchValue(value, helper);
      const sign = isNumberString(resultValue) && parseFloat(resultValue) < 0 ? 'negative' : 'positive';
      const displayValue = sign === 'negative' ? -1 * parseFloat(resultValue) : resultValue;
      resultStr = t(`skill-query.branch.${branchItem.name + prefix}.${attrKey}.${sign}`, { value: displayValue.toString() });
    } else {
      let displayValue = value;
      if ((type === 'auto' || type === 'boolean') && (displayValue === '1' || displayValue === '0')) {
        displayValue = displayValue === '1' ? 'true' : 'false';
      }
      let preName = branchItem.name + prefix;
      preName = branchItem instanceof SkillBranchItemSuffix ? branchItem.mainBranch.name + ': ' + preName : preName;
      const result = t(`skill-query.branch.${preName}.${attrKey}.${displayValue}`);
      resultStr = afterHandle ? afterHandle(result) : result;
    }
    attrValues[attrKey] = new ResultContainer(attrKey as string, value, resultStr);
  });
  return attrValues;
}

type HandleDisplayDataOptionFilterValidation = (value: string) => boolean;
interface HandleDisplayDataOptionFilterItem {
  validation: HandleDisplayDataOptionFilterValidation;
  calc?: boolean;
}
interface HandleDisplayDataOptionFilters {
  [key: string]: HandleDisplayDataOptionFilterValidation | HandleDisplayDataOptionFilterItem;
}
interface HandleDisplayDataOptions {
  values?: HandleBranchValueAttrsMap;
  texts?: HandleBranchTextAttrsMap;
  langs?: HandleBranchLangAttrsMap;
  filters?: HandleDisplayDataOptionFilters;
  pureValues?: string[];
  pureDatas?: string[];
  titles?: string[];
  formulaDisplayMode?: FormulaDisplayModes;
}

function handleDisplayData<Branch extends SkillBranchItemBase>(
  branchItem: Branch,
  attrs: Record<string, string>, {
    values = {},
    texts = {},
    langs = {},
    filters = {},
    pureValues = [],
    pureDatas = [],
    titles = [],
    formulaDisplayMode,
  }: HandleDisplayDataOptions,
): DisplayDataContainer<Branch> {
  const { t } = Grimoire.i18n;

  const helper = computedBranchHelper(branchItem, [
    ...Object.keys(values).map(key => branchItem.attr(key)),
    ...Object.keys(texts).map(key => branchItem.attr(key)),
    ...pureValues.map(key => branchItem.attr(key)),
    ...branchItem.stats.map(stat => stat.value),
  ], formulaDisplayMode);

  formulaDisplayMode = helper.formulaDisplayMode;

  Object.entries(filters).forEach(([key, value]) => {
    const attrValue = attrs[key];
    if (typeof value === 'function') {
      value = { validation: value };
    }
    const { validation, calc = false } = value;
    const validatedValue = calc ? computeBranchValue(attrValue, helper) : attrValue;
    if (!validation(validatedValue)) {
      delete attrs[key];
      delete values[key];
      delete texts[key];
      const idxTitle = titles.indexOf(key);
      idxTitle > -1 && titles.splice(idxTitle, 1);
      const idxPureValues = pureValues.indexOf(key);
      idxPureValues > -1 && pureValues.splice(idxPureValues, 1);
    }
  });

  const valueDatas = handleBranchValueAttrs(helper, attrs, values);
  const textDatas = handleBranchTextAttrs(helper, attrs, texts);
  const langDatas = handleBranchLangAttrs(branchItem, helper, attrs, langs);
  const statDatas = handleBranchStats(helper, branchItem.stats);

  const result = {} as SkillDisplayData;

  const handleContainerFormulaValue = (container: ResultContainerBase) => {
    container.handle(value => {
      return value
        .replace(/([$_a-zA-Z][$_a-zA-Z0-9]*)(\*)(\d\.\d+)/g, (match, p1, p2, p3) => p1 + p2 + numberStringToPercentage(p3))
        .replace(/\*/g, '×');
    });
    container.handle(value => value.replace(/(\d+\.)(\d{4,})/g, (m, m1, m2) => m1 + m2.slice(0, 4)));
    container.handle(trimZero);
  };

  const handleAttrHistoryHighlight = branchItem.parent instanceof SkillEffectItemHistory ?
    (key: string, value: string) => {
      const searchKeys = ['overwrite', 'append', 'remove'] as const;
      if (searchKeys.some(searchKey => branchItem.record.attrs[searchKey].includes(key) || branchItem.historyRecord?.attrs[searchKey].includes(key))) {
        return `<span class="history-compare--mark">${value}</span>`;
      }
      return value;
    } :
    (key: string, value: string) => value;

  const handleStatHistoryHighlight = branchItem.parent instanceof SkillEffectItemHistory ?
    (stat: StatComputed, value: string) => {
      const searchKeys = ['overwrite', 'append', 'remove'] as const;
      const _find = (target: SkillBranchItemOverwriteRecords | null) => searchKeys
        .some(searchKey => target?.stats[searchKey].some(([baseName, type]) => stat.baseName === baseName && stat.type === type));
      if (_find(branchItem.record) || _find(branchItem.historyRecord)) {
        return `<span class="history-compare--mark">${value}</span>`;
      }
      return value;
    } :
    (stat: StatComputed, value: string) => value;

  Object.entries(valueDatas).forEach(([key, container]) => {
    handleContainerFormulaValue(container);

    let str = container.result;
    if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
      str = handleFunctionHighlight(str);
    }
    str = handleAttrHistoryHighlight(key, str);

    result[key] = str;
  });

  Object.entries(textDatas).forEach(([key, container]) => {
    handleContainerFormulaValue(container);

    let str = container.result;
    str = str.replace(/\(\(((?:(?!\(\().)+)\)\)/g, (m, m1) => `<span class="cy--text-separate border-light-3">${m1}</span>`);
    str = createTagButtons(str);

    const handleReplaceLabel = (attrKey: string) => {
      const labels = branchItem.attr(attrKey).split(/\s*,\s*/).filter(item => item);
      labels.forEach((label, idx) => {
        str = str.replace(new RegExp(label, 'g'), () => `__HANDLE_REPLACE_LABEL_${idx}__`);
      });
      labels.forEach((label, idx) => {
        str = str.replace(new RegExp(`__HANDLE_REPLACE_LABEL_${idx}__`, 'g'), () => `<span class="click-button--${attrKey}">${label}</span>`);
      });
    };
    handleReplaceLabel('mark');
    handleReplaceLabel('branch');
    handleReplaceLabel('skill');

    if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
      str = handleFunctionHighlight(str);
    }

    str = handleAttrHistoryHighlight(key, str);

    result[key] = str;
  });

  Object.entries(langDatas).forEach(([key, container]) => {
    let str = container.result;
    str = handleAttrHistoryHighlight(key, str);
    result[key] = str;
  });

  statDatas.forEach(container => {
    handleContainerFormulaValue(container);
    container.handle(value => handleStatHistoryHighlight(container.stat, value));
  });

  titles.forEach(key => {
    result[key + ': title'] = t(`skill-query.branch.${branchItem.name}.${key}: title`);
  });

  const containers = {
    ...valueDatas,
    ...textDatas,
    ...langDatas,
  };

  pureValues.forEach(key => {
    const value = computeBranchValue(attrs[key], helper);
    const container = new ResultContainer(key, attrs[key], value);

    if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
      handleContainerFormulaValue(container);
    }

    let str = container.result;
    if (formulaDisplayMode === FormulaDisplayModes.OriginalFormula) {
      str = handleFunctionHighlight(str);
    }

    containers[key] = container;
    result[key] = str;
  });

  pureDatas.forEach(key => {
    const value = attrs[key];
    if (value === undefined) {
      return;
    }
    result[key] = value;
    containers[key] = new ResultContainer(key, value, value);
  });

  return new DisplayDataContainer({
    branchItem,
    containers,
    value: result,
    statContainers: statDatas,
  });
}

function numberStringToPercentage(str: string) {
  return numberToFixed(100 * parseFloat(str), 1).toString() + '%';
}

export {
  cloneBranchAttrs,
  handleDisplayData,
  numberStringToPercentage,
};
export type {
  HandleDisplayDataOptionFilters,
  HandleBranchLangAttrsMap,
  SkillDisplayData,
};

