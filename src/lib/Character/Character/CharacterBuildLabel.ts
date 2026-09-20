import { type ShallowReactive, shallowReactive } from 'vue'

import { type CharacterBindingBuild, checkLoadedId, initLoadedId } from './CharacterBuild'

interface CharacterBuildLabelSaveData {
  id: number
  text: string
  color: string
}

class CharacterBuildLabel implements CharacterBindingBuild {
  private static _autoIncreasement = 0

  id: number
  text: string
  color: string
  loadedId: string | null

  private constructor(text: string) {
    this.id = CharacterBuildLabel._autoIncreasement
    CharacterBuildLabel._autoIncreasement += 1
    this.text = text
    this.color = 'red'
    this.loadedId = null
  }

  static create(text: string): CharacterBuildLabel {
    return new CharacterBuildLabel(text)
  }

  matchLoadedId(loadCategory: string, id: number | null): boolean {
    return checkLoadedId(this, loadCategory, id)
  }

  save(): CharacterBuildLabelSaveData {
    return {
      id: this.id,
      text: this.text,
      color: this.color,
    }
  }

  private toReactive(): ShallowReactive<CharacterBuildLabel> {
    return shallowReactive(this)
  }

  static fromLoad(loadedCategory: string, data: CharacterBuildLabelSaveData): CharacterBuildLabel {
    const newLabel = CharacterBuildLabel.create(data.text)
    newLabel.color = data.color
    initLoadedId(newLabel, loadedCategory, data.id)
    return newLabel
  }

  static fromLoadWithShallowReactive(
    loadedCategory: string,
    data: CharacterBuildLabelSaveData
  ): ShallowReactive<CharacterBuildLabel> {
    return CharacterBuildLabel.fromLoad(loadedCategory, data).toReactive()
  }

  static createWithShallowReactive(text: string): ShallowReactive<CharacterBuildLabel> {
    return CharacterBuildLabel.create(text).toReactive()
  }
}

export type { CharacterBuildLabelSaveData }
export { CharacterBuildLabel }
