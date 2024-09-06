import { type CSSProperties } from 'vue'

import { Images } from '@/shared/services/Images'
import CY from '@/shared/utils/Cyteria'
import { toInt } from '@/shared/utils/number'

import { Skill, SkillTree } from '../Skill'
import { DrawSkillTreeDataTypes } from './enums'

interface DrawSettingData {
  gridWidth: number
  svgPaddingX: number
  svgPaddingY: number
  textMargin: number
  iconPadding: number
}

function GetDrawSetting(): DrawSettingData {
  return {
    gridWidth: 48,
    svgPaddingX: 48,
    svgPaddingY: 24,
    textMargin: 5,
    iconPadding: 4,
  }
}

function createDrawSkillTreeDefs() {
  const defs = CY.svg.createEmpty('defs') as SVGDefsElement
  defs.id = 'app--draw-skill-tree-defs'

  const gw = GetDrawSetting().gridWidth
  const drawCircle = (cx: number, cy: number, radius: number) => {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    )
    circle.setAttribute('cx', cx.toString())
    circle.setAttribute('cy', cy.toString())
    circle.setAttribute('r', radius.toString())
    circle.setAttribute('fill', 'var(--app-white)')
    circle.setAttribute('stroke-width', '0')
    return circle
  }

  // @lock
  const lockPattern = CY.svg.createEmpty('pattern', {
    width: 1,
    height: 1,
    id: 'skill-icon-lock',
  })
  const lock = CY.svg.create(gw, gw, { x: (gw - 24) / 2, y: (gw - 24) / 2 })
  lock.innerHTML =
    '<path fill="var(--app-primary-30)" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>'
  lockPattern.appendChild(drawCircle(gw / 2, gw / 2, gw / 2))
  lockPattern.appendChild(lock)

  defs.appendChild(lockPattern)

  // background
  const skillIconBg = CY.svg.createLinearGradient(
    'skill-icon-bg',
    '.5',
    '0',
    '.5',
    '1',
    [
      { 'offset': '0%', 'stop-color': 'white' },
      { 'offset': '50%', 'stop-color': '#ffd1ea' },
      { 'offset': '100%', 'stop-color': '#ff9ed3' },
    ]
  )

  defs.appendChild(skillIconBg)

  return defs
}

type SetSkillButtonExtraDataHandle = (
  skill: Skill,
  drawData: DrawSkillTreeDataExtraCallbackPayload
) => DrawSkillTreeData[]
type GetSkillLevelHandler = (skill: Skill) => {
  level: number
  starGemLevel: number
}

interface ComputeDrawSkillTreeDataOptions {
  setSkillButtonExtraData?: SetSkillButtonExtraDataHandle
  getSkillLevel?: GetSkillLevelHandler
}
interface DrawSkillTreeData {
  type: DrawSkillTreeDataTypes
  class?: string[]
  style?: CSSProperties
  skill?: Skill
  [key: string]: any
}
interface DrawSkillTreeDataExtraCallbackPayload extends DrawSettingData {
  cx: number
  cy: number
  lengthTransformFunction: (value: number, type: 'x' | 'y') => number
}

function computeDrawSkillTreeData(
  skillTree: SkillTree,
  {
    setSkillButtonExtraData = () => [],
    getSkillLevel,
  }: ComputeDrawSkillTreeDataOptions = {}
) {
  const findSkillByDrawOrder = (order: number) => {
    return skillTree.skills.find(sk => sk.drawOrder === order)!
  }

  const skills = skillTree.skills
  let drawTreeCode = skillTree.drawTreeCode

  drawTreeCode =
    drawTreeCode ||
    'S E S E S E S L S E S E S E S L S E S E S E S L S E S E S E S'

  const codes = drawTreeCode
    .toUpperCase()
    .replace(/([A-Z])(\d+)/g, (_match, word, count) =>
      Array(toInt(count) ?? 1)
        .fill(word)
        .join(' ')
    )
    .split(/[\s\n]+/)
  const drawData = GetDrawSetting()
  const width = drawData.gridWidth,
    padddingX = drawData.svgPaddingX,
    padddingY = drawData.svgPaddingY,
    textMargin = drawData.textMargin

  const data: DrawSkillTreeData[] = []
  let curx = 0,
    cury = 0,
    maxw = 0,
    cnt = 0

  const tran = (value: number, type: 'x' | 'y') => {
    const paddding = type === 'x' ? padddingX : padddingY
    return paddding + width / 2 + value * width + textMargin
  }

  const tranX = (value: number) => tran(value, 'x')
  const tranY = (value: number) => tran(value, 'y')

  codes.forEach(code => {
    if (cnt === skills.length) {
      return
    }
    const main = code.charAt(0)
    if (main === 'L') {
      if (curx > maxw) {
        maxw = curx
      }
      curx = 0
      cury += 1
    } else if (main === 'E') {
      curx += 1
    } else if (main === 'D' || main === 'S') {
      const subs = code.slice(1).split('')
      subs.forEach(sub => {
        if (sub === 'R') {
          data.push({
            type: DrawSkillTreeDataTypes.TreeLine,
            x1: tranX(curx),
            y1: tranY(cury),
            x2: tranX(curx + 1),
            y2: tranY(cury),
          })
        } else if (sub === 'B') {
          data.push({
            type: DrawSkillTreeDataTypes.TreeLine,
            x1: tranX(curx),
            y1: tranY(cury),
            x2: tranX(curx),
            y2: tranY(cury + 1),
          })
        }
      })
      if (main === 'D') {
        data.push({
          type: DrawSkillTreeDataTypes.TreeDot,
          cx: tranX(curx),
          cy: tranY(cury),
          r: 2,
          class: ['dot'],
        })
      } else if (main === 'S') {
        const skill = findSkillByDrawOrder(cnt)
        const name = skill.name || '?'
        const skillCircleData = {
          type: DrawSkillTreeDataTypes.SkillCircle,
          cx: tranX(curx),
          cy: tranY(cury),
          r: width / 2,
          class: ['skill-circle'],
          style: {} as Record<string, string>,
          skill,
          path: getSkillIconPath(skill),
        }
        let skillNameData: DrawSkillTreeData | null = null,
          extraDatas: DrawSkillTreeData[] = []

        if (name !== '?') {
          if (name !== '@lock') {
            skillNameData = {
              type: DrawSkillTreeDataTypes.SkillName,
              x: tranX(curx),
              y: tranY(cury) - width / 2 - textMargin,
              innerText: name,
              class: ['skill-name'],
            }
            const patid = getSkillIconPatternId(skill)
            skillCircleData.style.fill = 'url(#' + patid + ')'
            extraDatas = setSkillButtonExtraData(
              skill,
              Object.assign(
                {
                  cx: curx,
                  cy: cury,
                  lengthTransformFunction: tran,
                },
                drawData
              ) as DrawSkillTreeDataExtraCallbackPayload
            )

            // render skill level
            if (getSkillLevel) {
              const { level, starGemLevel } = getSkillLevel(skill)
              const offset = drawData.gridWidth / 2 + 3
              const textYFix = 1
              if (level !== 0) {
                extraDatas.push({
                  type: DrawSkillTreeDataTypes.SkillLevelText,
                  x: tranX(curx) + offset,
                  y: tranY(cury) + offset + textYFix,
                  innerText: level,
                  class: ['skill-level-text'],
                })
              }
              if (starGemLevel !== 0) {
                extraDatas.push({
                  type: DrawSkillTreeDataTypes.StarGemLevelText,
                  x: tranX(curx) - offset,
                  y: tranY(cury) + offset + textYFix,
                  innerText: starGemLevel,
                  class: ['star-gem-level-text'],
                })
              }
            }
          } else {
            skillCircleData.class.push('lock')
          }
        }
        data.push(skillCircleData)
        skillNameData && data.push(skillNameData)

        if (!Array.isArray(extraDatas)) {
          throw Error('options: setSkillButon must return array.')
        }
        extraDatas.length > 0 && data.push(...extraDatas)
        cnt += 1
      }
      curx += 1
    } else if (main === 'H') {
      data.push({
        type: DrawSkillTreeDataTypes.TreeLine,
        x1: tranX(curx),
        y1: tranY(cury),
        x2: tranX(curx + 1),
        y2: tranY(cury),
      })
      curx += 1
    } else if (main === 'V') {
      data.push({
        type: DrawSkillTreeDataTypes.TreeLine,
        x1: tranX(curx),
        y1: tranY(cury),
        x2: tranX(curx),
        y2: tranY(cury + 1),
      })
      curx += 1
    }
  })

  if (curx > maxw) {
    maxw = curx
  }

  return {
    data: data,
    width: tranX(maxw) - width / 2 + padddingX,
    height: tranY(cury) + width / 2 + padddingY + textMargin,
  }
}

function getSkillIconPath(skill: Skill | string): string {
  const skillId = typeof skill === 'string' ? skill : skill.skillId
  // return `/imgs/skill_icons/stc_${skill.parent.parent.id}/st_${skill.parent.id}/si_${skill.id}.png`;
  return Images.skillIcons.get(skillId)
}

interface SkillIconPatternDataItem {
  id: string
  width: number
  height: number
  elements: [
    {
      type: 'circle'
      cx: number
      cy: number
      r: number
      class: string[]
    },
    {
      type: 'image'
      path: string
      x: number
      y: number
      width: number
      height: number
    },
  ]
}

function getSkillIconPatternData(
  skillTree: SkillTree
): SkillIconPatternDataItem[] {
  const drawData = GetDrawSetting()
  const width = drawData.gridWidth,
    iconPad = drawData.iconPadding

  return skillTree.skills
    .filter(skill => skill.name !== '@lock')
    .map(skill => {
      return {
        id: getSkillIconPatternId(skill),
        width: 1,
        height: 1,
        elements: [
          {
            type: 'circle',
            cx: width / 2,
            cy: width / 2,
            r: width / 2,
            class: ['skill-icon-pattern-bg'],
          },
          {
            type: 'image',
            path: getSkillIconPath(skill),
            x: iconPad,
            y: iconPad,
            width: width - iconPad * 2,
            height: width - iconPad * 2,
          },
        ],
      }
    })
}

function getSkillIconPatternId(skill: Skill): string {
  return `skill-icon-pattern--${skill.parent.parent.id}-${skill.parent.id}-${skill.id}`
}

export {
  createDrawSkillTreeDefs,
  computeDrawSkillTreeData,
  getSkillIconPatternData,
  GetDrawSetting,
  getSkillIconPath,
}
export type {
  DrawSkillTreeData,
  SetSkillButtonExtraDataHandle,
  GetSkillLevelHandler,
}
