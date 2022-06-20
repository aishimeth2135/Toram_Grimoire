import type { SkillEffectItemBase } from '@/lib/Skill/SkillComputingContainer'

function findStackState(effectItem: SkillEffectItemBase, stackId: number) {
  return effectItem.stackStates.find(state => state.stackId === stackId) ?? null
}

const TAG_BUTTON_CLASS_NAME = 'click-button--tag'
function createTagButtons(html: string): string {
  return html
    .replace(/#\[([^\]]+)\](?:\[([^\]]+)\])?/g, (match, p1, p2) => {
      if (!p2) {
        return `<span class="${TAG_BUTTON_CLASS_NAME}" data-tag="${p1.toLowerCase()}">${p1}</span>`
      }
      return `<span class="${TAG_BUTTON_CLASS_NAME}" data-tag="${p2.toLowerCase()}">${p1}</span>`
    })
    .replace(/#([^\s]+)\s(\w?)/g, (match, m1, m2) => {
      const text = m1.replace(new RegExp('_', 'g'), ' ') as string
      let res = `<span class="${TAG_BUTTON_CLASS_NAME}" data-tag="${text.toLowerCase()}">${text}</span>`
      if (m2 !== '') {
        res += ' ' + m2
      }
      return res
    })
}

export {
  findStackState,
  createTagButtons,
  TAG_BUTTON_CLASS_NAME,
}

