import { SkillRoot } from './Skill'

export default class SkillSystem {
  skillRoot: SkillRoot

  private constructor() {
    this.skillRoot = SkillRoot.create()
  }

  static create(): SkillSystem {
    return new SkillSystem()
  }
}
