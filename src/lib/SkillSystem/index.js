import { SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch, SkillRoot } from "./module/SkillElements.js";

class SkillSystem {
  constructor() {
    this.skillRoot = new SkillRoot(this);
  }
}

SkillSystem.SkillTreeCategory = SkillTreeCategory;
SkillSystem.SkillTree = SkillTree;
SkillSystem.Skill = Skill;
SkillSystem.SkillEffect = SkillEffect;
SkillSystem.SkillBranch = SkillBranch;

export default SkillSystem;