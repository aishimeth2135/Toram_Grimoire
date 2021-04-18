export function separateText(target, pattern) {
  const t = target.replace(pattern, (m, m1) => `####<--->${m1}####`);
  return t.split('####').map((p, i) => {
    let text = p, separate = false;
    if (p.slice(0, 5) === '<--->') {
      text = text.slice(5);
      separate = true;
    }
    return {
      iid: i,
      text,
      separate
    };
  });
}