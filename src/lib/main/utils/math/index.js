function getGcd(a, b) {
  if (typeof a !== 'number') {
    a = 1;
    console.warn('[math: get GCD] param a:', a, 'is not number.');
  }
  if (typeof b !== 'number') {
    b = 1;
    console.warn('[math: get GCD] param b:', b, 'is not number');
  }
  const max = Math.max(a, b);
  const min = Math.min(a, b);
  if (max % min === 0) {
    return min;
  } else {
    return getGcd(max % min, min);
  }
}

function getLcm(a, b) {
  return a * b / getGcd(a, b);
}

export { getGcd, getLcm };
