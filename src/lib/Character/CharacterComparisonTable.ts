import type { Character } from './Character'
import { type CharacterBindingBuild, checkLoadedId, getLoadedId } from './Character/CharacterBuild'

export const CHARACTER_COMPARISON_TABLE_LIMIT = 30
export const CHARACTER_COMPARISON_BUILD_TABLE_LIMIT = 10
export const CHARACTER_COMPARISON_CHARACTER_LIMIT = 4

let nextTableId = 0

export interface CharacterComparisonTableSaveData {
  id: number
  name: string
  characterStatIds: string[]
}

export class CharacterComparisonTable implements CharacterBindingBuild {
  readonly id: number
  loadedId: string | null
  name: string
  characterStatIds: string[]

  constructor(name: string, characterStatIds: string[] = []) {
    this.id = nextTableId
    nextTableId += 1
    this.loadedId = null
    this.name = name
    this.characterStatIds = [...new Set(characterStatIds)]
  }

  clone(): CharacterComparisonTable {
    return new CharacterComparisonTable(this.name + '*', this.characterStatIds)
  }

  toggleCharacterStatIds(characterStatId: string): void {
    const index = this.characterStatIds.indexOf(characterStatId)
    if (index === -1) {
      this.characterStatIds.push(characterStatId)
    } else {
      this.characterStatIds.splice(index, 1)
    }
  }

  save(): CharacterComparisonTableSaveData {
    return { id: this.id, name: this.name, characterStatIds: [...this.characterStatIds] }
  }

  static load(
    loadCategory: string,
    data: CharacterComparisonTableSaveData
  ): CharacterComparisonTable {
    const table = new CharacterComparisonTable(data.name, data.characterStatIds)
    table.loadedId = getLoadedId(loadCategory, data.id)
    return table
  }

  matchLoadedId(loadCategory: string, id: number | null): boolean {
    return checkLoadedId(this, loadCategory, id)
  }
}

export interface CharacterComparisonTableBuildSaveData {
  comparedCharacterIds: number[]
  tableIds: number[]
}

export class CharacterComparisonTableBuild {
  comparedCharacters: Character[]
  tables: CharacterComparisonTable[]

  constructor() {
    this.comparedCharacters = []
    this.tables = []
  }

  get isEmpty(): boolean {
    return this.comparedCharacters.length === 0 && this.tables.length === 0
  }

  toggleCharacter(character: Character): void {
    const index = this.comparedCharacters.findIndex(item => item.id === character.id)
    if (index !== -1) {
      this.comparedCharacters.splice(index, 1)
    } else if (this.comparedCharacters.length < CHARACTER_COMPARISON_CHARACTER_LIMIT) {
      this.comparedCharacters.push(character)
    }
  }

  toggleTable(table: CharacterComparisonTable): void {
    const index = this.tables.findIndex(item => item.id === table.id)
    if (index !== -1) {
      this.tables.splice(index, 1)
    } else if (this.tables.length < CHARACTER_COMPARISON_BUILD_TABLE_LIMIT) {
      this.tables.push(table)
    }
  }

  copyFrom(build: CharacterComparisonTableBuild): void {
    this.comparedCharacters = [...build.comparedCharacters]
    this.tables = [...build.tables]
  }

  save(): CharacterComparisonTableBuildSaveData {
    return {
      comparedCharacterIds: this.comparedCharacters.map(character => character.id),
      tableIds: this.tables.map(table => table.id),
    }
  }

  load(
    loadCategory: string,
    data: CharacterComparisonTableBuildSaveData,
    owner: Character,
    characters: Character[],
    tables: CharacterComparisonTable[]
  ): void {
    this.comparedCharacters = [...new Set(data.comparedCharacterIds)]
      .map(id => characters.find(character => character.matchLoadedId(loadCategory, id)))
      .filter((character): character is Character => !!character && character.id !== owner.id)
      .slice(0, CHARACTER_COMPARISON_CHARACTER_LIMIT)
    this.tables = [...new Set(data.tableIds)]
      .map(id => tables.find(table => table.matchLoadedId(loadCategory, id)))
      .filter((table): table is CharacterComparisonTable => !!table)
      .slice(0, CHARACTER_COMPARISON_BUILD_TABLE_LIMIT)
  }
}
