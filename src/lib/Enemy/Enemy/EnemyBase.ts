import { EnemyElements } from './enums'

interface EnemyBaseParams {
  def?: number
  mdef?: number
  physicalResistance?: number
  magicResistance?: number
  dodge?: number
  accuracy?: number
  element?: EnemyElements
  prorationNormal?: number
  prorationPhysical?: number
  prorationMagic?: number
  criticalResistance?: number
}

class EnemyBasic {
  def: number
  mdef: number
  physicalResistance: number
  magicResistance: number
  dodge: number
  accuracy: number
  element: EnemyElements
  prorationNormal: number
  prorationPhysical: number
  prorationMagic: number
  criticalResistance: number

  private constructor({
    def = 0,
    mdef = 0,
    physicalResistance = 0,
    magicResistance = 0,
    dodge = 0,
    accuracy = 0,
    element = EnemyElements.Neutral,
    prorationNormal = 0,
    prorationPhysical = 0,
    prorationMagic = 0,
    criticalResistance = 0,
  }: EnemyBaseParams = {}) {
    this.def = def
    this.mdef = mdef
    this.physicalResistance = physicalResistance
    this.magicResistance = magicResistance
    this.dodge = dodge
    this.accuracy = accuracy
    this.element = element
    this.prorationNormal = prorationNormal
    this.prorationPhysical = prorationPhysical
    this.prorationMagic = prorationMagic
    this.criticalResistance = criticalResistance
  }

  static create(params: EnemyBaseParams = {}): EnemyBasic {
    return new EnemyBasic(params)
  }
}

type EnemyBasicConditionalType = '#' | '+' | '-'

interface EnemyBasicConditional {
  id: number
  type: EnemyBasicConditionalType
  condition: string
  basic: EnemyBasic
}

class EnemyBase {
  basic!: EnemyBasic
  conditionalBasics: EnemyBasicConditional[]
  level: number

  protected constructor(level: number) {
    this.conditionalBasics = []
    this.level = level
  }

  static createBase(level: number): EnemyBase {
    return new EnemyBase(level)
  }

  initBasic(params: EnemyBaseParams = {}) {
    this.basic = EnemyBasic.create(params)
  }

  appendConditionalBasic(
    type: EnemyBasicConditionalType,
    condition: string,
    basicParams: EnemyBaseParams
  ) {
    this.conditionalBasics.push({
      id: this.conditionalBasics.length,
      type,
      condition,
      basic: EnemyBasic.create(basicParams),
    })
  }
}

class EnemyBoss extends EnemyBase {
  hasDifficulty: boolean

  private constructor(level: number, hasDifficulty: boolean) {
    super(level)
    this.hasDifficulty = hasDifficulty
  }

  static create(level: number, hasDifficulty: boolean): EnemyBoss {
    return new EnemyBoss(level, hasDifficulty)
  }
}

export { EnemyBoss }
