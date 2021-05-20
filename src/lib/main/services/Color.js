export default class Color {
  static List = [
    'white',
    'dark', 'light', 'light-2', 'light-3', 'light-4',
    'purple',
    'red', 'red-light',
    'water-blue', 'water-blue-light',
    'gray', 'gray-light',
    'orange', 'orange-light',
    'green',
    'blue-green', 'blue-green-light'
  ];
  static MappingList = {
    'white': 'white',
    'dark': 'light-4',
    'light': 'light-2',
    'light-2': 'light-3',
    'purple': 'light-4',
    'red-light': 'red',
    'water-blue-light': 'water-blue',
    'gray-light': 'gray',
    'blue-green-light': 'blue-green',
    'orange-light': 'orange'
  };

  /**
   * @param {string} color
   * @returns {string}
   */
  static darken(color) {
    return Color.MappingList[color] || 'light-4';
  }

  /**
   * @param {string} color
   * @returns {string}
   */
  static lighten(color) {
    return Object.keys(Color.MappingList)
      .find(k => Color.MappingList[k] === color) || 'light';
  }

  /**
   * @param {string} value
   */
  constructor(value) {
    this.value = value;
  }

  get darken() {
    return Color.darken(this.value);
  }

  get lighten() {
    return Color.lighten(this.value);
  }
}