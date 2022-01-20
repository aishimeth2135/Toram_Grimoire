export default class Color {
  static List = [
    'white',
    'dark', 'light', 'light-2', 'light-3', 'light-4',

    'purple',

    'red',
    'red-light',

    'blue-purple',
    'water-blue', 'water-blue-light',
    'blue-green', 'blue-green-light',
    'green',

    'orange', 'orange-light',

    'gray', 'gray-light',
  ]
  static MappingList: { [key: string]: string } = {
    'white': 'white',
    'dark': 'light-4',
    'light': 'light-2',
    'light-2': 'light-3',
    'purple': 'light-4',
    'red-light': 'red',
    'water-blue-light': 'water-blue',
    'gray-light': 'gray',
    'blue-green-light': 'blue-green',
    'orange-light': 'orange',
  }

  static darken(color: string): string {
    return Color.MappingList[color] || 'light-4'
  }

  static lighten(color: string): string {
    return Object.keys(Color.MappingList)
      .find(k => Color.MappingList[k] === color) || 'light'
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
