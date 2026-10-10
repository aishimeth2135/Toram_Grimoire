import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { EnemyDebuff } from './EnemyDebuff'
import { EnemyDebuffTypes } from './enums'

export default class EnemyDebuffService {
  readonly allEnemyDebuffList: EnemyDebuff[]

  private constructor() {
    this.allEnemyDebuffList = []
  }

  static create(): EnemyDebuffService {
    return markRaw(new EnemyDebuffService())
  }

  init() {
    this.allEnemyDebuffList.splice(
      0,
      this.allEnemyDebuffList.length,
      ...Object.values(EnemyDebuffTypes).map(type =>
        EnemyDebuff.create(
          Grimoire.i18n.t(`character-simulator.enemy-debuffs.${type}`),
          type,
          Grimoire.i18n.t(`character-simulator.enemy-debuffs.captions.${type}`)
        )
      )
    )
  }
}

export { EnemyDebuff, EnemyDebuffTypes }
