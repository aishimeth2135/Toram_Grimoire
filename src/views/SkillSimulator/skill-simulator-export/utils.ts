import Grimoire from '@/shared/Grimoire'
import Cyteria from '@/shared/utils/Cyteria'

import { SkillBuild } from '@/lib/Character/SkillBuild/SkillBuild'
import { Skill, SkillTree } from '@/lib/Skill/Skill'
import {
  DrawSkillTreeData,
  GetDrawSetting,
  computeDrawSkillTreeData,
} from '@/lib/Skill/utils/DrawSkillTree'
import { DrawSkillTreeDataTypes } from '@/lib/Skill/utils/enums'

export async function exportSkillBuildImage(skillBuild: SkillBuild) {
  try {
    const drawSetting = GetDrawSetting()

    const bodyComputedStyle = getComputedStyle(document.body)
    const whiteColor = bodyComputedStyle.getPropertyValue('--app-white').trim(),
      pcolorl = bodyComputedStyle.getPropertyValue('--app-light').trim(),
      pcolor3 = bodyComputedStyle.getPropertyValue('--app-primary-50').trim(),
      pcolor4 = bodyComputedStyle.getPropertyValue('--app-primary-60').trim(),
      fontFamily = bodyComputedStyle.getPropertyValue('font-family').trim()

    // icon
    const skillPointCostSvgIconString = `<svg crossOrigin="anonymous" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.343L6.343 12L12 17.657L17.657 12L12 6.343zM2.1 12l9.9 9.9l9.9-9.9L12 2.1L2.1 12z" fill="${pcolor3}"/></g></svg>`
    const otherIconData: Record<
      string,
      { src: string; loadedImage: HTMLImageElement | null }
    > = {
      skillPointCost: {
        src:
          'data:image/svg+xml;base64,' +
          window.btoa(skillPointCostSvgIconString),
        loadedImage: null,
      },
      potum: {
        src: '/imgs/favicon/favicon48.png',
        loadedImage: null,
      },
    }

    type DrawDataExtend = ReturnType<typeof computeDrawSkillTreeData> & {
      skillTree: SkillTree
    }
    const drawDatas: DrawDataExtend[] = []
    const mainCanvases: {
      canvas: HTMLCanvasElement
      width: number
      height: number
      skillTree: SkillTree
    }[] = []
    const starGemDatas: DrawSkillTreeData[] = []

    const getSkillLevel = (skill: Skill) => {
      const { level, starGemLevel } = skillBuild.getSkillState(skill)
      return { level, starGemLevel }
    }

    skillBuild.selectedSkillTrees.forEach(st => {
      const drawData = computeDrawSkillTreeData(st, { getSkillLevel })
      drawDatas.push({
        ...drawData,
        skillTree: st,
      })
    })

    Object.values(otherIconData).forEach(imgData => {
      const img = document.createElement('img')
      img.setAttribute('crossOrigin', 'anonymous')
      imgData.loadedImage = img
    })

    await Promise.all([
      ...Object.values(otherIconData).map(imgData => {
        const img = imgData.loadedImage!
        return new Promise(resolve => {
          img.src = imgData.src
          img.addEventListener('load', function img_load() {
            img.removeEventListener('load', img_load)
            resolve(undefined)
          })
        })
      }),
      ...drawDatas.map(drawData => {
        return Promise.all(
          drawData.data
            .filter(item => item.type === DrawSkillTreeDataTypes.SkillCircle)
            .map(item => {
              const img = document.createElement('img')
              img.setAttribute('crossOrigin', 'anonymous')
              return new Promise(resolve => {
                if (skillBuild.getSkillState(item.skill!).starGemLevel > 0) {
                  starGemDatas.push(item)
                }

                function imgLoaded() {
                  img.removeEventListener('load', imgLoaded)
                  item.loadedImage = img
                  resolve(undefined)
                }

                img.addEventListener('load', imgLoaded)
                img.src = item.path as string
              })
            })
        )
      }),
    ])

    const title_text_middle_y = 27,
      title_preRect_w = 3,
      title_preRect_h = 25,
      title_preRect_pt = 12,
      title_preRect_pl = 16,
      title_preRect_pr = 12,
      left_icon_scope_mr = 16,
      left_icon_scope_icon_w = 16,
      // left_icon_scope_icon_pl = 12,
      left_icon_scope_text_ml = 8,
      st_extra_top_pd = 20,
      st_extra_pb = 20,
      skill_icon_width = drawSetting.gridWidth - drawSetting.iconPadding * 2,
      topInfo_py = 20,
      topInfo_icon_h = 48,
      topInfo_icon_mr = 12,
      topInfo_text_h = 27,
      topInfo_h_sum = topInfo_py * 2 + topInfo_text_h * 2,
      watermark_line_h = 65,
      starGemScope_py = 16,
      starGemScope_px = 16,
      sgc_margin = 10, //sgc: star gem column
      sgc_icon_mr = 10,
      sgc_lineCount = Math.floor((starGemDatas.length + 1) / 2),
      sgc_icon_pd = drawSetting.iconPadding,
      starGemScope_h_sum =
        title_preRect_pt +
        title_preRect_h +
        starGemScope_py +
        sgc_lineCount * (skill_icon_width + sgc_icon_pd * 2) +
        (sgc_lineCount - 1) * sgc_margin +
        starGemScope_py

    const skillIconGrdAddColors = function (grd: CanvasGradient) {
      grd.addColorStop(0, 'white')
      grd.addColorStop(0.5, '#FFD1EA')
      grd.addColorStop(1, '#f7a8d3')
    }

    const final_w = Math.max(500, ...drawDatas.map(item => item.width))
    const final_h = drawDatas.reduce(
      (cur, item) =>
        cur +
        item.height +
        st_extra_top_pd +
        title_preRect_pt +
        title_preRect_h +
        st_extra_pb,
      watermark_line_h +
        topInfo_h_sum +
        (starGemDatas.length !== 0 ? starGemScope_h_sum : 0)
    )
    const sgc_w = final_w / 2 - sgc_margin - 2 * starGemScope_px

    const drawSkillIconDxBase =
      final_w -
      (left_icon_scope_mr + left_icon_scope_text_ml + left_icon_scope_icon_w)
    const drawSkillIconDyBase = (-1 * left_icon_scope_icon_w) / 2

    drawDatas.forEach(drawData => {
      const canvas = document.createElement('canvas')
      const st_w = drawData.width,
        st_h = drawData.height
      canvas.width = final_w
      canvas.height = st_h
      const ctx = canvas.getContext('2d')!
      ctx.lineWidth = 2

      drawData.data.forEach(item => {
        ctx.beginPath()
        if (item.type === DrawSkillTreeDataTypes.SkillCircle) {
          const grd = ctx.createLinearGradient(
            item.cx,
            item.cy - item.r,
            item.cx,
            item.cy + item.r
          )
          skillIconGrdAddColors(grd)
          ctx.fillStyle = grd
          ctx.strokeStyle = '#ff5fb7'
          ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          const ir = skill_icon_width / 2
          ctx.drawImage(
            item.loadedImage,
            item.cx - ir,
            item.cy - ir,
            2 * ir,
            2 * ir
          )
        } else if (item.type === DrawSkillTreeDataTypes.TreeLine) {
          ctx.moveTo(item.x1, item.y1)
          ctx.lineTo(item.x2, item.y2)
          ctx.strokeStyle = pcolorl
          ctx.stroke()
        } else if (item.type === DrawSkillTreeDataTypes.TreeDot) {
          ctx.strokeStyle = pcolorl
          ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2)
          ctx.stroke()
        } else if (
          item.type === DrawSkillTreeDataTypes.SkillLevelText ||
          item.type === DrawSkillTreeDataTypes.StarGemLevelText
        ) {
          ctx.font = `${Cyteria.element.convertRemToPixels(1)}px 'Itim'`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = bodyComputedStyle.getPropertyValue(
            item.type === DrawSkillTreeDataTypes.SkillLevelText
              ? '--app-primary-60'
              : '--app-blue-60'
          )
          ctx.fillText(item.innerText, item.x, item.y)
        }
      })

      mainCanvases.push({
        canvas: canvas,
        width: st_w,
        height: st_h,
        skillTree: drawData.skillTree,
      })
    })

    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = final_w
    finalCanvas.height = final_h

    const fctx = finalCanvas.getContext('2d')!

    // background
    fctx.fillStyle = whiteColor
    fctx.fillRect(0, 0, final_w, final_h)

    // init
    let cur_y = 0
    fctx.font = `${Cyteria.element.convertRemToPixels(1)}px ${fontFamily}`
    fctx.textBaseline = 'middle'
    fctx.fillStyle = pcolor4
    fctx.lineWidth = 2

    fctx.textAlign = 'left'

    // top info
    {
      const { level, starGemLevel } = skillBuild.skillPointSum
      const spcs = Grimoire.i18n.t(
          'skill-simulator.export-image.skill-point-sum-caption',
          { sum: level }
        ),
        sgsps = Grimoire.i18n.t(
          'skill-simulator.export-image.star-gem-point-sum-caption',
          { sum: starGemLevel }
        )
      const topInfo_contanier_w =
        Math.max(fctx.measureText(spcs).width, fctx.measureText(sgsps).width) +
        topInfo_icon_h +
        topInfo_icon_mr
      const topInfo_icon_left = (final_w - topInfo_contanier_w) / 2,
        topInfo_icon_top = (topInfo_h_sum - topInfo_icon_h) / 2,
        topInfo_text_left = topInfo_icon_left + topInfo_icon_h + topInfo_icon_mr

      fctx.drawImage(
        otherIconData.potum.loadedImage!,
        topInfo_icon_left,
        topInfo_icon_top
      )

      cur_y += topInfo_py + topInfo_text_h / 2
      fctx.fillText(spcs, topInfo_text_left, cur_y)
      cur_y += topInfo_text_h
      fctx.fillText(sgsps, topInfo_text_left, cur_y)
      cur_y += topInfo_text_h / 2 + topInfo_py
    }

    // star gem list
    if (starGemDatas.length > 0) {
      fctx.fillRect(
        title_preRect_pl,
        cur_y + title_preRect_pt,
        title_preRect_w,
        title_preRect_h
      )
      fctx.fillText(
        Grimoire.i18n.t('skill-simulator.star-gem-list'),
        title_preRect_pl + title_preRect_w + title_preRect_pr,
        cur_y + title_text_middle_y
      )
      cur_y += title_preRect_pt + title_preRect_h + starGemScope_py

      const sgc_left1 = starGemScope_px,
        sgc_left2 = sgc_left1 + sgc_w + sgc_margin,
        icon_width_sum = sgc_icon_pd * 2 + skill_icon_width
      starGemDatas.forEach((item, idx, ary) => {
        const left = idx % 2 === 0 ? sgc_left1 : sgc_left2
        const icon_mid = left + icon_width_sum / 2,
          icon_r = icon_width_sum / 2
        const grd = fctx.createLinearGradient(
          icon_mid,
          cur_y,
          icon_mid,
          cur_y + icon_width_sum
        )
        skillIconGrdAddColors(grd)
        fctx.fillStyle = grd
        const icon_cy = cur_y + icon_r
        fctx.beginPath()
        fctx.strokeStyle = '#ff5fb7'
        fctx.arc(icon_mid, icon_cy, icon_r, 0, Math.PI * 2)
        fctx.fill()
        fctx.stroke()
        fctx.drawImage(
          item.loadedImage,
          left + sgc_icon_pd,
          cur_y + sgc_icon_pd,
          skill_icon_width,
          skill_icon_width
        )
        fctx.fillStyle = pcolor4
        fctx.fillText(
          item.skill!.name +
            ' Lv.' +
            skillBuild.getSkillState(item.skill!).starGemLevel,
          left + icon_width_sum + sgc_icon_mr,
          icon_cy
        )
        if (idx % 2 === 1 && idx !== ary.length - 1) {
          cur_y += skill_icon_width + sgc_margin + sgc_icon_pd * 2
        }
      })
      cur_y += skill_icon_width + starGemScope_py
    }

    // all skill trees
    cur_y += st_extra_top_pd
    fctx.strokeStyle = pcolorl
    mainCanvases.forEach(item => {
      cur_y += 1
      fctx.beginPath()
      fctx.moveTo(0, cur_y)
      fctx.lineTo(final_w, cur_y)
      fctx.stroke()

      cur_y += 1 + st_extra_top_pd

      fctx.font = `${Cyteria.element.convertRemToPixels(1)}px ${fontFamily}`
      fctx.textAlign = 'left'
      fctx.textBaseline = 'middle'
      fctx.fillStyle = pcolor4

      // const yf = title_preRect_pdt - st_extra_top_pd;
      const title_text_y = title_text_middle_y - st_extra_top_pd

      fctx.fillRect(
        title_preRect_pl,
        cur_y + title_preRect_pt - st_extra_top_pd,
        title_preRect_w,
        title_preRect_h
      )
      fctx.fillText(
        item.skillTree.name,
        title_preRect_pl + title_preRect_w + title_preRect_pr,
        cur_y + title_text_y
      )

      const getSkillTreePointSum = (skillTree: SkillTree) => {
        return skillTree.skills.reduce(
          (cur, skill) => cur + skillBuild.getSkillState(skill).level,
          0
        )
      }

      const spc = getSkillTreePointSum(item.skillTree).toString()
      const spc_w = fctx.measureText(spc).width

      fctx.textAlign = 'right'
      fctx.fillText(spc, final_w - title_preRect_pl, cur_y + title_text_y + 1)
      fctx.drawImage(
        otherIconData.skillPointCost.loadedImage!,
        drawSkillIconDxBase - spc_w,
        cur_y + drawSkillIconDyBase + title_text_y
      )

      cur_y += title_preRect_h
      // adjust margin between title and skill tree
      // cur_y -= 5

      fctx.drawImage(item.canvas, 0, cur_y)
      cur_y += item.height + st_extra_pb
    })

    // watermark
    cur_y += 1
    fctx.beginPath()
    fctx.moveTo(0, cur_y)
    fctx.lineTo(final_w, cur_y)
    fctx.stroke()
    fctx.textAlign = 'right'
    fctx.fillText(
      Grimoire.i18n.t('skill-simulator.export-image.watermark'),
      final_w - 10,
      cur_y + 20
    )

    // finale
    return finalCanvas.toDataURL('image/png', 1)
  } catch (err) {
    console.warn('[exportSkillBuildImage] unknow error')
    console.error(err)
    return null
  }
}

export function exportSkillBuildText(skillBuild: SkillBuild) {
  let res = ''
  const starGems: {
    skill: Skill
    starGemLevel: number
  }[] = []

  skillBuild.selectedSkillTrees.forEach(st => {
    res += st.name + '<br />'
    st.skills.forEach(skill => {
      const { level, starGemLevel } = skillBuild.getSkillState(skill)
      if (level > 0) {
        res += '｜' + skill.name + ' Lv.' + level + '<br />'
      }
      if (starGemLevel > 0) {
        starGems.push({ skill, starGemLevel })
      }
    })
    res += '<br />'
  })
  if (starGems.length !== 0) {
    res =
      Grimoire.i18n.t('skill-simulator.star-gem-list') +
      '<br />' +
      starGems.reduce(
        (cur, item) =>
          cur + '｜' + item.skill.name + ' Lv.' + item.starGemLevel + '<br />',
        ''
      ) +
      '<br />' +
      res
  }

  const { level, starGemLevel } = skillBuild.skillPointSum
  let top =
    '｜' +
    Grimoire.i18n.t('skill-simulator.export-image.skill-point-sum-caption', {
      sum: level,
    }) +
    '<br />'
  top +=
    '｜' +
    Grimoire.i18n.t('skill-simulator.export-image.star-gem-point-sum-caption', {
      sum: starGemLevel,
    }) +
    '<br />'
  top += '<br />'

  res = top + res

  res += Grimoire.i18n.t('skill-simulator.export-image.watermark')

  return res
}
