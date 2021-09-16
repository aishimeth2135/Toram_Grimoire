
import Grimoire from '@/shared/Grimoire';

import { StatTypes } from '@/lib/Character/Stat/enums';
import { StatComputed } from '@/lib/Character/Stat';

abstract class SkillNode {
  abstract parent: SkillNode | null;
}

abstract class SkillElement extends SkillNode {
  id: number;
  name: string;
  abstract get index(): number;

  constructor(id: number, name: string) {
    super();
    this.id = id;
    this.name = name;
  }
}

class SkillRoot extends SkillNode {
  parent: null;
  skillTreeCategorys: SkillTreeCategory[];

  constructor() {
    super();
    this.parent = null;
    this.skillTreeCategorys = [];
  }

  get index() {
    return -1;
  }

  appendSkillTreeCategory(id: number, name: string) {
    const el = new SkillTreeCategory(this, id, name);
    this.skillTreeCategorys.push(el);
    return el;
  }

  findSkillByName(name: string): Skill | null {
    let find: Skill | null = null;
    this.skillTreeCategorys.forEach(stc => {
      if (find) return;
      stc.skillTrees.forEach(st => {
        if (find) return;
        const skill = st.skills.find(sk => sk.name === name);
        if (skill !== undefined)
          find = skill;
      });
    });
    return find;
  }
}


class SkillTreeCategory extends SkillElement {
  parent: SkillRoot;
  skillTrees: SkillTree[];

  constructor(sr: SkillRoot, id: number, name: string) {
    super(id, name);
    this.parent = sr;
    this.skillTrees = [];
  }

  get index() {
    return this.parent.skillTreeCategorys.indexOf(this);
  }

  appendSkillTree(id: number, name: string) {
    const el = new SkillTree(this, id, name);
    this.skillTrees.push(el);
    return el;
  }
}


class SkillTree extends SkillElement {
  parent: SkillTreeCategory;
  skills: Skill[];
  attrs: {
    simulatorFlag: boolean;
  };
  drawTreeCode: string;

  constructor(stc: SkillTreeCategory, id: number, name: string) {
    super(id, name);
    this.parent = stc;
    this.skills = [];

    this.drawTreeCode = '';

    this.attrs = {
      simulatorFlag: false,
    };
  }

  get index() {
    return this.parent.skillTrees.indexOf(this);
  }

  init(dtc: string) {
    this.drawTreeCode = dtc;
  }

  appendSkill(id: number, name: string) {
    const el = new Skill(this, id, name);
    this.skills.push(el);
    return el;
  }
}



abstract class SkillBase extends SkillElement {
  parent: SkillTree;
  caption: string;
  previous: number;
  drawOrder: number;

  constructor(st: SkillTree, id: number, name: string, caption: string = '') {
    super(id, name);
    this.parent = st;
    this.caption = caption;
    this.previous = -1;
    this.drawOrder = id;
  }

  init(pre: number, drawOrder: number) {
    this.previous = pre;
    this.drawOrder = drawOrder;
  }
}


class Skill extends SkillBase {
  effects: SkillEffect[];
  private _defaultEffect: SkillEffect | null;

  constructor(st: SkillTree, id: number, name: string, caption: string = '') {
    super(st, id, name, caption);

    this.effects = [];
    this._defaultEffect = null;
  }

  get index() {
    return this.parent.skills.indexOf(this);
  }

  get defaultEffect(): SkillEffect {
    return this._defaultEffect as SkillEffect;
  }

  appendSkillEffect(main: number, sub: number, body: number) {
    const el = new SkillEffect(this, main, sub, body);
    this.effects.push(el);
    return el;
  }

  setDefaultEffect(sef: SkillEffect) {
    this._defaultEffect = sef;
    return this;
  }
}

interface SkillEffectAttrs {
  mpCost: string;
  range: string;
  skillType: number;
  inCombo: number;
  actionTime: number;
  castingTime: string;
}

class SkillEffect extends SkillNode {
  parent: Skill;
  branchs: SkillBranch[];
  mainWeapon: number;
  subWeapon: number;
  bodyArmor: number;
  attributes: SkillEffectAttrs;

  // 0: or, 1: and
  equipmentOperator: 0 | 1;

  constructor(skill: Skill, main: number, sub: number, body: number) {
    super();
    this.parent = skill;
    this.branchs = [];
    this.mainWeapon = main;
    this.subWeapon = sub;
    this.bodyArmor = body;
    this.attributes = {
      mpCost: '0',
      range: '0',
      skillType: 0,
      inCombo: 0,
      actionTime: 3,
      castingTime: '0',
    };
    this.equipmentOperator = 0;
  }

  appendSkillBranch(id: number, name: string) {
    const el = new SkillBranch(this, id, name);
    this.branchs.push(el);
    return el;
  }
}

class SkillBranch extends SkillNode {
  parent: SkillEffect;

  // id of branch. -1 means no define
  id: number;
  // type of branch
  name: string;

  branchAttributes: Record<string, string>;
  stats: StatComputed[];

  private _attributeEmpty: boolean;

  constructor(sef: SkillEffect, id: number, name: string) {
    super();
    this.parent = sef;
    this.id = id;
    this.name = name;
    this.branchAttributes = {};
    this.stats = [];

    this._attributeEmpty = true;
  }

  get isEmpty() {
    return this._attributeEmpty && this.stats.length === 0;
  }

  appendBranchAttribute(name: string, value: string) {
    this._attributeEmpty = false;
    this.branchAttributes[name] = value;
    return this;
  }

  appendStat(baseName: string, value: string, tail: string): StatComputed | null {
    const type = (() => {
      if (tail === '%') {
        return StatTypes.Multiplier;
      }
      if (tail === '~') {
        return StatTypes.Total;
      }
      return StatTypes.Constant;
    })();
    const statBase = Grimoire.Character.findStatBase(baseName);
    if (!statBase) {
      return null;
    }
    const stat = statBase.createStatComputed(type, value);
    this.stats.push(stat);
    return stat;
  }
}


class LevelSkillTree {
  base: SkillTree;
  levelSkills: LevelSkill[];

  constructor(st: SkillTree) {
    this.base = st;
    this.levelSkills = [];
  }

  appendLevelSkill(skill: Skill) {
    const el = new LevelSkill(this, skill);
    this.levelSkills.push(el);
    return el;
  }

  skillPointCost() {
    return this.levelSkills.reduce((cur, skill) => cur + skill.level(), 0);
  }

  starGemSkillPoint() {
    return this.levelSkills
      .reduce((c, skill) => c + Math.max(0, skill.starGemLevel() - skill.level()), 0);
  }
}

class LevelSkill {
  parent: LevelSkillTree;
  base: Skill;

  private _level: number;
  private _starGemLevel: number;

  constructor(st: LevelSkillTree, skill: Skill) {
    this.parent = st;
    this.base = skill;

    this._level = 0;
    this._starGemLevel = 0;
  }
  level(value?: number) {
    if (typeof value === 'number') {
      value = Math.max(0, Math.min(10, value));
      this._level = value;
    }
    return this._level;
  }
  addLevel(value: number) {
    this.level(this._level + value);
    return this._level;
  }

  updateTree(forward = false) {
    if (!forward) {
      let current: LevelSkill = this;
      while (current.base.previous !== -1) {
        const pre = current.parent.levelSkills.find(sk => sk.base.id === current.base.previous);
        if (!pre) {
          break;
        }
        current = pre;
        current.level() < 5 && current.level(5);
      }
    } else if (forward && this.level() < 5) {
      const stk: LevelSkill[] = [this];
      while (stk.length !== 0) {
        const current = stk.pop() as LevelSkill;
        this.parent.levelSkills.forEach(skill => {
          if (skill.base.previous === current.base.id) {
            stk.push(skill);
            skill.level() > 0 && skill.level(0);
          }
        });
      }
    }
  }
  starGemLevel(value?: number) {
    if (typeof value === 'number') {
      value = Math.max(0, Math.min(10, value));
      this._starGemLevel = value;
    }

    return this._starGemLevel;
  }
  addStarGemLevel(value: number) {
    this.starGemLevel(this._starGemLevel + value);
    return this._starGemLevel;
  }

  get id() {
    return this.base.id;
  }
}


export { SkillElement, SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch, LevelSkillTree, LevelSkill };
export type { SkillEffectAttrs };
