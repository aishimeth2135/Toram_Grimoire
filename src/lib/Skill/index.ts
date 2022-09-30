import { SkillRoot } from './Skill'

export default class SkillSystem {
  skillRoot: SkillRoot

  constructor() {
    this.skillRoot = new SkillRoot()
  }
}
