import { CharacterCombo, type CharacterComboSaveData } from '../CharacterCombo'

interface CharacterComboBuildSaveData {
  combos: CharacterComboSaveData[]
}

export class CharacterComboBuild {
  combos: CharacterCombo[]

  private constructor() {
    this.combos = []
    this.appendCombo()
  }

  static create(): CharacterComboBuild {
    return new CharacterComboBuild()
  }

  appendCombo() {
    const newCombo = CharacterCombo.create()
    this.combos.push(newCombo)
    return newCombo
  }

  save(): CharacterComboBuildSaveData {
    return {
      combos: this.combos.map(combo => combo.save()),
    }
  }

  static load(data: CharacterComboBuildSaveData): CharacterComboBuild {
    const newBuild = CharacterComboBuild.create()
    newBuild.combos = data.combos.map(item => CharacterCombo.load(item))
    return newBuild
  }
}

export type { CharacterComboBuildSaveData }
