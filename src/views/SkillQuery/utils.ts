import type { SkillEffectItemBase } from '@/lib/Skill/SkillComputingContainer'

function findStackState(effectItem: SkillEffectItemBase, stackId: number) {
  return effectItem.stackStates.find(state => state.stackId === stackId) ?? null
}

const TAG_BUTTON_CLASS_NAME = 'click-button--tag'
function createTagButtons(html: string): string {
  return html
    .replace(/#\[([^\]]+)\]/g, (match, p1) => `<span class="${TAG_BUTTON_CLASS_NAME}">${p1}</span>`)
    .replace(/#([^\s]+)\s(\w?)/g, (match, m1, m2) => {
      let res = `<span class="${TAG_BUTTON_CLASS_NAME}">${m1.replace(new RegExp('_', 'g'), ' ')}</span>`
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

