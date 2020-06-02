
<script>
  export default {
    props: ['attrs'],
    inject: ['calcValueStr'],
    data(){
      return {
        width: 300,
        height: 300
      };
    },
    render(h) {
      const childs = this.areaDatas.map(data => {
        const anis = (data.animations || []).map(ani => h(ani.type, {
          attrs: ani.attrs
        }));

        return h(data.type, {
          attrs: data.attrs
        }, anis);
      });

      return h('svg', {
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg',
          version: '1.1', baseProfile: 'full',
          width: this.width, height: this.height,
          viewBox: `0 0 ${this.width} ${this.height}`,
          preserveAspectRatio: 'xMidYMid meet'
        }
      }, childs)
    },
    computed: {
      valid() {
        return this.attrs['radius'] !== void 0;
      },
      areaDatas() {
        const $sd = this.attrs; // 別名

        const type = $sd['effective_area'];
        const grid = v => parseFloat((v*15).toFixed(1)); // [1 m] to [x px]
        const radius = parseFloat(this.calcValueStr($sd['radius'])),
          startPositionOffsets = parseFloat(this.calcValueStr($sd['start_position_offsets'])),
          endPositionOffsets = parseFloat(this.calcValueStr($sd['end_position_offsets'])),
          originalMoveDistance = parseFloat(this.calcValueStr($sd['move_distance']));

        const datas = [];

        const body_style = getComputedStyle(document.body);
        const pcolorl = body_style.getPropertyValue('--primary-light').trim(),
            pcolorl2 = body_style.getPropertyValue('--primary-light-2').trim(),
            pcolorl3 = body_style.getPropertyValue('--primary-light-3').trim(),
            pcolorWaterBlue = body_style.getPropertyValue('--primary-water-blue').trim(),
            pcolorRed = body_style.getPropertyValue('--primary-red').trim();

        const padding = 1,
          bdColor = pcolorl3,
          bgColor = pcolorl2,
          charaColor = pcolorWaterBlue,
          targetColor = pcolorRed,
          unitRadius = 0.3,
          moveDistanceFix = 3;

        const skill_range = parseFloat(this.calcValueStr(
          (this.attrs['@parent-branch']['@parent-state'].attrs['range'] || '100')
            .replace(/\.(\d{2,})/, (m, m1) => m1.slice(0, 2))
          ));
        const targetOffset = $sd['end_position'] == 'self' ? 0 : Math.min(7, skill_range);
        const moveDistance = Math.min(Math.max(targetOffset + moveDistanceFix, originalMoveDistance), 9);

        if (type == 'circle') {
          // character
          let bx = $sd['end_position'] == 'self' ? padding + radius : padding;
          const by = padding + radius;

          bx += Math.max(0, -1 * startPositionOffsets);

          // target
          let tx = $sd['end_position'] == 'self' ? bx + radius*0.5 : bx + targetOffset;
          const ty = by;

          if (radius > tx) {
            bx = bx + radius - tx;
            tx = radius + padding;
          }

          const chara = {
            type: 'circle',
            attrs: {
              cx: grid(bx), cy: grid(by),
              r: grid(unitRadius), fill: charaColor
            }
          };
          const tar = {
            type: 'circle',
            attrs: {
              cx: grid(tx), cy: grid(ty),
              r: grid(unitRadius), fill: targetColor
            }
          };

          // area center
          const ax = $sd['end_position'] == 'self' ? bx : tx + endPositionOffsets;
          const ay = $sd['end_position'] == 'self' ? by : ty;

          const area = {
            type: 'circle',
            attrs: {
              cx: grid(ax), cy: grid(ay),
              r: grid(radius), fill: pcolorl
            },
            animations: []
          };

          area.animations.push({
            type: 'animate',
            attrs: {
              attributeName: 'fill',
              values: `${pcolorl};${pcolorl3};${pcolorl};${pcolorl}`,
              keyTimes: '0;.1;.6;1',
              dur: '2.5s', repeatCount: 'indefinite'
            }
          });

          datas.push(area);
          datas.push(chara);
          datas.push(tar);

          this.height = grid(by + radius + padding);
          this.width = grid(tx + padding + radius + Math.max(0, endPositionOffsets));
        } else if (type == 'line') {
          // character
          let bx = padding + radius;
          const by = padding + radius;

          bx += Math.max(0, -1 * startPositionOffsets);

          // target
          const tx = bx + targetOffset,
            ty = by;

          const chara = {
            type: 'circle',
            attrs: {
              cx: grid(bx), cy: grid(by),
              r: grid(unitRadius), fill: charaColor
            }
          };
          const tar = {
            type: 'circle',
            attrs: {
              cx: grid(tx), cy: grid(ty),
              r: grid(unitRadius), fill: targetColor
            }
          };

          // area center
          const ax = bx + startPositionOffsets;
          const ay = by;

          const area = {
            type: 'circle',
            attrs: {
              cx: grid(ax), cy: grid(ay),
              r: grid(radius), fill: pcolorl
            },
            animations: []
          };

          const endx = $sd['move_distance'] ? bx + moveDistance : tx + endPositionOffsets;
          const endy = ty;

          area.animations.push({
            type: 'animate',
            attrs: {
              attributeName: 'fill',
              values: `${pcolorl};${pcolorl3};${pcolorl3};${pcolorl}`,
              keyTimes: '0;.3;.4;1',
              dur: '2s', repeatCount: 'indefinite'
            }
          }, {
            type: 'animate',
            attrs: {
              attributeName: 'cx',
              values: `${grid(ax)};${grid(ax)};${grid(endx)};${grid(endx)}`,
              keyTimes: '0;.3;.4;1',
              dur: '2s', repeatCount: 'indefinite'
            }
          });

          const area_bg = {
            type: 'path',
            attrs: {
              d: `M${grid(ax)} ${grid(ay+radius)}A${grid(radius)} ${grid(radius)},0 0 1,${grid(ax)} ${grid(ay-radius)}L${grid(endx)} ${grid(endy-radius)}A${grid(radius)} ${grid(radius)},0 0 1,${grid(endx)} ${grid(endy+radius)}Z`,
              fill: pcolorl
            }
          };

          datas.push(area_bg);
          datas.push(area);
          datas.push(chara);
          datas.push(tar);

          this.height = grid(endy + radius + padding);
          this.width = grid(endx + radius + padding);
        } else if (type == 'sector') {
          const deg = Math.PI/180;
          const angle = parseFloat(this.calcValueStr($sd['angle']));
          const sectorWidth = 2,
            minRadius = Math.max(startPositionOffsets, 1),
            maxRadius = moveDistance;
          // character
          let bx = padding;
          const by = padding + maxRadius * Math.sin(angle*deg/2);

          // target
          const tx = bx + targetOffset,
            ty = by;

          const chara = {
            type: 'circle',
            attrs: {
              cx: grid(bx), cy: grid(by),
              r: grid(unitRadius), fill: charaColor
            }
          };
          const tar = {
            type: 'circle',
            attrs: {
              cx: grid(tx), cy: grid(ty),
              r: grid(unitRadius), fill: targetColor
            }
          };

          const areaSectorD = this.createSectorPathD({
            cx: grid(bx), cy: grid(by), minRadius: grid(minRadius),
            radius: grid(maxRadius),
            startAngle: angle/2, endAngle: -angle/2, clockwise: 1
          });

          const startSectorD = this.createSectorPathD({
            cx: grid(bx), cy: grid(by), minRadius: grid(minRadius),
            radius: grid(minRadius + sectorWidth),
            startAngle: angle/2, endAngle: -angle/2, clockwise: 1
          });

          const endSectorD = this.createSectorPathD({
            cx: grid(bx), cy: grid(by), minRadius: grid(Math.max(maxRadius - sectorWidth, 0)),
            radius: grid(maxRadius),
            startAngle: angle/2, endAngle: -angle/2, clockwise: 1
          });

          datas.push({
            type: 'path',
            attrs: {
              d: areaSectorD,
              fill: pcolorl
            }
          });

          datas.push({
            type: 'path',
            attrs: {
              d: startSectorD,
              fill: pcolorl3
            },
            animations: [{
              type: 'animate',
              attrs: {
                attributeName: 'd',
                values: `${startSectorD};${startSectorD};${endSectorD};${endSectorD}`,
                keyTimes: '0;.3;.4;1',
                dur: '2s', repeatCount: 'indefinite'
              }
            }, {
              type: 'animate',
              attrs: {
                attributeName: 'fill',
                values: `${pcolorl};${pcolorl3};${pcolorl3};${pcolorl}`,
                keyTimes: '0;.3;.4;1',
                dur: '2s', repeatCount: 'indefinite'
              }
            }]
          });

          datas.push(chara);
          datas.push(tar);

          this.height = grid(by + padding + maxRadius * Math.sin(angle*deg/2));
          this.width = grid(bx + moveDistance + padding);
        }

        console.log('render skill area...');
        console.log(this.attrs);
        console.log(datas);
        console.log(skill_range);

        return datas;
      }
    },
    methods: {
      createSectorPathD({cx, cy, minRadius=0, radius, startAngle , endAngle, clockwise=0}={}){
        /**
         -- Draw Sector --
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                                                       *
         *                            start angle                *
         *                               .                       *
         *                             .                         *
         *                  arc2     .                           *
         *                     start                             *
         *                       *                               *
         *           arc1      *   *                             *
         *              end  *      *                            *
         *                 *         *                           *
         *               .  *         *                          *
         *   (cx, cy)  o  .  *  *  *  *  .  .  .  . end angle    *
         *                 start     end                         *
         *             |-----|           -- min radius --        *
         *             |--------------|  -- max radius --        *
         *                                                       *
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
          -------------------------------------------------------
             arc1.start -> arc1.end -> arc2.start -> arc2.end
          -------------------------------------------------------
         */

        const deg = Math.PI/180;
        const cosEnd = Math.cos(endAngle * deg),
          cosStart = Math.cos(startAngle * deg),
          sinEnd = -1 * Math.sin(endAngle * deg),
          sinStart = -1 * Math.sin(startAngle * deg);

        // a: arc, s: start, e: end
        const
          a1_sx = minRadius * cosEnd + cx,
          a1_sy = minRadius * sinEnd + cy,
          a1_ex = minRadius * cosStart + cx,
          a1_ey = minRadius * sinStart + cy,
          a2_sx = radius * cosStart + cx,
          a2_sy = radius * sinStart + cy,
          a2_ex = radius * cosEnd + cx,
          a2_ey = radius * sinEnd + cy;

        return `M${a1_sx} ${a1_sy}A${minRadius} ${minRadius},0 0 ${clockwise == 1 ? 0 : 1},${a1_ex} ${a1_ey}L${a2_sx} ${a2_sy}A${radius} ${radius},0 0 ${clockwise},${a2_ex} ${a2_ey}Z`;
      }
    }
  };
</script>
<style lang="less" scoped>
svg {
  max-height: 20rem;
  max-width: 25rem;
}
</style>