import { markRaw } from 'vue';

import { HandleFormulaTexts, HandleFormulaVars } from '@/shared/utils/data';

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';
import { StatComputed } from '@/lib/Character/Stat';

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
    this.handleFormulaExtends = {
      vars: {},
      texts: {},
    };
    this.config = {
      formulaDisplayMode: FormulaDisplayModes.Normal,
    };
  }

  createSkillItem(skill: Skill) {
    return new SkillItem(this, skill);
  }
}

class SkillItem {
  parent: SkillComputingContainer;
  skill: Skill;
  effectItems: SkillEffectItem[];

  constructor(parent: SkillComputingContainer, skill: Skill) {
    this.parent = parent;
    this.skill = skill;

    const defaultSef = skill.defaultEffect;
    const otherSefs = skill.effects.filter(sef => sef !== defaultSef);
    this.effectItems = [
      new SkillEffectItem(this, defaultSef),
      ...otherSefs.map(sef => new SkillEffectItem(this, defaultSef, sef)),
    ];
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
  stackId: number;
  branch: SkillBranchItem;
  value: number;
}

abstract class SkillEffectItemBase {
  abstract branchItems: SkillBranchItem<SkillEffectItemBase>[];

  parent: SkillItem;
  stackStates: BranchStackState[];

  constructor(parent: SkillItem) {
    this.parent = parent;
    this.stackStates = [];
  }
}

class SkillEffectItem extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItem>[];

  equipments: EquipmentRestriction[];
  historys: SkillEffectItemHistory[];

  constructor(parent: SkillItem, defaultSef: SkillEffect, from?: SkillEffect) {
    super(parent);

    this.branchItems = defaultSef.branches.map(bch => new SkillBranchItem(this, bch));
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
    this.stackStates = [];
    this.historys = current.historys.map(history => new SkillEffectItemHistory(parent, this, history));

    if (from) {
      effectOverwrite(this, from);
    }
    setBranchAttrsDefaultValue(this);
    regressHistoryBranches(this);

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

  origin: SkillEffectHistory;
  parentEffect: SkillEffectItem;
  date: string;
  removedBranches: SkillBranchItem[];

  // store the previous branch of every item in branchItems
  nexts: Map<SkillBranchItem, SkillBranchItem | null>;

  constructor(parent: SkillItem, parentEffect: SkillEffectItem, historyEffect: SkillEffectHistory) {
    super(parent);
    this.branchItems = historyEffect.branches.map(bch => new SkillBranchItem(this, bch));

    this.origin = historyEffect;
    this.parentEffect = parentEffect;
    this.date = historyEffect.date;
    this.nexts = new Map();
    this.removedBranches = [];

    initStackStates(this);
  }

  get modifiedBranchItems() {
    return this.branchItems.filter(branchItem => branchItem.id !== -1 && this.origin.branches.find(bch => bch.id === branchItem.id));
  }
}

abstract class SkillBranchItemBase<Parent extends SkillEffectItemBase = SkillEffectItemBase> {
  private _attrs: Record<string, string>;

  private _name: SkillBranchNames;
  private _inherit: SkillBranchNames | null;

  // -1 means undefined
  id: number;

  parent: Parent;
  stats: StatComputed[];

  readonly isEmpty: boolean;

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItem) {
    this.parent = parent;
    this.id = branch.id;

    this._name = branch.name;
    this._inherit = null;
    this.name = this._name; // init _inherit

    this._attrs = markRaw(Object.assign({}, branch instanceof SkillBranch ? branch.branchAttributes : branch.allAttrs));
    this.stats = markRaw(branch.stats.map(stat => stat.copy()));

    this.isEmpty = branch.isEmpty;
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
  suffixBranches: SkillBranchItemSuffix[];
  groupState: BranchGroupState;

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItem) {
    super(parent, branch);

    this.suffixBranches = [];

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
}

class SkillBranchItemSuffix<Parent extends SkillEffectItemBase = SkillEffectItemBase> extends SkillBranchItemBase<Parent> {
  mainBranch: SkillBranchItem;

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItem, mainBranch: SkillBranchItem) {
    super(parent, branch);

    this.mainBranch = mainBranch;
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
