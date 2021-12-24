<template>
  <Render />
</template>

<script lang="ts" setup>
import { h, toRefs, computed } from 'vue';

import { isNumberString } from '@/shared/utils/string';
import { numberToFixed } from '@/shared/utils/number';

import { createSectorPathD } from './utils';
import DisplayDataContainer from '../../branch-handlers/utils/DisplayDataContainer';

interface Props {
  container: DisplayDataContainer;
}

const props = defineProps<Props>();
const { container } = toRefs(props);

const valid = computed(() => container.value.has('radius'));

type AreaElement = {
  type: string;
  attrs: Record<string, string | number>;
  animations?: AreaElement[];
};

const areaDatas = computed(() => {
  let width = 0;
  let height = 0;

  const ctner = container.value;

  const type = ctner.getOrigin('effective_area');

  /* "1 m" to "x px" */
  const grid = (value: number): number => numberToFixed(value * 15, 1);

  const getAttrNumValue = (key: string) => ctner.has(key) ? parseFloat(ctner.getValue(key)) : 0;

  const radius = getAttrNumValue('radius'),
    startPositionOffsets = getAttrNumValue('start_position_offsets'),
    endPositionOffsets = getAttrNumValue('end_position_offsets'),
    moveDistanceOrigin = getAttrNumValue('move_distance');

  const datas: AreaElement[] = [];

  const body_style = getComputedStyle(document.body);
  const pcolorl = body_style.getPropertyValue('--primary-light').trim(),
    pcolorl3 = body_style.getPropertyValue('--primary-light-3').trim(),
    pcolorWaterBlue = body_style.getPropertyValue('--primary-water-blue').trim(),
    pcolorRed = body_style.getPropertyValue('--primary-red').trim();

  const padding = 1,
    charaColor = pcolorWaterBlue,
    targetColor = pcolorRed,
    unitRadius = 0.3,
    moveDistanceFix = 3;

  const skillRangeDefault = '100';
  let skillRangeOrigin: string | null = ctner.getValue('range') || null;
  skillRangeOrigin = skillRangeOrigin ? parseFloat(skillRangeOrigin).toFixed(2) : skillRangeDefault;
  const skillRange: number = parseFloat(isNumberString(skillRangeOrigin) ? skillRangeOrigin : skillRangeDefault);

  let targetOffset = 0;
  if (ctner.getOrigin('target_offsets') === 'auto') {
    targetOffset = type === 'circle' && ctner.getOrigin('end_position') === 'self' ? radius * 0.5 : Math.min(7, skillRange);
  } else {
    targetOffset = parseFloat(ctner.getValue('target_offsets'));
  }
  const moveDistance = Math.min(Math.max(targetOffset + moveDistanceFix, moveDistanceOrigin), 9);

  if (type === 'circle') {
    // character
    let bx = ctner.getOrigin('end_position') === 'self' ? padding + radius : padding;
    const by = padding + radius;

    // bx += Math.max(0, -1 * startPositionOffsets);

    // target
    let tx = bx + targetOffset;
    const ty = by;

    if (radius > tx) {
      bx = bx + radius - tx;
      tx = radius + padding;
    }

    const chara = {
      type: 'circle',
      attrs: {
        cx: grid(bx), cy: grid(by),
        r: grid(unitRadius), fill: charaColor,
      },
    };
    const tar = {
      type: 'circle',
      attrs: {
        cx: grid(tx), cy: grid(ty),
        r: grid(unitRadius), fill: targetColor,
      },
    };

    // area center
    const ax = ctner.getOrigin('end_position') === 'self' ? bx : tx + endPositionOffsets;
    const ay = ctner.getOrigin('end_position') === 'self' ? by : ty;

    const area: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(ax), cy: grid(ay),
        r: grid(radius), fill: pcolorl,
      },
      animations: [],
    };

    area.animations!.push({
      type: 'animate',
      attrs: {
        attributeName: 'fill',
        values: `${pcolorl};${pcolorl3};${pcolorl};${pcolorl}`,
        keyTimes: '0;.1;.6;1',
        dur: '2.5s', repeatCount: 'indefinite',
      },
    });

    datas.push(area);
    datas.push(chara);
    datas.push(tar);

    height = grid(by + radius + padding);
    width = grid(tx + padding + radius + Math.max(0, endPositionOffsets));
  } else if (type === 'line') {
    // character
    let bx = padding + radius;
    const by = padding + radius;

    bx += Math.max(0, -1 * startPositionOffsets);

    // target
    const tx = bx + targetOffset,
      ty = by;

    const chara: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(bx), cy: grid(by),
        r: grid(unitRadius), fill: charaColor,
      },
      animations: [],
    };
    const tar: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(tx), cy: grid(ty),
        r: grid(unitRadius), fill: targetColor,
      },
    };

    // area center
    const ax = bx + startPositionOffsets;
    const ay = by;

    const area: AreaElement = {
      type: 'circle',
      attrs: {
        cx: grid(ax), cy: grid(ay),
        r: grid(radius), fill: pcolorl,
      },
      animations: [],
    };

    const endx = ctner.has('move_distance') ? bx + moveDistance : tx + endPositionOffsets;
    const endy = ty;

    area.animations!.push({
      type: 'animate',
      attrs: {
        attributeName: 'fill',
        values: `${pcolorl};${pcolorl3};${pcolorl3};${pcolorl}`,
        keyTimes: '0;.3;.6;1',
        dur: '2s', repeatCount: 'indefinite',
      },
    }, {
      type: 'animate',
      attrs: {
        attributeName: 'cx',
        values: `${grid(ax)};${grid(ax)};${grid(endx)};${grid(endx)}`,
        keyTimes: '0;.3;.4;1',
        dur: '2s', repeatCount: 'indefinite',
      },
    });

    if (ctner.getOrigin('end_position') === 'self') {
      chara.animations!.push({
        type: 'animate',
        attrs: {
          attributeName: 'cx',
          values: `${grid(bx)};${grid(bx)};${grid(endx)};${grid(endx)}`,
          keyTimes: '0;.3;.4;1',
          dur: '2s', repeatCount: 'indefinite',
        },
      });
    }

    const areaBg: AreaElement = {
      type: 'path',
      attrs: {
        d: `M${grid(ax)} ${grid(ay + radius)}A${grid(radius)} ${grid(radius)},0 0 1,${grid(ax)} ${grid(ay - radius)}L${grid(endx)} ${grid(endy - radius)}A${grid(radius)} ${grid(radius)},0 0 1,${grid(endx)} ${grid(endy + radius)}Z`,
        fill: pcolorl,
      },
    };

    datas.push(areaBg);
    datas.push(area);
    datas.push(chara);
    datas.push(tar);

    height = grid(endy + radius + padding);
    width = grid(endx + radius + padding);
  } else if (type === 'sector') {
    const deg = Math.PI / 180;
    const angle = getAttrNumValue('angle');
    const sectorWidth = 2,
      minRadius = Math.max(startPositionOffsets, 1),
      maxRadius = moveDistance;
    // character
    let bx = padding;
    const by = padding + maxRadius * Math.sin(angle * deg / 2);

    // target
    const tx = bx + targetOffset,
      ty = by;

    const chara = {
      type: 'circle',
      attrs: {
        cx: grid(bx), cy: grid(by),
        r: grid(unitRadius), fill: charaColor,
      },
    };
    const tar = {
      type: 'circle',
      attrs: {
        cx: grid(tx), cy: grid(ty),
        r: grid(unitRadius), fill: targetColor,
      },
    };

    const areaSectorD = createSectorPathD({
      cx: grid(bx), cy: grid(by), minRadius: grid(minRadius),
      radius: grid(maxRadius),
      startAngle: angle / 2, endAngle: -angle / 2, clockwise: 1,
    });

    const startSectorD = createSectorPathD({
      cx: grid(bx), cy: grid(by), minRadius: grid(minRadius),
      radius: grid(minRadius + sectorWidth),
      startAngle: angle / 2, endAngle: -angle / 2, clockwise: 1,
    });

    const endSectorD = createSectorPathD({
      cx: grid(bx), cy: grid(by), minRadius: grid(Math.max(maxRadius - sectorWidth, 0)),
      radius: grid(maxRadius),
      startAngle: angle / 2, endAngle: -angle / 2, clockwise: 1,
    });

    datas.push({
      type: 'path',
      attrs: {
        d: areaSectorD,
        fill: pcolorl,
      },
    });

    datas.push({
      type: 'path',
      attrs: {
        d: startSectorD,
        fill: pcolorl3,
      },
      animations: [{
        type: 'animate',
        attrs: {
          attributeName: 'd',
          values: `${startSectorD};${startSectorD};${endSectorD};${endSectorD}`,
          keyTimes: '0;.3;.4;1',
          dur: '2s', repeatCount: 'indefinite',
        },
      }, {
        type: 'animate',
        attrs: {
          attributeName: 'fill',
          values: `${pcolorl};${pcolorl3};${pcolorl3};${pcolorl}`,
          keyTimes: '0;.3;.6;1',
          dur: '2s', repeatCount: 'indefinite',
        },
      }],
    });

    datas.push(chara);
    datas.push(tar);

    height = grid(by + padding + maxRadius * Math.sin(angle * deg / 2));
    width = grid(bx + moveDistance + padding);
  }

  return {
    datas,
    height,
    width,
  };
});

const Render = () => {
  if (!valid.value) {
    return h('div');
  }
  const datas = areaDatas.value;
  const childs = datas.datas.map(data => {
    const anis = (data.animations || []).map(ani => h(ani.type, ani.attrs));

    return h(data.type, data.attrs, anis);
  });

  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1', baseProfile: 'full',
    width: datas.width, height: datas.height,
    viewBox: `0 0 ${datas.width} ${datas.height}`,
    preserveAspectRatio: 'xMidYMid meet',
    class: 'main--draw-skill-area',
  }, childs);
};
</script>

<style lang="less" scoped>
.main--draw-skill-area {
  max-height: 20rem;
  max-width: 25rem;
}
</style>
