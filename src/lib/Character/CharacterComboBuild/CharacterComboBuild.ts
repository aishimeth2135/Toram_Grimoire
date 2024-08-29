import { CharacterCombo, type CharacterComboSaveData } from '../CharacterCombo'

interface CharacterComboBuildSaveData {
  combos: CharacterComboSaveData[]
}

export class CharacterComboBuild {
  combos: CharacterCombo[]

  constructor() {
    this.combos = []
    this.appendCombo()
  }

  appendCombo() {
    const newCombo = new CharacterCombo()
    this.combos.push(newCombo)
    return newCombo
  }

  save(): CharacterComboBuildSaveData {
    return {
      combos: this.combos.map(combo => combo.save()),
    }
  }

  static load(data: CharacterComboBuildSaveData): CharacterComboBuild {
    const newBuild = new CharacterComboBuild()
    newBuild.combos = data.combos.map(item => CharacterCombo.load(item))
    return newBuild
  }
}

export type { CharacterComboBuildSaveData }
