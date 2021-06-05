function getGcd(a, b) {
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