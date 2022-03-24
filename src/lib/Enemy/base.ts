import { EnemyElements } from './enums'

interface EnemyBaseParams {
  def?: number;
  mdef?: number;
  physicalResistance?: number;
  magicResistance?: number;
  dodge?: number;
  accuracy?: number;
  element?: EnemyElements;
  prorationNormal?: number;
  prorationPhysical?: number;
  prorationMagic?: number;
  criticalResistance?: number;
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

  constructor({
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
}

type EnemyBasicConditionalType = '#' | '+' | '-'

interface EnemyBasicConditional {
  id: number;
  type: EnemyBasicConditionalType;
  condition: string;
  basic: EnemyBasic;
}

class EnemyBase {
  basic!: EnemyBasic
  conditionalBasics: EnemyBasicConditional[]
  level: number

  constructor(level: number) {
    this.conditionalBasics = []
    this.level = level
  }

  initBasic(params: EnemyBaseParams = {}) {
    this.basic = new EnemyBasic(params)
  }

  appendConditionalBasic(type: EnemyBasicConditionalType, condition: string, basicParams: EnemyBaseParams) {
    this.conditionalBasics.push({
      id: this.conditionalBasics.length,
      type,
      condition,
      basic: new EnemyBasic(basicParams),
    })
  }
}

class EnemyBoss extends EnemyBase {
  hasDifficulty: boolean

  constructor(level: number, hasDifficulty: boolean) {
    super(level)
    this.hasDifficulty = hasDifficulty
  }
}

export { EnemyBoss }
