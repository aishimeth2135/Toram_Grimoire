import { isNumberString } from '../utils/string'

export default class Color {
  static darken(color: string): string {
    const parts = color.split('-')
    const _num = parts.pop()
    if (typeof _num === 'string' && isNumberString(_num)) {
      let num = parseInt(_num, 10)
      num = num === 5 ? 10 : num
      num = Math.min(90, num + 30)
      parts.push(num.toString())
      return parts.join('-')
    }
    return color
  }

  static lighten(color: string): string {
    const parts = color.split('-')
    const _num = parts.pop()
    if (typeof _num === 'string' && isNumberString(_num)) {
      let num = parseInt(_num, 10)
      num = num === 5 ? 10 : num
      num = Math.max(5, num - 30)
      parts.push(num.toString())
      return parts.join('-')
    }
    return color
  }

  value: string

  constructor(value: string) {
    this.value = value
  }

  get darken() {
    return Color.darken(this.value)
  }

  get lighten() {
    return Color.lighten(this.value)
  }
}

export const enum AppColors {
  Primary = 'primary',
  Fuchsia = 'fuchsia',
  Violet = 'violet',
  Blue = 'blue',
  Cyan = 'cyan',
  Orange = 'orange',
  Emerald = 'emerald',
  Red = 'red',
  Gray = 'gray',
  Stone = 'stone',
}
