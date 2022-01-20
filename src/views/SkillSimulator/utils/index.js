function getSkillElementId(sk_el) {
  const indexs = []
  while (sk_el.parent) {
    indexs.push(sk_el.index)
    sk_el = sk_el.parent
  }
  return indexs.reverse().join('-')
}

export { getSkillElementId }
