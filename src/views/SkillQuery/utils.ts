import Grimoire from '@/shared/Grimoire'

import GlossaryTag from '@/lib/Glossary/GlossaryTag'
import type { SkillEffectItemBase } from '@/lib/Skill/SkillComputingContainer'

function findStackState(effectItem: SkillEffectItemBase, stackId: number) {
  return effectItem.stackStates.find(state => state.stackId === stackId) ?? null
}

const TAG_BUTTON_CLASS_NAME = 'click-button--tag'
function createTagButtons(html: string): string {
  return html
    .replace(/#\[([^\]]+)\](?:\[([^\]]+)\])?/g, (match, p1: string, p2: string) => {
      if (!p2) {
        return `<span class="${TAG_BUTTON_CLASS_NAME}" data-tag="${p1.toLowerCase()}">${p1}</span>`
      }
      return `<span class="${TAG_BUTTON_CLASS_NAME}" data-tag="${p2.toLowerCase()}">${p1}</span>`
    })
    .replace(/#([^\s]+)\s(\w?)/g, (match, m1: string, m2: string) => {
      const text = m1.replace(new RegExp('_', 'g'), ' ')
      let res = `<span class="${TAG_BUTTON_CLASS_NAME}" data-tag="${text.toLowerCase()}">${text}</span>`
      if (m2 !== '') {
        res += ' ' + m2
      }
      return res
    })
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

function searchTags(rootTag: GlossaryTag): GlossaryTag[] {
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
      .map(item => Grimoire.Glossary.tags.find(_tag => _tag.name === item))
      .filter(item => item) as GlossaryTag[]

    tags.forEach(_tag => {
      search(_tag)
      resMap.set(_tag.name, _tag)
    })
  }

  search(rootTag)

  return [...resMap.values()]
}

export {
  findStackState,
  createTagButtons,
  searchTags,
  TAG_BUTTON_CLASS_NAME,
}

