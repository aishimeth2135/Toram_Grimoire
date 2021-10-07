import { isNumberString } from '@/shared/utils/string';
import { GetLangHandler } from '@/shared/services/Language';
import { numberToFixed } from '@/shared/utils/number';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import {
  computeBranchValue,
  computedBranchHelper,
  ComputedBranchHelperResult,
  handleBranchTextAttrs,
  handleBranchValueAttrs,
} from '@/lib/Skill/SkillComputingContainer/compute';
import type { HandleBranchValueAttrsMap, HandleBranchTextAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';
import { ResultContainer } from '@/lib/Skill/SkillComputingContainer/ResultContainer';

function cloneBranchAttrs(branchItem: SkillBranchItem): Record<string, string> {
  const attrs = {} as Record<string, string>;
  Object.entries(branchItem.attrs).forEach(([key, value]) => {
    attrs[key] = value;
  });
  return attrs;
}

interface HandleBranchLangAttrsOptions {
  prefix?: string;
  type?: 'normal' | 'value';
  afterHandle?: ((value: string) => string) | null;
}
interface HandleBranchLangAttrsMap {
  [key: string]: HandleBranchLangAttrsOptions | null;
}
function handleBranchLangAttrs<AttrMap extends HandleBranchLangAttrsMap>(
  lang: GetLangHandler,
  branchItem: SkillBranchItem,
  helper: ComputedBranchHelperResult,
  attrs: Record<string, string>,
  attrMap: AttrMap,
): Record<keyof AttrMap, ResultContainer> {
  const attrValues = {} as Record<keyof AttrMap, ResultContainer>;
  const attrKeys = Object.keys(attrMap) as (keyof AttrMap)[];
  attrKeys.forEach((attrKey) => {
    const { type = 'normal', prefix = '', afterHandle = null } = (attrMap[attrKey] || {}) as HandleBranchLangAttrsOptions;
    const value = attrs[attrKey as string];
    let resultStr: string;
    if (type === 'value') {
      const resultValue = computeBranchValue(value, helper);
      const sign = isNumberString(resultValue) && parseFloat(resultValue) < 0 ? 'negative' : 'positive';
      const displayValue = sign === 'negative' ? -1 * parseFloat(resultValue) : resultValue;
      resultStr = lang(`${branchItem.name + prefix}/${attrKey}/${sign}`, [displayValue.toString()]);
    } else {
      let displayValue = value;
      if (displayValue === '1' || displayValue === '0') {
        displayValue = displayValue === '1' ? 'true' : 'false';
      }
      let preName = branchItem.name + prefix;
      preName = branchItem.mainBranch ? branchItem.mainBranch.name + ': ' + preName : preName;
      const result = lang(`${preName}/${attrKey}/${displayValue}`);
      resultStr = afterHandle ? afterHandle(result) : result;
    }
    attrValues[attrKey] = new ResultContainer(value, resultStr);
  });
  return attrValues;
}

type HandleDisplayDataOptionFilterValidation = (value: string) => boolean;
interface HandleDisplayDataOptionFilterItem {
  validation: HandleDisplayDataOptionFilterValidation;
  calc?: boolean;
  defaultValue?: string;
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
  labels?: string[];
  langHandler?: GetLangHandler;
}
type HandleDisplayDataOptionsWithLangHander = HandleDisplayDataOptions & { langHandler: GetLangHandler };
type HandleDisplayDataOptionsType<Options extends HandleDisplayDataOptions> =
  Options extends ({ langs: HandleBranchLangAttrsMap } | { labels: string[] }) ?
    HandleDisplayDataOptionsWithLangHander :
    Options;
function handleDisplayData<Options extends HandleDisplayDataOptions>(
  branchItem: SkillBranchItem,
  attrs: Record<string, string>, {
    values = {},
    texts = {},
    langs = {},
    filters = {},
    pureValues = [],
    labels = [],
    langHandler,
  }: HandleDisplayDataOptionsType<Options>,
): Record<string, string> {
  const helper = computedBranchHelper(branchItem, [
    ...Object.keys(values).map(key => branchItem.attrs[key]),
    ...Object.keys(texts).map(key => branchItem.attrs[key]),
    ...pureValues.map(key => branchItem.attrs[key]),
    ...branchItem.stats.map(stat => stat.value),
  ]);

  Object.entries(filters).forEach(([key, value]) => {
    const attrValue = attrs[key];
    if (typeof value === 'function') {
      value = { validation: value };
    }
    const { validation, calc = false, defaultValue = null } = value;
    if (attrValue === undefined) {
      if (defaultValue !== null) {
        attrs[key] = defaultValue;
      }
      return;
    }
    const validatedValue = calc ? computeBranchValue(attrValue, helper) : attrValue;
    if (!validation(validatedValue)) {
      if (defaultValue !== null) {
        attrs[key] = defaultValue;
      } else {
        delete attrs[key];
        delete values[key];
        delete texts[key];
      }
    }
  });

  const valueDatas = handleBranchValueAttrs(helper, attrs, values);
  const textDatas = handleBranchTextAttrs(helper, attrs, texts);
  const langDatas = langHandler ? handleBranchLangAttrs(langHandler, branchItem, helper, attrs, langs) : {};

  const containerResult = {
    ...valueDatas,
    ...textDatas,
    ...langDatas,
  };

  const result = {} as Record<string, string>;
  Object.entries(containerResult).forEach(([key, value]) => {
    result[key] = value.result;
  });

  labels.forEach(key => {
    result[key + ': label'] = langHandler ? langHandler(`${branchItem.name}/${key}: label`) : key;
  });

  pureValues.forEach(key => {
    result[key] = computeBranchValue(attrs[key], helper);
  });

  return result;
}

const TAG_BUTTON_CLASS_NAME = 'click-button--tag';
function createTagButtons(html: string): string {
  return html.replace(/#([^\s]+)\s(\w?)/g, (m, m1, m2) => {
    let res = `<span class="${TAG_BUTTON_CLASS_NAME}">${m1.replace(new RegExp('_', 'g'), ' ')}</span>`;
    if (m2 !== '')
      res += ' ' + m2;
    return res;
  });
}

function numberStringToPercentage(str: string) {
  return numberToFixed(100 * parseFloat(str), 1).toString() + '%';
}

export {
  cloneBranchAttrs,
  handleDisplayData,
  createTagButtons,
  numberStringToPercentage,
  TAG_BUTTON_CLASS_NAME,
};
export type {
  HandleDisplayDataOptionFilters,
  HandleBranchLangAttrsMap,
};

