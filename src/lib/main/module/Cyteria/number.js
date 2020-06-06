function between(v, min, max) {
  if (typeof min != 'number' || typeof max != 'number') {
    console.warn('[arguments: max or min] is not the number.');
    return v;
  }
  if (max < min) {
    const t = max;
    max = min;
    min = t;
  }
  if (v < min)
    v = min;
  if (v > max)
    v = max;
  return v;
}

export default { between };