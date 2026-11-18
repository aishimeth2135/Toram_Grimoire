import { markRaw } from 'vue'

import { SkillRoot } from './Skill'

export default class SkillSystem {
  readonly skillRoot: SkillRoot

  private constructor() {
    this.skillRoot = SkillRoot.create()
  }

  static create(): SkillSystem {
    return markRaw(new SkillSystem())
  }
}
