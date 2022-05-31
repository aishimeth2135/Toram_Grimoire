export default class Color {
  static List = [
    'white',
    'dark', 'dark-light',
    'light', 'light-2', 'light-3', 'light-4',

    'purple', 'purple-light',

    'red', 'red-light',

    'blue-purple', 'blue-purple-light',
    'water-blue', 'water-blue-light',
    'blue-green', 'blue-green-light',
    'green', 'green-light',

    'orange', 'orange-light',

    'gray', 'gray-light',
  ]
  static MappingList: Record<string, string> = {
    'white': 'white',
    'dark-light': 'dark',
    'light': 'light-2',
    'light-2': 'light-3',
    'purple-light': 'purple',
    'red-light': 'red',
    'water-blue-light': 'water-blue',
    'blue-purple-light': 'blue-purple',
    'gray-light': 'gray',
    'blue-green-light': 'blue-green',
    'orange-light': 'orange',
    'green-light': 'green',
  }

  static darken(color: string): string {
    return Color.MappingList[color] || 'light-4'
  }

  static lighten(color: string): string {
    return Object.keys(Color.MappingList)
      .find(key => Color.MappingList[key] === color) || 'light'
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
