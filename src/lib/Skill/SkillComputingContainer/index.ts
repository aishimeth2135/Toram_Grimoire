import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';
import { StatComputed } from '@/lib/Character/Stat';

import { Skill, SkillBranch, SkillEffect } from '../Skill';
import type { SkillEffectAttrs } from '../Skill';
import { convertEffectEquipment, effectOverwrite, separateSuffixBranches } from './utils';

class SkillComputingContainer {
  skill: Skill;
  effectItems: SkillEffectItem[];

  constructor(skill: Skill) {
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

class SkillEffectItem {
  parent: SkillComputingContainer;
  attrs: SkillEffectAttrs;
  equipments: EquipmentRestriction[];
  branchItems: SkillBranchItem[];

  constructor(parent: SkillComputingContainer, defaultSef: SkillEffect, from: SkillEffect) {
    this.parent = parent;
    this.attrs = Object.assign(defaultSef.attributes, from.attributes);
    this.equipments = convertEffectEquipment(from.mainWeapon, from.subWeapon, from.bodyArmor, from.equipmentOperator);
    this.branchItems = defaultSef.branchs.map(bch => new SkillBranchItem(this, bch));

    effectOverwrite(this, from);
    separateSuffixBranches(this);
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

  constructor(parent: SkillEffectItem, branch: SkillBranch) {
    this.parent = parent;
    this.id = branch.id;
    this.name = branch.name;
    this.attrs = Object.assign({}, branch.branchAttributes);
    this.stats = branch.stats.map(stat => stat.copy());

    this.mainBranch = null;
    this.suffixBranches = [];
  }
}

export default SkillComputingContainer;
export { SkillBranchItem, SkillEffectItem };
export type { EquipmentRestriction };
