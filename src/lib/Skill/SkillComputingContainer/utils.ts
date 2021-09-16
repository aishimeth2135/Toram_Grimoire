import { handleFormula } from '@/shared/utils/data';

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';

import { SkillBranch, SkillEffect } from '../Skill';
import { SkillBranchItem, SkillEffectItem } from './index';
import type { EquipmentRestriction, BranchHistoryItem, BranchGroupState, BranchStackState } from './index';

function effectOverwrite(to: SkillEffectItem, from: SkillEffect) {
  const toBranches = to.branchItems;

  /**
   * If some fromBranch.name === '' && fromBranch.isEmpty`.
   * Remove branch which id` is same as fromBranch in toBranches.`
   */
  from.branchs.forEach(fromBranch => {
    const idx = toBranches.findIndex(bch => bch.id !== -1 && bch.id === fromBranch.id);
    if (idx === -1) {
      return;
    }
    if (fromBranch.name === '' && fromBranch.isEmpty && fromBranch.id !== -1) {
      toBranches.splice(idx, 1);
      return;
    }

    const toBranch = toBranches[idx];
    branchOverwrite(toBranch, fromBranch);
  });
}


function branchOverwrite(to: SkillBranchItem, from: SkillBranch) {
  // 如果 branch.id 一樣但 branch.name 不一樣，先清空所有屬性。
  // branch.name 為空值時，默認兩者同名。
  if (from.name !== '' && to.name !== from.name) {
    to.name = from.name;
    to.attrs = {};
  }

  Object.keys(from.branchAttributes).forEach(key => {
    const value = from.branchAttributes[key];
    if (value === '' && to.attrs[key]) {
      delete to.attrs[key];
    } else {
      to.attrs[key] = value;
    }
  });

  from.stats.forEach(stat => {
    const idx = to.stats.findIndex(_stat => stat.equals(_stat));
    const findedStat = to.stats[idx];
    if (idx === -1) {
      to.stats.push(stat.copy());
    } else {
      if (stat.value === '') {
        to.stats.splice(idx, 1);
      } else {
        findedStat.value = stat.value;
      }
    }
  });
}

function convertEffectEquipment(main: number, sub: number, body: number, operator: 0 | 1): EquipmentRestriction[] {
  const mainList = [
    EquipmentTypes.Empty,
    EquipmentTypes.OneHandSword,
    EquipmentTypes.TwoHandSword,
    EquipmentTypes.Bow,
    EquipmentTypes.Bowgun,
    EquipmentTypes.Staff,
    EquipmentTypes.MagicDevice,
    EquipmentTypes.Knuckle,
    EquipmentTypes.Halberd,
    EquipmentTypes.Katana,
  ] as const;

  const subList = [
    EquipmentTypes.Empty,
    EquipmentTypes.Arrow,
    EquipmentTypes.Shield,
    EquipmentTypes.Dagger,
    EquipmentTypes.MagicDevice,
    EquipmentTypes.Knuckle,
    EquipmentTypes.Katana,
    EquipmentTypes.NinjutsuScroll,
  ] as const;

  const bodyList = [
    EquipmentTypes.Empty,
    EquipmentTypes.BodyDodge,
    EquipmentTypes.BodyDefense,
    EquipmentTypes.BodyNormal,
  ] as const;

  const results: Map<string, EquipmentRestriction> = new Map();
  const appendResult = (data: EquipmentRestriction) => {
    const key = [data.main, data.sub, data.body].map(value => value === null ? '-' : value).join('|');
    results.set(key, data);
  };

  const mainData = main < 10 ? {
    main: main === -1 ? null : mainList[main],
    sub: null,
    body: null,
  } : {
    main: EquipmentTypes.OneHandSword,
    sub: EquipmentTypes.OneHandSword,
    body: null,
  };
  const firstResult: EquipmentRestriction = mainData;
  appendResult(mainData);

  const subItem = sub === -1 ? null : subList[sub];
  if (operator === 1) {
    firstResult.sub = subItem;
  } else {
    appendResult({
      main: null,
      sub: subItem,
      body: null,
    });
  }

  const bodyItem = body === -1 ? null : bodyList[body];
  if (operator === 1) {
    firstResult.body = bodyItem;
  } else {
    appendResult({
      main: null,
      sub: null,
      body: bodyItem,
    });
  }

  return Array.from(results.values());
}

function separateSuffixBranches(effectItem: SkillEffectItem) {
  const suffixBranchList = {
    'damage': ['extra', 'proration', 'base'],
    'effect': ['extra'],
    'next': ['extra'],
    'passive': ['extra'],
    'list': ['list'],
    '@global': ['formula_extra', 'group', {
      name: 'history',
      validation: (bch: SkillBranchItem) => bch.attrs['target_branch'] === undefined,
    }],
  } as Record<string, (string | { name: string; validation: (bch: SkillBranchItem) => Boolean })[]>;

  const searchSuffixList = (current: SkillBranchItem, bch: SkillBranchItem) => {
    return [current.name, '@global'].find(name => {
      const suffixList = suffixBranchList[name];

      return suffixList && suffixList.find(item => typeof item !== 'object' ?
        item === bch.name :
        item.name === bch.name && item.validation(bch));
    });
  };

  const mainBranchNameList = [
    'damage', 'effect', 'proration', 'next', 'list',
    'passive', 'heal', 'text', 'tips', 'stack', 'reference', 'history', 'import',
  ];
  const isMainBranch = (_bch: SkillBranchItem) => mainBranchNameList.includes(_bch.name);
  const resBranches: SkillBranchItem[] = [];
  let spaceFlag = false;

  effectItem.branchItems.forEach(bch => {
    if (bch.name === 'space') {
      spaceFlag = true;
      return;
    }

    const curBranch = resBranches.length !== 0 ? resBranches[resBranches.length - 1] : null;

    if (!curBranch && isMainBranch(bch)) {
      resBranches.push(bch);
      return;
    }
    if (curBranch && !spaceFlag && searchSuffixList(curBranch, bch)) {
      bch.mainBranch = curBranch;
      curBranch.suffixBranches.push(bch);
    } else if (isMainBranch(bch)) {
      resBranches.push(bch);
      spaceFlag = false;
    }
  });
}

function handleVirtualBranches(effectItem: SkillEffectItem) {
  effectItem.branchItems = effectItem.branchItems.filter(branchItem => {
    if (branchItem.name === 'history') {
      const historyItem: BranchHistoryItem = {
        branch: branchItem,
        date: branchItem.attrs['date'],
        hidden: false,
      };
      const targetBranch = effectItem.branchItems.find(bch => bch.id === parseInt(branchItem.attrs['target_branch'], 10));
      targetBranch?.historys.push(historyItem);
      return false;
    }

    // virtial suffixs
    branchItem.suffixBranches = branchItem.suffixBranches.filter(suffix => {
      if (suffix.name === 'group') {
        const groupState: BranchGroupState = {
          size: parseInt(suffix.attrs['size'], 10),
          expandable: suffix.attrs['expandable'] === '1',
          expansion: suffix.attrs['expansion_default'] === '1',
        };
        branchItem.groupState = groupState;
        return false;
      }
      return true;
    });

    return true;
  });
}

function initStackStates(effectItem: SkillEffectItem, vars: { slv: number; clv: number }) {
  const stackStates: BranchStackState[] = effectItem.branchItems.filter(branchItem => branchItem.name === 'stack').map(branchItem => {
    return {
      stackId: parseInt(branchItem.attrs['id'], 10),
      branch: branchItem,
      value: handleFormula(branchItem.attrs['default'] === 'auto' ? branchItem.attrs['min'] : branchItem.attrs['default'], {
        vars: {
          'SLv': vars.slv,
          'CLv': vars.clv,
        },
        toNumber: true,
      }) as number,
    };
  });
  effectItem.stackStates = stackStates;
}

function regressHistoryBranches(effectItem: SkillEffectItem) {
  effectItem.branchItems.forEach(branchItem => {
    const historys = branchItem.historys;
    historys.sort((item1, item2) => new Date(item2.date) >= new Date(item1.date) ? 1 : -1);
    historys.forEach(item => {
      item.branch.name = branchItem.name;
      item.branch.suffixBranches = branchItem.suffixBranches;
    });
    [branchItem, ...historys.map(item => item.branch)].forEach((his, idx, ary) => {
      if (idx === ary.length - 1)
        return;
      const target = ary[idx + 1],
        from = his;

      Object.keys(from.attrs).forEach(key => {
        const value = target.attrs[key];
        if (value === undefined)
          target.attrs[key] = from.attrs[key];
        else if (value === '')
          delete target.attrs[key];
      });

      from.stats.forEach(stat => {
        const statIdx = target.stats.findIndex(_stat => _stat.equals(stat));
        if (statIdx === -1)
          target.stats.push(stat.copy());
        else if (target.stats[statIdx].value === '')
          target.stats.splice(statIdx, 1);
      });
    });
  });
}

function computeBranchAttrValue(branchItem: SkillBranchItem, attrKey: string) {
  let str = branchItem.attrs[attrKey];
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
  const stackMatches = Array.from(str.matchAll(/stack\[(\d+)\]/g));
  stackMatches.forEach(match => {
    const idxValue = parseInt(match[1], 10);
    if (stack[idxValue] === undefined) {
      stack[idxValue] = 0;
    }
  });
  str = str.replace(/stack(?!\[)/g, 'stack[0]');

  const vars = {
    'SLv': branchItem.belongContainer.vars.skillLevel,
    'CLv': branchItem.belongContainer.vars.characterLevel,
    'stack': stack,
  };
  const texts = {} as Record<string, string>;

  const formulaExtra = branchItem.suffixBranches.find(suf => suf.name === 'formula_extra');
  if (formulaExtra) {
    const extraTexts = (formulaExtra.attrs['texts'] || '').split(/\s*,\s*/);
    str = str.replace(/&(\d+):/g, (match, p1) => {
      const key = '__FORMULA_EXTRA_' + p1 + '__';
      texts[key] = extraTexts[p1];
      return key;
    });
  }

  return handleFormula(str, { vars, texts });
}

export {
  convertEffectEquipment,
  effectOverwrite,
  separateSuffixBranches,
  handleVirtualBranches,
  initStackStates,
  regressHistoryBranches,
  computeBranchAttrValue,
};

