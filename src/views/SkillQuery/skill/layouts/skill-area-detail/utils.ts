function createSectorPathD({
  cx,
  cy,
  minRadius = 0,
  radius,
  startAngle,
  endAngle,
  clockwise = 0,
}: {
  cx: number;
  cy: number;
  minRadius?: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  clockwise?: number;
}){
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
    ---------------------------------------------------------
     path: arc1.start -> arc1.end -> arc2.start -> arc2.end
    ---------------------------------------------------------
    */

  const deg = Math.PI / 180
  const cosEnd = Math.cos(endAngle * deg),
    cosStart = Math.cos(startAngle * deg),
    sinEnd = -1 * Math.sin(endAngle * deg),
    sinStart = -1 * Math.sin(startAngle * deg)

  // a: arc, s: start, e: end
  const
    a1_sx = minRadius * cosEnd + cx,
    a1_sy = minRadius * sinEnd + cy,
    a1_ex = minRadius * cosStart + cx,
    a1_ey = minRadius * sinStart + cy,
    a2_sx = radius * cosStart + cx,
    a2_sy = radius * sinStart + cy,
    a2_ex = radius * cosEnd + cx,
    a2_ey = radius * sinEnd + cy

  return `M${a1_sx} ${a1_sy}A${minRadius} ${minRadius},0 0 ${clockwise == 1 ? 0 : 1},${a1_ex} ${a1_ey}L${a2_sx} ${a2_sy}A${radius} ${radius},0 0 ${clockwise},${a2_ex} ${a2_ey}Z`
}

export { createSectorPathD }
