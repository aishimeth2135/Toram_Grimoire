import { markRaw } from 'vue'

import { EnemyDebuffTypes } from './enums'

export class EnemyDebuff {
  name: string
  type: EnemyDebuffTypes
  caption: string

  private constructor(name: string, type: EnemyDebuffTypes, caption: string) {
    this.name = name
    this.type = type
    this.caption = caption
  }

  static create(name: string, type: EnemyDebuffTypes, caption: string): EnemyDebuff {
    return markRaw(new EnemyDebuff(name, type, caption))
  }
}
