import { EnemyBoss } from './Enemy'

export default class EnemySystem {
  bosses: EnemyBoss[]

  private constructor() {
    this.bosses = []
  }

  static create(): EnemySystem {
    return new EnemySystem()
  }
}
