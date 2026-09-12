export const BASE_GEMS = [
  'ruby',
  'garnet',
  'red-agate',
  'topaz',
  'citrine',
  'peridot',
  'emerald',
  'beryl',
  'sapphire',
  'zircon',
  'rose-quartz',
  'lapis-lazuli',
  'onyx',
  'amethyst',
  'red-quartz',
  'tourmaline',
] as const

export type BaseGem = (typeof BASE_GEMS)[number]

export type ChromaticTransGem = BaseGem | 'cat-eye' | 'moonstone' | 'pearl' | 'obsidian' | 'diamond'

export const CHROMATIC_COLORS = Object.freeze(
  Array.from({ length: 80 }, (_value, index) => index + 6)
)

export const GRAYSCALE_COLORS = Object.freeze([1, 2, 3, 4, 5])

export function isBaseGem(gem: ChromaticTransGem): gem is BaseGem {
  return BASE_GEMS.some(base => base === gem)
}

export function getBaseGemColor(gem: BaseGem): number {
  return BASE_GEMS.indexOf(gem) + 38
}

export function getBaseGemByColor(color: number): BaseGem | null {
  return BASE_GEMS[color - 38] ?? null
}
