import { GlossaryTag } from './GlossaryTag'

export default class GlossarySystem {
  tags: GlossaryTag[]

  private _includesTagsCache!: Map<string, GlossaryTag[]>

  constructor() {
    this.tags = []
  }

  appendTag(name: string) {
    const tag = new GlossaryTag(name)
    this.tags.push(tag)
    return tag
  }

  getTagByName(name: string) {
    return this.tags.find(tag => tag.name === name)
  }

  getIncludedTags(rootTag: GlossaryTag): GlossaryTag[] {
    if (!this._includesTagsCache) {
      this._includesTagsCache = new Map()
    }
    if (this._includesTagsCache.has(rootTag.name)) {
      return this._includesTagsCache.get(rootTag.name)!
    }

    const resMap = new Map<string, GlossaryTag>()
    const search = (tag: GlossaryTag) => {
      const set = new Set<string>()
      tag.rows.forEach(row => {
        row.value.forEach(item => {
          searchTagValueTags(item).forEach(_item => {
            if (!resMap.has(_item) && _item !== rootTag.name) {
              set.add(_item)
            }
          })
        })
      })
      if (set.size === 0) {
        return
      }
      const tags = [...set]
        .map(item => this.tags.find(_tag => _tag.name === item))
        .filter(item => item) as GlossaryTag[]

      tags.forEach(_tag => {
        search(_tag)
        resMap.set(_tag.name, _tag)
      })
    }
    search(rootTag)

    const res = [...resMap.values()]
    this._includesTagsCache.set(rootTag.name, res)
    return res
  }
}

function searchTagValueTags(value: string): string[] {
  const res: string[] = []
  for (const match of value.matchAll(/#\[([^\]]+)\](?:\[([^\]]+)\])?/g)) {
    res.push(match[2] || match[1])
  }
  for (const match of value.matchAll(/#([^\s]+)\s(\w?)/g)) {
    res.push(match[1])
  }
  return res
}
