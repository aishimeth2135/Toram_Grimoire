import { type BaseGem, type ChromaticTransGem, getBaseGemColor, isBaseGem } from './gems'

interface GrayscaleOrigin {
  readonly column: number
  readonly row: number
}

function clamp(value: number, max: number): number {
  return Math.min(max, Math.max(0, value))
}

function moveGrayscale(origin: GrayscaleOrigin | null, dx: number): GrayscaleOrigin | null {
  return origin ? { column: clamp(origin.column + dx, 4), row: clamp(origin.row + 1, 4) } : null
}

export class ChromaticTransStep {
  readonly index: number
  readonly gem: ChromaticTransGem | null
  readonly baseGem: BaseGem | null
  readonly column: number
  readonly row: number
  readonly radius: number
  readonly white: GrayscaleOrigin | null
  readonly black: GrayscaleOrigin | null
  readonly lockedColor: number | null
  readonly pool: readonly number[]

  constructor(index: number, selection: ChromaticTransGem | null, previous?: ChromaticTransStep) {
    this.index = index
    this.gem = index === 0 && selection && !isBaseGem(selection) ? null : selection
    this.baseGem = index === 0 ? (this.gem as BaseGem | null) : (previous?.baseGem ?? null)

    let column = previous?.column ?? 0
    let row = previous?.row ?? 2
    let radius = previous?.radius ?? 2
    let white = previous?.white ?? null
    let black = previous?.black ?? null
    let lockedColor = previous?.lockedColor ?? null

    if (index === 0 && this.baseGem) {
      column = getBaseGemColor(this.baseGem) - 38
    } else if (this.baseGem && this.gem) {
      const gem = this.gem
      if (isBaseGem(gem)) {
        column = Math.ceil((column + getBaseGemColor(gem) - 38) / 2)
        if (gem === this.baseGem) {
          radius = Math.max(0, radius - 1)
        }
      } else if (gem === 'diamond') {
        // A locked chromatic pool is unaffected by subsequent chromatic operations.
        lockedColor ??= 6 + row * 16 + column
      } else {
        const light = gem === 'cat-eye' || gem === 'pearl'
        white = moveGrayscale(white, light ? -1 : 0)
        black = moveGrayscale(black, light ? 0 : 1)
        row = clamp(row + (light ? -1 : 1), 4)

        // Apply movement to existing ranges before creating a new range.
        if (gem === 'pearl' && !white) {
          white = { column: 2, row: 2 }
        }
        if (gem === 'obsidian' && !black) {
          black = { column: 2, row: 2 }
        }
      }
    }

    this.column = column
    this.row = row
    this.radius = radius
    this.white = white
    this.black = black
    this.lockedColor = lockedColor
    this.pool = Object.freeze(this.calculatePool())
  }

  get color(): number {
    return this.baseGem ? 6 + this.row * 16 + this.column : 0
  }

  private calculatePool(): number[] {
    if (!this.baseGem) {
      return []
    }

    const pool = new Set<number>()
    if (this.lockedColor !== null) {
      pool.add(this.lockedColor)
    } else {
      // Manhattan radius: clip vertical overflow and wrap horizontal overflow.
      for (let dy = -this.radius; dy <= this.radius; dy += 1) {
        const row = this.row + dy
        if (row < 0 || row > 4) {
          continue
        }

        const width = this.radius - Math.abs(dy)
        for (let dx = -width; dx <= width; dx += 1) {
          const column = (this.column + dx + 16) % 16
          pool.add(6 + row * 16 + column)
        }
      }
    }

    // Only row=2 in the virtual grayscale table contributes actual colors.
    for (const [origin, direction] of [
      [this.white, -1],
      [this.black, 1],
    ] as const) {
      if (!origin) {
        continue
      }

      const dy = origin.row - 2
      if (dy < 0 || dy > 2) {
        continue
      }

      for (let distance = 0; distance <= 2 - dy; distance += 1) {
        const column = origin.column + direction * distance
        if (column >= 0 && column <= 4) {
          pool.add(column + 1)
        }
      }
    }

    return [...pool].sort((left, right) => left - right)
  }
}
