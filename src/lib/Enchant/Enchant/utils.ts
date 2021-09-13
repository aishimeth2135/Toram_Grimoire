export function calcPotentialExtraRate(statsNumList: number[]) {
  const res = statsNumList
    .reduce((cur, value) => cur + (value > 1 ? value * value : 0), 20);
  return res / 20;
}
