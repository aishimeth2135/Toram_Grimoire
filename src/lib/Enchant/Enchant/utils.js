export function calcPotentialExtraRate(statsNumList) {
  const res = statsNumList
    .reduce((cur, v) => cur + (v > 1 ? v * v : 0), 20);
  return res / 20;
}