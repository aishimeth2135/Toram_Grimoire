import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'

type Row = string[]
interface Branch {
  id: number
  name: string
  rows: Row[]
}
interface Effect {
  row: number
  skill: string
  effectId: number
  date: string | null
  isDefault: boolean
  inherited: boolean
  branches: Branch[]
  legacy: Row[]
}
interface Operation {
  row: number
  skill: string
  effectId: number
  date: string | null
  inherited: boolean
  basicAdded: boolean
  anchor: Row
  insert: Row[]
}
interface Plan {
  version: number
  sourceHash: string
  outputHash: string
  columns: number
  source: Row[]
  outputRowCount: number
  operations: Operation[]
}

const COLUMN_COUNT = 20
const DEFAULT_SETS = ['預設', '非預設', '預設/and', '非預設/and', '歷史紀錄']
const BASIC_FIELDS = [
  { key: 'mp_cost' },
  { key: 'range' },
  {
    key: 'skill_type',
    from: ['瞬發', '須詠唱', '須蓄力', '被動', 'EX技能'],
    to: ['instant', 'casting', 'charging', 'passive', 'extra'],
  },
  {
    key: 'in_combo',
    from: ['可以放入連擊', '無法放入連擊', '不可放入連擊的第一招'],
    to: ['1', '0', 'not_lead'],
  },
  {
    key: 'action_time',
    from: ['極慢', '慢', '稍慢', '一般', '稍快', '快', '極快'],
    to: ['very_slow', 'slow', 'little_slow', 'normal', 'little_fast', 'fast', 'very_fast'],
  },
  { key: 'casting_time' },
]

function fail(message: string): never {
  throw new Error(message)
}

function emptyRow(): Row {
  return Array<string>(COLUMN_COUNT).fill('')
}

function hashRows(rows: Row[]): string {
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex')
}

function branchRow(row: Row): Row {
  const result = emptyRow()
  result.splice(6, 5, ...row.slice(6, 11))
  result.splice(17, 3, ...row.slice(17, 20))
  return result
}

// LoadSkill reads these six columns only on ordinary effect headers.
// The mapping is the composition of LoadSkill and effectBasicPropsToBranch.
function basicRows(row: Row, rowNumber: number): Row[] {
  const result: Row[] = []
  BASIC_FIELDS.forEach((field, index) => {
    const rawValue = row[11 + index]
    if (rawValue === '') return
    let value = rawValue
    if (field.from && field.to) {
      const enumIndex = field.from.indexOf(rawValue)
      if (enumIndex === -1) fail(`第 ${rowNumber} 列的 ${field.key} 非法：${rawValue}`)
      value = field.to[enumIndex]
    } else if (field.key === 'range' && value === '-') {
      value = 'no_limit'
    }
    const converted = emptyRow()
    converted[8] = field.key
    converted[9] = value
    result.push(converted)
  })
  if (result.length === 0) result.push(emptyRow())
  result[0][6] = '139'
  result[0][7] = 'basic'
  return result
}

function parseEffects(rows: Row[]): { effects: Effect[]; skills: number; warnings: string[] } {
  let categoryId = '',
    treeId = '',
    skillId = ''
  let skillLabel = ''
  let current: Effect | undefined
  let currentBranch: Branch | undefined
  let inEffect = false
  let skillCount = 0
  let normalEffects: Effect[] = []
  const defaults = new Set<string>()
  const skillIds = new Set<string>()
  const effects: Effect[] = []
  const warnings: string[] = []
  rows.forEach((row, index) => {
    if (index === 0 || row.every(value => value === '')) return
    const numericId = Number.parseInt(row[0], 10)
    const oldEffect = current
    let clone = false
    if (!Number.isNaN(numericId)) {
      if (row[1] === '0') {
        categoryId = row[0]
        inEffect = false
        return
      }
      if (row[1] === '1') {
        treeId = row[0]
        inEffect = false
        return
      }
      if (row[1] !== '') {
        skillId = `${categoryId}-${treeId}-${numericId}`
        skillLabel = `${skillId} ${row[1]}`
        if (skillIds.has(skillId)) fail(`第 ${index + 1} 列有重複技能：${skillId}`)
        skillIds.add(skillId)
        skillCount += 1
        normalEffects = []
        inEffect = false
      }
      const selected = DEFAULT_SETS.indexOf(row[2])
      if (selected === -1) return
      if (!skillId) fail(`第 ${index + 1} 列缺少所屬技能`)
      const isHistory = selected === 4
      const effectId = isHistory ? Number.parseInt(row[3], 10) : normalEffects.length
      if (isHistory && !normalEffects[effectId]) {
        warnings.push(
          `第 ${index + 1} 列 ${skillLabel} 的歷史目標 effect ${row[3]} 不存在；依 LoadSkill 忽略此歷史區塊並原樣保留`
        )
        current = undefined
        inEffect = true
        return
      }
      current = {
        row: index + 1,
        skill: skillLabel,
        effectId,
        date: isHistory ? row[4] : null,
        isDefault: !isHistory && (selected === 0 || selected === 2),
        inherited: false,
        branches: [],
        legacy: isHistory ? [] : basicRows(row, index + 1),
      }
      if (!isHistory) {
        if (current.isDefault)
          normalEffects.forEach(effect => {
            effect.isDefault = false
          })
        normalEffects.push(current)
        if (selected === 0 || selected === 2) defaults.add(skillId)
        clone = !!oldEffect && row[6] === ''
      }
      inEffect = true
      effects.push(current)
    } else if (current?.date !== null && current && row[4] !== '') {
      current = {
        row: index + 1,
        skill: current.skill,
        effectId: current.effectId,
        date: row[4],
        isDefault: false,
        inherited: false,
        branches: [],
        legacy: [],
      }
      clone = row[6] === ''
      effects.push(current)
    }
    if (!inEffect || !current) return
    if (clone && oldEffect) {
      current.inherited = true
      current.branches = structuredClone(oldEffect.branches)
      return
    }
    if (row[6] !== '') {
      const branchId = Number.parseInt(row[6], 10)
      currentBranch = {
        id: row[6] === '-' || Number.isNaN(branchId) ? -1 : branchId,
        name: row[7],
        rows: [branchRow(row)],
      }
      current.branches.push(currentBranch)
    } else if (row[8] !== '') {
      if (!currentBranch || !current.branches.includes(currentBranch)) {
        fail(`第 ${index + 1} 列的屬性跨 effect 指向上一個 branch，需人工整理後再轉換`)
      }
      currentBranch.rows.push(branchRow(row))
    }
  })
  for (const id of skillIds) {
    if (!defaults.has(id))
      fail(`技能 ${id} 沒有預設 effect；請先補齊，避免 LoadSkill 自動建立額外 effect`)
  }
  return { effects, skills: skillCount, warnings }
}

function defaultEffects(effects: Effect[]): Map<string, Effect> {
  return new Map(effects.filter(effect => effect.isDefault).map(effect => [effect.skill, effect]))
}

function basicProps(rows: Row[], localeColumn: number): Map<string, string> {
  const props = new Map<string, string>()
  rows.forEach(row => {
    if (row[8] !== '') props.set(`${row[8]}\0${row[10]}`, row[localeColumn] || row[9])
  })
  return props
}

function ownBasic(effect: Effect): Branch {
  return (
    effect.branches.find(branch => branch.name === 'basic') ?? {
      id: 139,
      name: 'basic',
      rows: effect.legacy,
    }
  )
}

function effectiveBasic(
  effect: Effect,
  defaultEffect: Effect,
  localeColumn: number
): [string, string][] {
  const base = ownBasic(defaultEffect)
  const props = basicProps(base.rows, localeColumn)
  const override = ownBasic(effect)
  if (effect !== defaultEffect && base.id !== -1 && override.id === base.id) {
    for (const [key, value] of basicProps(override.rows, localeColumn)) {
      if (value === '' && props.get(key)) props.delete(key)
      else props.set(key, value)
    }
  }
  return [...props].sort(([left], [right]) => left.localeCompare(right))
}

function sameBasic(effect: Effect, defaultEffect: Effect): boolean {
  return [9, 17, 18, 19].every(
    localeColumn =>
      JSON.stringify(effectiveBasic(effect, defaultEffect, localeColumn)) ===
      JSON.stringify(effectiveBasic(defaultEffect, defaultEffect, localeColumn))
  )
}

function plannedBasics(effects: Effect[]): Map<Effect, Row[]> {
  const defaults = defaultEffects(effects)
  const result = new Map<Effect, Row[]>()
  for (const effect of effects) {
    if (effect.date !== null || effect.branches.some(branch => branch.name === 'basic')) continue
    const defaultEffect = defaults.get(effect.skill)!
    if (!effect.isDefault && sameBasic(effect, defaultEffect)) continue
    const converted = structuredClone(effect.legacy)
    if (effect.isDefault) {
      // 歷史覆寫同樣需要可定位的 id；不能只檢查一般 effect。
      const needsId = effects.some(
        other =>
          other.skill === effect.skill &&
          (other.date === null
            ? !other.isDefault && !sameBasic(other, effect)
            : other.branches.some(branch => branch.id === 139))
      )
      converted[0][6] = needsId ? '139' : '-'
    }
    result.set(effect, converted)
  }
  return result
}

function branchOverrides(effect: Effect, defaultEffect: Effect): Branch[] {
  if (effect === defaultEffect) return effect.branches
  return effect.branches.filter(
    branch =>
      branch.id !== -1 &&
      (branch.name === '' ||
        branch.rows.some(
          row => row[8] !== '' && [9, 17, 18, 19].some(column => !(row[column] || row[9]))
        ) ||
        effect.branches.filter(other => other.name !== 'basic' && other.id === branch.id).length >
          1 ||
        !defaultEffect.branches.some(base => JSON.stringify(base) === JSON.stringify(branch)))
  )
}

function createOperations(rows: Row[], effects: Effect[]): Operation[] {
  const basics = plannedBasics(effects)
  const defaults = defaultEffects(effects)
  const operations: Operation[] = []
  for (const effect of effects) {
    const basic = effect.branches.filter(branch => branch.name === 'basic')
    if (effect.date === null && basic.length > 1) fail(`第 ${effect.row} 列的 effect 含多個 basic`)
    if (effect.branches.some(branch => branch.id === 139 && branch.name !== 'basic')) {
      fail(`第 ${effect.row} 列的 branch id 139 已被其他類型使用`)
    }
    const basicAdded = basics.has(effect)
    if (!basicAdded) {
      // 沒有 basic 差異時保留空首列，讓 LoadSkill 延用原本的隱式繼承。
      if (effect.date === null && rows[effect.row - 1].slice(11, 17).some(Boolean)) {
        const anchor = rows[effect.row - 1].slice()
        anchor.fill('', 11, 17)
        operations.push({
          row: effect.row,
          skill: effect.skill,
          effectId: effect.effectId,
          date: effect.date,
          inherited: effect.inherited,
          basicAdded,
          anchor,
          insert: [],
        })
      }
      continue
    }
    const payloads: Row[] = []
    if (basicAdded) payloads.push(...basics.get(effect)!)
    if (effect.inherited) {
      // 寫入 basic 會中斷隱式繼承，只補回與預設分支不同的覆寫資料。
      payloads.push(
        ...branchOverrides(effect, defaults.get(effect.skill)!).flatMap(branch => branch.rows)
      )
    } else if (rows[effect.row - 1][6] !== '') {
      payloads.push(branchRow(rows[effect.row - 1]))
    }
    if (payloads.length === 0) fail(`第 ${effect.row} 列繼承了空的歷史 effect，需人工整理`)
    const anchor = rows[effect.row - 1].slice()
    anchor.splice(6, 5, ...payloads[0].slice(6, 11))
    anchor.splice(17, 3, ...payloads[0].slice(17, 20))
    if (effect.date === null) anchor.fill('', 11, 17)
    operations.push({
      row: effect.row,
      skill: effect.skill,
      effectId: effect.effectId,
      date: effect.date,
      inherited: effect.inherited,
      basicAdded,
      anchor,
      insert: payloads.slice(1),
    })
  }
  return operations.sort((left, right) => right.row - left.row)
}

function applyOperations(rows: Row[], operations: Operation[]): Row[] {
  const output = structuredClone(rows)
  operations.forEach(operation => {
    output.splice(operation.row - 1, 1, operation.anchor, ...operation.insert)
  })
  return output
}

function signature(effect: Effect, localeColumn: number, defaults: Map<string, Effect>): unknown {
  const branches =
    effect.date === null
      ? branchOverrides(effect, defaults.get(effect.skill)!).filter(
          branch => branch.name !== 'basic'
        )
      : effect.branches
  return {
    skill: effect.skill,
    effectId: effect.effectId,
    date: effect.date,
    basic:
      effect.date === null
        ? effectiveBasic(effect, defaults.get(effect.skill)!, localeColumn)
        : undefined,
    branches: branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      attrs: branch.rows
        .filter(row => row[8] !== '')
        .map(row => [row[8], row[localeColumn] || row[9], row[10]]),
    })),
  }
}

function verifyMigration(source: Row[], output: Row[], original: Effect[]): void {
  const migrated = parseEffects(output).effects
  const originalDefaults = defaultEffects(original)
  const migratedDefaults = defaultEffects(migrated)
  if (original.length !== migrated.length) fail('轉換前後的 effect 數量不符')
  original.forEach((effect, index) => {
    for (const localeColumn of [9, 17, 18, 19]) {
      if (
        JSON.stringify(signature(effect, localeColumn, originalDefaults)) !==
        JSON.stringify(signature(migrated[index], localeColumn, migratedDefaults))
      ) {
        fail(
          `第 ${effect.row} 列 ${effect.skill} 的 effect ${effect.effectId}／${effect.date ?? '目前'}，語系欄 ${localeColumn + 1} 轉換不等價`
        )
      }
    }
    if (effect.date === null && output[migrated[index].row - 1].slice(11, 17).some(Boolean)) {
      fail('轉換後仍有未清空的舊欄位')
    }
  })
  if (source[0].join('\0') !== output[0].join('\0')) fail('表頭被修改')
  const rerun = createOperations(output, migrated)
  if (rerun.length !== 0) fail('轉換結果再次執行仍會產生變更')
}

async function main(): Promise<void> {
  const directory = path.dirname(fileURLToPath(import.meta.url))
  const args = process.argv.slice(2)
  if (args.length > 2)
    fail('用法：node --experimental-strip-types migrate.ts [來源 CSV] [輸出目錄]')
  const input = path.resolve(args[0] ?? path.join(directory, 'skill-data.csv'))
  const outputDirectory = path.resolve(args[1] ?? path.join(directory, 'output'))
  if (path.dirname(input) === outputDirectory) fail('輸出目錄不能與來源 CSV 目錄相同')
  const parsed = Papa.parse<Row>((await readFile(input, 'utf8')).replace(/^\uFEFF/, ''))
  if (parsed.errors.length > 0) fail(`CSV 解析失敗：${JSON.stringify(parsed.errors)}`)
  const source = parsed.data
  while (source.length > 0 && source[source.length - 1].every(value => value === '')) source.pop()
  if (source.length < 2 || source[0].length !== COLUMN_COUNT)
    fail('需要 A～T 共 20 欄的技能資料 CSV')
  source.forEach((row, index) => {
    if (row.every(value => value === '')) source[index] = emptyRow()
    else if (row.length !== COLUMN_COUNT) fail(`第 ${index + 1} 列欄數不是 20`)
  })
  const { effects, skills, warnings } = parseEffects(source)
  const basics = plannedBasics(effects)
  const operations = createOperations(source, effects)
  const output = applyOperations(source, operations)
  verifyMigration(source, output, effects)
  const plan: Plan = {
    version: 1,
    sourceHash: hashRows(source),
    outputHash: hashRows(output),
    columns: COLUMN_COUNT,
    source,
    outputRowCount: output.length,
    operations,
  }
  const report = {
    input,
    skills,
    effects: effects.filter(effect => effect.date === null).length,
    histories: effects.filter(effect => effect.date !== null).length,
    sourceRows: source.length,
    outputRows: output.length,
    insertedRows: output.length - source.length,
    operations: operations.length,
    basicAdded: operations.filter(operation => operation.basicAdded).length,
    basicInheritedFromDefault: effects.filter(
      effect =>
        effect.date === null &&
        !effect.isDefault &&
        !effect.branches.some(branch => branch.name === 'basic') &&
        !basics.has(effect)
    ).length,
    defaultBasicWithoutId: [...basics].filter(
      ([effect, converted]) => effect.isDefault && converted[0][6] === '-'
    ).length,
    defaultBasicWithId: [...basics].filter(
      ([effect, converted]) => effect.isDefault && converted[0][6] === '139'
    ).length,
    expandedNormalInheritance: operations.filter(
      operation =>
        operation.inherited &&
        operation.basicAdded &&
        operation.date === null &&
        operation.insert.some(row => row[6] !== '' && row[7] !== 'basic')
    ).length,
    expandedHistoryInheritance: operations.filter(
      operation => operation.inherited && operation.basicAdded && operation.date !== null
    ).length,
    preservedNormalInheritance: effects.filter(
      effect => effect.date === null && effect.inherited && !basics.has(effect)
    ).length,
    sourceHash: plan.sourceHash,
    outputHash: plan.outputHash,
    warnings,
    verification:
      '非 basic 差異分支與歷史覆寫資料保留；無 basic 差異的空 effect 保留隱式繼承；四語系的 basic 套用預設／覆寫後數值等價；舊欄位已清空；重跑無變更。未執行網站 UI 或 Google Sheets 樣式驗證。',
    changes: operations.map(operation => ({
      sourceRow: operation.row,
      skill: operation.skill,
      effectId: operation.effectId,
      date: operation.date,
      basicAdded: operation.basicAdded,
      basicId: operation.basicAdded ? operation.anchor[6] : null,
      inherited: operation.inherited,
      insertedRows: operation.insert.length,
    })),
  }
  const appScript = await readFile(path.join(directory, 'apply.gs'), 'utf8')
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(
    path.join(outputDirectory, 'skill-data.migrated.csv'),
    '\uFEFF' + Papa.unparse(output, { newline: '\r\n' }),
    'utf8'
  )
  await writeFile(path.join(outputDirectory, 'plan.json'), JSON.stringify(plan), 'utf8')
  await writeFile(
    path.join(outputDirectory, 'report.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  )
  await writeFile(path.join(outputDirectory, 'apply.gs'), appScript, 'utf8')
  console.log(JSON.stringify({ ...report, changes: undefined }, null, 2))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
