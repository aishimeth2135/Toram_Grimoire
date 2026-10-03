import { markRaw } from 'vue'

import { SkillRoot } from './Skill'

export type SkillDataVersion = null | 'v3'

export default class SkillSystem {
  readonly skillRoot: SkillRoot
  dataVersion: SkillDataVersion

  private constructor() {
    this.skillRoot = SkillRoot.create()
    this.dataVersion = null
  }

  static create(): SkillSystem {
    return markRaw(new SkillSystem())
  }

  setDataVersion(value: string) {
    if (value === 'v3') {
      this.dataVersion = value
    }
  }
}
