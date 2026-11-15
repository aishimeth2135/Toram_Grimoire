type SkillTreeLayout = {
  drawNodes: number
  skills: Map<string, { previous: string; order: number }>
}

function isId(value: string) {
  return /^(?:0|[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value))
}

function countDrawNodes(code: string) {
  let nodes = 0
  let size = 0
  for (const token of code.toUpperCase().split(/\s+/).filter(Boolean)) {
    const repeat = /^[HVEL]([1-9]\d*)$/.exec(token)
    if (!repeat && !/^(?:[HVEL]|[SD](?:R|B|RB|BR)?)$/.test(token)) {
      throw new Error('Invalid skill tree draw code')
    }
    size += repeat ? Number(repeat[1]) : 1
    if (size > 4096) {
      throw new Error('Skill tree draw code exceeds its size limit')
    }
    if (token.startsWith('S')) {
      nodes += 1
    }
  }
  return nodes
}

function indexSkillRows(rows: string[][]) {
  const entities = new Set<string>()
  let category: string | undefined
  let tree: string | undefined
  let skill: string | undefined
  let effectCount = 0
  for (const row of rows.slice(1)) {
    const [id, name, label, target, date, body, branchId, branchName, attribute, value, extra] = row
    if (id === '') {
      continue
    }
    if (!isId(id)) {
      throw new Error('Invalid skill data ID')
    }

    let key: string
    if (name === '0') {
      category = id
      tree = skill = undefined
      key = category
    } else if (category !== undefined && name === '1') {
      tree = `${category}-${id}`
      skill = undefined
      key = tree
    } else if (tree !== undefined && name !== '' && name !== '0' && name !== '1') {
      skill = `${tree}-${id}`
      effectCount = 0
      key = skill
    } else if (skill !== undefined && name === '') {
      // A nameless ID starts an effect on the current skill in LoadSkill.
      key = skill
    } else {
      throw new Error(`Invalid skill data hierarchy: ${tree}/${id} (current: ${skill})`)
    }

    if (name !== '') {
      if (entities.has(key)) {
        throw new Error(`Duplicate skill data ID: ${key}`)
      }
      entities.add(key)
    }
    if (name === '0' || name === '1') {
      continue
    }

    if (label === '歷史紀錄' && (!isId(target) || Number(target) >= effectCount)) {
      // C5 import-exceptions.json records this exact historical row as skipped by LoadSkill.
      if (
        key !== '0-2-4' ||
        id !== '4' ||
        name !== '' ||
        effectCount !== 3 ||
        target !== '3' ||
        date !== '2026/04/30' ||
        body !== '' ||
        branchId !== '7' ||
        branchName !== 'list' ||
        attribute !== 'text' ||
        value !== '此技能的詠唱時間不受詠唱速度影響。' ||
        extra !== ''
      ) {
        throw new Error(`Invalid skill history target: ${key}`)
      }
    } else if (['預設', '非預設', '預設/and', '非預設/and'].includes(label)) {
      effectCount += 1
    }
  }
  return entities
}

export function validateSkillLayout(skillRows: string[][], layoutRows: string[][]) {
  const unmatched = indexSkillRows(skillRows)
  const trees: SkillTreeLayout[] = []
  let category: string | undefined
  let treeId: string | undefined
  let tree: SkillTreeLayout | undefined
  for (const row of layoutRows.slice(1)) {
    if (row.every(cell => cell === '')) {
      continue
    }
    const [marker, id, previous, draw] = row
    if (!isId(id)) {
      throw new Error('Invalid skill layout ID')
    }
    let key: string
    if (marker === '0') {
      category = key = id
      tree = treeId = undefined
    } else if (marker === '1' && category !== undefined) {
      treeId = key = `${category}-${id}`
      tree = { drawNodes: countDrawNodes(draw), skills: new Map() }
      trees.push(tree)
    } else if (marker === '' && tree) {
      key = `${treeId}-${id}`
      if (!isId(draw) || (previous !== '-' && !isId(previous))) {
        throw new Error(`Invalid skill placement: ${key}`)
      }
      tree.skills.set(id, { previous, order: Number(draw) })
    } else {
      throw new Error('Invalid skill layout hierarchy')
    }
    if (!unmatched.delete(key)) {
      throw new Error(`Unexpected or duplicate skill layout ID: ${key}`)
    }
  }

  if (unmatched.size) {
    throw new Error('Skill layout is missing IDs')
  }
  for (const { drawNodes, skills } of trees) {
    const orders = new Set<number>()
    const checked = new Set<string>()
    if (drawNodes !== skills.size) {
      throw new Error('Skill layout draw node count differs from its skill count')
    }
    for (const [id, { order }] of skills) {
      if (order >= drawNodes || orders.has(order)) {
        throw new Error('Skill layout draw orders must be unique and zero-based')
      }
      orders.add(order)

      const chain = new Set<string>()
      let next = id
      while (next !== '-' && !checked.has(next)) {
        const entry = skills.get(next)
        if (!entry || chain.has(next)) {
          throw new Error('Invalid skill prerequisite chain')
        }
        chain.add(next)
        next = entry.previous
      }
      chain.forEach(value => checked.add(value))
    }
  }
}
