<template>
  <Render />
</template>

<script lang="ts" setup>
import { computed, h, toRefs } from 'vue'

import { numberToFixed } from '@/shared/utils/number'
import { isNumberString } from '@/shared/utils/string'

import DisplayDataContainer from '../../branch-handlers/handle/DisplayDataContainer'
import { createSectorPathD } from './utils'

interface Props {
  container: DisplayDataContainer
}

const props = defineProps<Props>()
const { container } = toRefs(props)

const valid = computed(
  () =>
    container.value.has('radius') ||
    container.value.getOrigin('effective_area') === 'sector'
)

type AreaElement = {
  type: string
  attrs: Record<string, string | number>
  animations?: AreaElement[]
}

const areaDatas = computed(() => {
  let width = 0
  let height = 0

  const ctner = container.value

  const type = ctner.getOrigin('effective_area')

  /* "1 m" to "x px" */
  const grid = (value: number): number => numberToFixed(value * 15, 1)

  const getAttrNumValue = (key: string) => {
    if (ctner.has(key)) {
      const value = ctner.getValue(key)
      if (isNumberString(value)) {
        return parseFloat(value)
      }
    }
    return 0
  }

  const radius = getAttrNumValue('radius'),
    startPositionOffsets = getAttrNumValue('start_position_offsets'),
    endPositionOffsets = getAttrNumValue('end_position_offsets'),
    moveDistanceOrigin = getAttrNumValue('move_distance')

  const datas: AreaElement[] = []

  const body_style = getComputedStyle(document.body)
  const pcolorl = body_style.getPropertyValue('--app-primary-20').trim(),
    pcolorl3 = body_style.getPropertyValue('--app-primary-50').trim(),
    pcolorWaterBlue = body_style.getPropertyValue('--app-blue-60').trim(),
    pcolorRed = body_style.getPropertyValue('--app-orange-60').trim()

  const padding = 1,
    charaColor = pcolorWaterBlue,
    targetColor = pcolorRed,
    unitRadius = 0.3,
    moveDistanceFix = 3

  const skillRangeDefault = '100'
  let skillRangeOrigin: string | null = ctner.getValue('range') || null
  skillRangeOrigin = skillRangeOrigin
    ? parseFloat(skillRangeOrigin).toFixed(2)
    : skillRangeDefault
  const skillRange: number = parseFloat(
    isNumberString(skillRangeOrigin) ? skillRangeOrigin : skillRangeDefault
  )

  let targetOffset = 0
  if (ctner.getOrigin('target_offsets') === 'auto') {
    targetOffset =
      type === 'circle' && ctner.getOrigin('end_position') === 'self'
        ? radius * 0.5
        : Math.min(7, skillRange)
  } else if (ctner.has('target_offsets')) {
    const value = ctner.getValue('target_offsets')
    targetOffset = isNumberString(value) ? parseFloat(value) : 0
  }
  const moveDistance = Math.min(
    Math.max(targetOffset + moveDistanceFix, moveDistanceOrigin),
    9
  )

  if (type === 'circle') {
    // character
    let bx =
      ctner.getOrigin('end_position') === 'self' ? padding + radius : padding
    const by = padding + radius

    // target
    let tx = bx + targetOffset
    const ty = by

    if (radius > tx) {
      bx = bx + radius - tx
      tx = radius + padding
    }

    const chara = {
      type: 'circle',
      attrs: {
        cx: grid(bx),
        cy: grid(by),
        r: grid(unitRadius),
        fill: charaColor,
      },
    }
    const tar = {
      type: 'circle',
      attrs: {
        cx: grid(tx),
        cy: grid(ty),
        r: grid(unitRadius),
        fill: targetColor,
      },
    }

    // area center
    const ax =
      ctner.getOrigin('end_position') === 'self' ? bx : tx + endPositionOffsets
    const ay = ctner.getOrigin('end_position') === 'self' ? by : ty

    const area: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(ax),
        cy: grid(ay),
        r: grid(radius),
        fill: pcolorl,
      },
      animations: [],
    }

    area.animations!.push({
      type: 'animate',
      attrs: {
        attributeName: 'fill',
        values: `${pcolorl};${pcolorl3};${pcolorl};${pcolorl}`,
        keyTimes: '0;.1;.6;1',
        dur: '2.5s',
        repeatCount: 'indefinite',
      },
    })

    datas.push(area)
    datas.push(chara)
    datas.push(tar)

    height = grid(by + radius + padding)
    const widthBx = ax === bx && radius > tx - bx ? bx : tx
    width = grid(widthBx + padding + radius + Math.max(0, endPositionOffsets))
  } else if (type === 'line') {
    // character
    let bx = padding + radius
    const by = padding + radius

    bx += Math.max(0, -1 * startPositionOffsets)

    // target
    const tx = bx + targetOffset,
      ty = by

    const chara: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(bx),
        cy: grid(by),
        r: grid(unitRadius),
        fill: charaColor,
      },
      animations: [],
    }
    const tar: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(tx),
        cy: grid(ty),
        r: grid(unitRadius),
        fill: targetColor,
      },
    }

    // area center
    const ax = bx + startPositionOffsets
    const ay = by

    const area: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(ax),
        cy: grid(ay),
        r: grid(radius),
        fill: pcolorl,
      },
      animations: [],
    }

    const endx = ctner.has('move_distance')
      ? bx + moveDistance
      : tx + endPositionOffsets
    const endy = ty

    area.animations!.push(
      {
        type: 'animate',
        attrs: {
          attributeName: 'fill',
          values: `${pcolorl};${pcolorl3};${pcolorl3};${pcolorl}`,
          keyTimes: '0;.3;.6;1',
          dur: '2s',
          repeatCount: 'indefinite',
        },
      },
      {
        type: 'animate',
        attrs: {
          attributeName: 'cx',
          values: `${grid(ax)};${grid(ax)};${grid(endx)};${grid(endx)}`,
          keyTimes: '0;.3;.4;1',
          dur: '2s',
          repeatCount: 'indefinite',
        },
      }
    )

    if (ctner.getOrigin('end_position') === 'self') {
      chara.animations!.push({
        type: 'animate',
        attrs: {
          attributeName: 'cx',
          values: `${grid(bx)};${grid(bx)};${grid(endx)};${grid(endx)}`,
          keyTimes: '0;.3;.4;1',
          dur: '2s',
          repeatCount: 'indefinite',
        },
      })
    }

    const areaBg: AreaElement = {
      type: 'path',
      attrs: {
        d: `M${grid(ax)} ${grid(ay + radius)}A${grid(radius)} ${grid(
          radius
        )},0 0 1,${grid(ax)} ${grid(ay - radius)}L${grid(endx)} ${grid(
          endy - radius
        )}A${grid(radius)} ${grid(radius)},0 0 1,${grid(endx)} ${grid(
          endy + radius
        )}Z`,
        fill: pcolorl,
      },
    }

    datas.push(areaBg)
    datas.push(area)
    datas.push(chara)
    datas.push(tar)

    height = grid(endy + radius + padding)
    width = grid(endx + radius + padding)
  } else if (type === 'sector') {
    const deg = Math.PI / 180
    const angle = getAttrNumValue('angle')
    const sectorWidth = 2,
      minRadius = Math.max(startPositionOffsets, 1),
      maxRadius = moveDistance

    // character
    const bx = padding
    const by = padding + maxRadius * Math.sin((angle * deg) / 2)

    // target
    const tx = bx + targetOffset,
      ty = by

    const chara = {
      type: 'circle',
      attrs: {
        cx: grid(bx),
        cy: grid(by),
        r: grid(unitRadius),
        fill: charaColor,
      },
    }
    const tar = {
      type: 'circle',
      attrs: {
        cx: grid(tx),
        cy: grid(ty),
        r: grid(unitRadius),
        fill: targetColor,
      },
    }

    const areaSectorD = createSectorPathD({
      cx: grid(bx),
      cy: grid(by),
      minRadius: grid(minRadius),
      radius: grid(maxRadius),
      startAngle: angle / 2,
      endAngle: -angle / 2,
      clockwise: 1,
    })

    const startSectorD = createSectorPathD({
      cx: grid(bx),
      cy: grid(by),
      minRadius: grid(minRadius),
      radius: grid(minRadius + sectorWidth),
      startAngle: angle / 2,
      endAngle: -angle / 2,
      clockwise: 1,
    })

    const endSectorD = createSectorPathD({
      cx: grid(bx),
      cy: grid(by),
      minRadius: grid(Math.max(maxRadius - sectorWidth, 0)),
      radius: grid(maxRadius),
      startAngle: angle / 2,
      endAngle: -angle / 2,
      clockwise: 1,
    })

    datas.push({
      type: 'path',
      attrs: {
        d: areaSectorD,
        fill: pcolorl,
      },
    })

    datas.push({
      type: 'path',
      attrs: {
        d: startSectorD,
        fill: pcolorl3,
      },
      animations: [
        {
          type: 'animate',
          attrs: {
            attributeName: 'd',
            values: `${startSectorD};${startSectorD};${endSectorD};${endSectorD}`,
            keyTimes: '0;.3;.4;1',
            dur: '2s',
            repeatCount: 'indefinite',
          },
        },
        {
          type: 'animate',
          attrs: {
            attributeName: 'fill',
            values: `${pcolorl};${pcolorl3};${pcolorl3};${pcolorl}`,
            keyTimes: '0;.3;.6;1',
            dur: '2s',
            repeatCount: 'indefinite',
          },
        },
      ],
    })

    datas.push(chara)
    datas.push(tar)

    height = grid(by + padding + maxRadius * Math.sin((angle * deg) / 2))
    width = grid(bx + moveDistance + padding)
  }

  return {
    datas,
    height,
    width,
  }
})

const Render = () => {
  if (!valid.value) {
    return h('div')
  }
  const datas = areaDatas.value
  const childs = datas.datas.map(data => {
    const anis = (data.animations || []).map(ani => h(ani.type, ani.attrs))

    return h(data.type, data.attrs, anis)
  })

  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      version: '1.1',
      baseProfile: 'full',
      width: datas.width,
      height: datas.height,
      viewBox: `0 0 ${datas.width} ${datas.height}`,
      preserveAspectRatio: 'xMidYMid meet',
    },
    childs
  )
}
</script>
