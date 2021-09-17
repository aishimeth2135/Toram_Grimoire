import { HandleFormulaGetters, HandleFormulaVars } from '@/shared/utils/data';

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';
import { StatComputed } from '@/lib/Character/Stat';

import { Skill, SkillBranch, SkillEffect } from '../Skill';
import type { SkillEffectAttrs } from '../Skill';
import {
  convertEffectEquipment,
  effectOverwrite,
  separateSuffixBranches,
  handleVirtualBranches,
  regressHistoryBranches,
} from './utils';


class SkillComputingContainer {
  vars: {
    characterLevel: number;
    skillLevel: number;
  };

  handleFormulaExtends: {
    vars?: HandleFormulaVars;
    texts?: HandleFormulaGetters;
  };

  constructor() {
    this.vars = {
      characterLevel: 0,
      skillLevel: 0,
    };
    this.handleFormulaExtends = {};
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
    this.effectItems = otherSefs.map(sef => new SkillEffectItem(this, defaultSef, sef));
  }
}

interface EquipmentRestriction {
  main: EquipmentTypes | null;
  sub: EquipmentTypes | null;
  body: EquipmentTypes | null;
}

interface BranchHistoryItem {
  readonly branch: SkillBranchItem;
  readonly date: string;
  hidden: boolean;
}

interface BranchGroupState {
  readonly size: number;
  readonly expandable: boolean;
  expansion: boolean;
}

interface BranchStackState {
  stackId: number;
  branch: SkillBranchItem;
  value: number;
}

class SkillEffectItem {
  parent: SkillItem;
  attrs: SkillEffectAttrs;
  equipments: EquipmentRestriction[];
  branchItems: SkillBranchItem[];
  stackStates: BranchStackState[];

  constructor(parent: SkillItem, defaultSef: SkillEffect, from: SkillEffect) {
    this.parent = parent;
    this.attrs = Object.assign(defaultSef.attributes, from.attributes);
    this.equipments = convertEffectEquipment(from.mainWeapon, from.subWeapon, from.bodyArmor, from.equipmentOperator);
    this.branchItems = defaultSef.branchs.map(bch => new SkillBranchItem(this, bch));
    this.stackStates = [];

    effectOverwrite(this, from);
    separateSuffixBranches(this);
    handleVirtualBranches(this);
    regressHistoryBranches(this);
  }
}

class SkillBranchItem {
  parent: SkillEffectItem;
  id: number;
  name: string;
  attrs: Record<string, string>;
  stats: StatComputed[];
  mainBranch: null | SkillBranchItem;
  suffixBranches: SkillBranchItem[];
  historys: BranchHistoryItem[];
  groupState: BranchGroupState | null;

  constructor(parent: SkillEffectItem, branch: SkillBranch) {
    this.parent = parent;
    this.id = branch.id;
    this.name = branch.name;
    this.attrs = Object.assign({}, branch.branchAttributes);
    this.stats = branch.stats.map(stat => stat.copy());

    this.mainBranch = null;
    this.suffixBranches = [];

    this.historys = [];

    this.groupState = null;
  }

  get belongContainer() {
    return this.parent.parent.parent;
  }

  computeValue(key: string) {
    return this.attrs[key];
  }
}

export default SkillComputingContainer;
export { SkillBranchItem, SkillEffectItem };
export type { EquipmentRestriction, BranchHistoryItem, BranchGroupState, BranchStackState };
