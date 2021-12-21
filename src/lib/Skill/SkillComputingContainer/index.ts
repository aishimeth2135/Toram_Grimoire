import { markRaw } from 'vue';

import { HandleFormulaTexts, HandleFormulaVars } from '@/shared/utils/data';

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';
import { StatComputed } from '@/lib/Character/Stat';
import { StatTypes } from '@/lib/Character/Stat/enums';

import { Skill, SkillBranch, SkillEffect, SkillEffectHistory } from '../Skill';
import {
  convertEffectEquipment,
  effectOverwrite,
  separateSuffixBranches,
  handleVirtualBranches,
  regressHistoryBranches,
  setBranchAttrsDefaultValue,
  initStackStates,
  effectAttrsToBranch,
} from './utils';
import { SkillBranchNames } from '../Skill/enums';
import { FormulaDisplayModes } from './enums';
class SkillComputingContainer {
  vars: {
    characterLevel: number;
    skillLevel: number;
  };

  handleFormulaExtends: {
    vars: HandleFormulaVars;
    texts: HandleFormulaTexts;
  };

  config: {
    formulaDisplayMode: FormulaDisplayModes;
  };

  constructor() {
    this.vars = {
      characterLevel: 250,
      skillLevel: 10,
    };
    this.handleFormulaExtends = markRaw({
      vars: {},
      texts: {},
    });
    this.config = {
      formulaDisplayMode: FormulaDisplayModes.Normal,
    };
  }

  createSkillItem(skill: Skill) {
    return new SkillItem(this, skill);
  }
}

class SkillItem {
  readonly parent: SkillComputingContainer;
  readonly skill: Skill;
  readonly effectItems: SkillEffectItem[];

  constructor(parent: SkillComputingContainer, skill: Skill) {
    this.parent = parent;
    this.skill = skill;

    const defaultSef = skill.defaultEffect;
    const otherSefs = skill.effects.filter(sef => sef !== defaultSef);
    this.effectItems = markRaw([
      new SkillEffectItem(this, defaultSef),
      ...otherSefs.map(sef => new SkillEffectItem(this, defaultSef, sef)),
    ]);
  }

  findEffectItem(equipment: EquipmentRestriction) {
    return this.effectItems.find(effectItem => effectItem.equipmentMatch(equipment)) ?? null;
  }
}

interface EquipmentRestriction {
  main: EquipmentTypes | null;
  sub: EquipmentTypes | null;
  body: EquipmentTypes | null;
}

interface BranchGroupState {
  readonly size: number;
  readonly expandable: boolean;
  expanded: boolean;
  parentExpanded: boolean;
  isGroupEnd: boolean;
}

interface BranchStackState {
  readonly stackId: number;
  readonly branch: SkillBranchItem;
  value: number;
}

abstract class SkillEffectItemBase {
  abstract readonly branchItems: SkillBranchItem<SkillEffectItemBase>[];

  readonly parent: SkillItem;
  readonly stackStates: BranchStackState[];

  constructor(parent: SkillItem) {
    this.parent = parent;
    this.stackStates = [];
  }
}

class SkillEffectItem extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItem>[];

  readonly equipments: EquipmentRestriction[];
  readonly historys: SkillEffectItemHistory[];

  constructor(parent: SkillItem, defaultSef: SkillEffect, from?: SkillEffect) {
    super(parent);

    this.branchItems = markRaw(defaultSef.branches.map(bch => new SkillBranchItem(this, bch)));
    if (!this.branchItems.some(branchItem => branchItem.name === SkillBranchNames.Basic)) {
      const basicBranch = effectAttrsToBranch(defaultSef);
      this.branchItems.unshift(new SkillBranchItem(this, basicBranch));
    }

    const current = from ? from : defaultSef;
    const dualSwordRegress = defaultSef.parent.effects.every(eft => eft.mainWeapon !== 10);
    this.equipments = markRaw(convertEffectEquipment(
      current.mainWeapon,
      current.subWeapon,
      current.bodyArmor,
      current.equipmentOperator,
      dualSwordRegress,
    ));

    this.historys = markRaw(current.historys.map(history => new SkillEffectItemHistory(parent, this, history)));

    if (from) {
      effectOverwrite(this, from);
    }
    setBranchAttrsDefaultValue(this);

    regressHistoryBranches(this);
    this.historys.forEach(history => initStackStates(history));

    separateSuffixBranches(this);
    handleVirtualBranches(this);

    this.historys.forEach(history => {
      separateSuffixBranches(history);
      handleVirtualBranches(history);
    });

    initStackStates(this);
  }

  equipmentMatch(equipment: EquipmentRestriction): boolean {
    return this.equipments.some(effectEquipment => {
      if (effectEquipment.main === null && effectEquipment.sub === null && effectEquipment.body === null) {
        return true;
      }
      let atLeastOneEqual = false;
      const res = (['main', 'sub', 'body'] as const).every(key => {
        if (effectEquipment[key] === null || equipment[key] === null) {
          return true;
        }
        const equal = effectEquipment[key] === equipment[key];
        if (equal) {
          atLeastOneEqual = true;
        }
        return equal;
      });
      return atLeastOneEqual && res;
    });
  }

  equipmentId() {
    const keys = ['main', 'sub', 'body'] as const;
    return this.equipments.map(equip => keys.map(key => equip[key] || 'none').join('+')).join('/');
  }
}

class SkillEffectItemHistory extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItemHistory>[];

  readonly origin: SkillEffectHistory;
  readonly parentEffect: SkillEffectItem;
  readonly date: string;
  readonly introductionBranches: SkillBranchItem[];
  readonly removedBranches: SkillBranchItem[];

  // store the previous branch of every item in branchItems
  nexts: Map<SkillBranchItem, SkillBranchItem | null>;

  constructor(parent: SkillItem, parentEffect: SkillEffectItem, historyEffect: SkillEffectHistory) {
    super(parent);
    this.branchItems = historyEffect.branches.map(bch => new SkillBranchItem(this, bch));

    this.origin = historyEffect;
    this.parentEffect = parentEffect;
    this.date = historyEffect.date;
    this.nexts = markRaw(new Map());
    this.introductionBranches = markRaw([]);
    this.removedBranches = markRaw([]);
  }

  get modifiedBranchItems() {
    return this.branchItems.filter(branchItem => {
      if (branchItem.id !== -1 && this.origin.branches.find(bch => bch.id === branchItem.id)) {
        return true;
      }
      return branchItem.suffixBranches.some(suffix => suffix.id !== -1 && this.origin.branches.find(bch => suffix.id === bch.id));
    });
  }
}

type BranchOverwriteRecord<T> = {
  overwrite: T[];
  append: T[];
  remove: T[];
};
abstract class SkillBranchItemBase<Parent extends SkillEffectItemBase = SkillEffectItemBase> {
  private _attrs: Record<string, string>;

  private _name: SkillBranchNames;
  private _inherit: SkillBranchNames | null;

  // -1 means undefined
  readonly id: number;

  readonly parent: Parent;
  readonly stats: StatComputed[];

  readonly isEmpty: boolean;

  /* default branch from default effect that has not been overwritten  */
  readonly default: SkillBranch;

  readonly record: {
    attrs: BranchOverwriteRecord<string>;
    stats: BranchOverwriteRecord<[string, StatTypes]>;
  };

  abstract clone(): SkillBranchItemBase;

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItemBase) {
    this.parent = parent;
    this.id = branch.id;

    this._name = branch.name;
    this._inherit = null;
    this.name = this._name; // init _inherit

    this._attrs = markRaw(Object.assign({}, branch instanceof SkillBranch ? branch.branchAttributes : branch.allAttrs));
    this.stats = markRaw(branch.stats.map(stat => stat.copy()));

    this.isEmpty = branch.isEmpty;

    this.default = branch instanceof SkillBranch ? branch : branch.default;

    this.record = {
      attrs: {
        overwrite: [],
        append: [],
        remove: [],
      },
      stats: {
        overwrite: [],
        append: [],
        remove: [],
      },
    };
  }

  get name(): SkillBranchNames {
    if (this._inherit !== null) {
      return this._inherit;
    }
    return this._name;
  }

  set name(value: SkillBranchNames) {
    if (value === SkillBranchNames.Next) {
      this._inherit = SkillBranchNames.Effect;
    }
    this._name = value;
  }

  get realName(): SkillBranchNames {
    return this._name;
  }

  get belongContainer() {
    return this.parent.parent.parent;
  }

  get allAttrs() {
    return this._attrs;
  }

  attr(key: string): string {
    return this._attrs[key] || '';
  }

  attrNumber(key: string): number {
    const attr = parseInt(this._attrs[key], 10);
    return Number.isNaN(attr) ? 0 : attr;
  }

  attrBoolean(key: string): boolean {
    return this._attrs[key] === '1';
  }

  hasAttr(key: string) {
    return this._attrs[key] !== undefined;
  }

  setAttr(key: string, value: string) {
    this._attrs[key] = value;
  }

  removeAttr(key: string) {
    delete this._attrs[key];
  }

  clearAttr() {
    this._attrs = {};
  }
}

class SkillBranchItem<Parent extends SkillEffectItemBase = SkillEffectItemBase> extends SkillBranchItemBase<Parent> {
  readonly suffixBranches: SkillBranchItemSuffix[];
  groupState: BranchGroupState;

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItem) {
    super(parent, branch);

    this.suffixBranches = markRaw([]);

    this.groupState = {
      size: 0,
      expandable: false,
      expanded: true,
      parentExpanded: true,
      isGroupEnd: false,
    };
  }

  get stackId() {
    if (this.name === SkillBranchNames.Stack) {
      return this.attrNumber('id');
    }
    return null;
  }

  get isGroup(): boolean {
    return this.groupState.size > 0;
  }

  /**
   * Toggle expanded of group state of item
   * @param root - whether this item is called from external
   * @param [force]
   */
  toggleGroupExpanded(root: boolean, force?: boolean | null) {
    force = force ?? !this.groupState.expanded;
    if (this.isGroup) {
      const { branchItems } = this.parent;
      const idx = branchItems.indexOf(this);
      let remain = this.groupState.size;
      let cur = idx + 1;
      let bitem: SkillBranchItem | null = null;
      while (cur < branchItems.length && remain !== 0) {
        bitem = branchItems[cur];
        bitem.toggleGroupExpanded(false, force);
        cur += bitem.groupState.size + 1;
        remain -= 1;
      }
      if (bitem) {
        bitem.groupState.isGroupEnd = force;
      }
    }
    if (!root) {
      this.groupState.parentExpanded = force;
      this.groupState.isGroupEnd = false;
    } else {
      this.groupState.expanded = force;
    }
  }

  toSuffix(mainBranch: SkillBranchItem): SkillBranchItemSuffix {
    return new SkillBranchItemSuffix(this.parent, this, mainBranch);
  }

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(parent?: TargetParent): SkillBranchItem<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent;
    const clone = new SkillBranchItem(parent as TargetParent, this);

    clone.suffixBranches.push(...this.suffixBranches.map(suf => suf.clone()));

    clone.record.attrs.overwrite = this.record.attrs.overwrite.slice();
    clone.record.attrs.append = this.record.attrs.append.slice();
    clone.record.attrs.remove = this.record.attrs.remove.slice();

    clone.record.stats.overwrite = this.record.stats.overwrite.map(item => item.slice() as [string, StatTypes]);
    clone.record.stats.append = this.record.stats.append.map(item => item.slice() as [string, StatTypes]);
    clone.record.stats.remove = this.record.stats.remove.map(item => item.slice() as [string, StatTypes]);

    return clone;
  }
}

class SkillBranchItemSuffix<Parent extends SkillEffectItemBase = SkillEffectItemBase> extends SkillBranchItemBase<Parent> {
  readonly mainBranch: SkillBranchItem;

  constructor(parent: Parent, branch: SkillBranchItemBase, mainBranch: SkillBranchItem) {
    super(parent, branch);

    this.mainBranch = mainBranch;
  }

  override clone(): SkillBranchItemSuffix {
    return new SkillBranchItemSuffix(this.parent, this, this.mainBranch);
  }
}

export default SkillComputingContainer;
export {
  SkillItem,
  SkillEffectItem,
  SkillEffectItemHistory,
  SkillBranchItem,
  SkillBranchItemSuffix,
};
export type {
  SkillEffectItemBase,
  SkillBranchItemBase,
  EquipmentRestriction,
  BranchGroupState,
  BranchStackState,
};
