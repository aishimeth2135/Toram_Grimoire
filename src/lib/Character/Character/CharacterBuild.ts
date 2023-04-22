export interface CharacterBuildBindOnCharacter {
  instanceId: number
  loadedId: string | null
  matchLoadedId: (loadCategory: string, id: number | null) => boolean
}
