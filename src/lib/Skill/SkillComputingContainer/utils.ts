import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';

import { SkillBranch, SkillEffect } from '../Skill';
import { SkillBranchItem, SkillEffectItem } from './index';
import type { EquipmentRestriction } from './index';

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

export { effectOverwrite, branchOverwrite, convertEffectEquipment, separateSuffixBranches };
