export interface TextWithId {
  id: number
  text: string
}

export function getTextsWithId(strs: string[]): TextWithId[] {
  return strs.map((item, idx) => ({
    id: idx,
    text: item,
  }))
}
