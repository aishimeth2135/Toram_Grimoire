
// @ts-check
const path = require('path')
const fs = require('fs/promises')
const Color = require('tinycolor2')

const lightColor = Color('#ffd1ea')

/**
 * @type Record<string, string>
 */
const baseColors = {
  'purple': '#c026d3',
  'blue-purple': '#7c3aed',
  'water-blue': '#2196f3',
  'blue-green': '#0891b2',
  'orange': '#d97706',
  'green': '#10b981',
  'red': '#f54747',
}

/**
 * @type Record<string, string>
 */
const color = {
  'dark': '#85005f',
  'dark-light': '#c62899',
  'light': lightColor.toHexString(),
  'light-2': lightColor.darken(8).toHexString(),
  'light-3': lightColor.darken(16).toHexString(),
  'light-4': lightColor.darken(8).toHexString(),
  'gray': '#888',
  'gray-light': '#ddd',
  'white': '#fff',
  'black': '#000',
  ...baseColors,
}

Object.entries(baseColors).map(([key, value]) => {
  color[`${key}-light`] = Color(value).lighten(20).toHexString()
})

const darkLightColor = Color('#804665')

/**
 * @type Record<string, string>
 */
const darkBaseColors = {
  'purple': '#f8e1fc',
  'blue-purple': '#ece0ff',
  'water-blue': '#c7e4fc',
  'blue-green': '#a4f5ed',
  'orange': '#e3c1a3',
  'green': '#ace8b3',
  'red': '#ffb5b5',
}

const dark = {
  'dark': '#fff',
  'dark-light': '#edd3e2',
  'light': darkLightColor.toHexString(),
  'light-2': darkLightColor.brighten(24).toHexString(),
  'light-3': darkLightColor.brighten(26).toHexString(),
  'light-4': darkLightColor.brighten(10).toHexString(),
  'gray': '#bbb',
  'gray-light': '#888',
  'white': '#1a1b26',
  'black': '#fff',
  ...darkBaseColors,
}

Object.entries(darkBaseColors).map(([key, value]) => {
  dark[`${key}-light`] = Color(value).darken(16).toHexString()
})

/**
 * @param {Record<string, string>} data
 */
const toRgbData = (data) => {
  /**
   * @type Record<string, string>
   */
  const colorsRgb = {}

  Object.entries(data).map(([key, value]) => {
    const rgbItem = Color(value).toRgb()
    colorsRgb[key] = `${rgbItem.r}, ${rgbItem.g}, ${rgbItem.b}`
  })

  return colorsRgb
}

/**
 * @param {Record<string, string>} data
 */
const toDesignTokenData = (data) => {
  /**
   * @type Record<string, { value: string }>
   */
  const designTokenData = {}

  Object.entries(data).map(([key, value]) => {
    designTokenData[key] = { value }
  })

  return designTokenData
}

async function handle() {
  const data = {
    color: toDesignTokenData(color),
    'color-dark': toDesignTokenData(dark),
    'color-rgb': toDesignTokenData(toRgbData(color)),
    'color-dark-rgb': toDesignTokenData(toRgbData(dark)),
  }

  await fs.writeFile(path.join(__dirname, 'color.json'), JSON.stringify(data, null, 2))
  console.log('done.')
}

console.log('start...')
handle()

// const colors = {
//   'dark': '#85005F',
//   'dark-light': '#c62899',
//   'light': '#ffd1ea',
//   'light-2': '#f7a8d3',
//   'light-3': '#ff5fb7',
//   'light-4': '#ff008d',
//   'purple': '#9c27b0',
//   'purple-light': '#c873d7',
//   'blue-purple': '#8330ff',
//   'blue-purple-light': '#caa6ff',
//   'water-blue': '#2196f3',
//   'water-blue-light': '#9acbf3',
//   'blue-green': '#009688',
//   'blue-green-light': '#a0e8e1',
//   'orange': '#de761b',
//   'orange-light': '#edcbad',
//   'green': '#23ad35',
//   'green-light': '#8ae696',
//   'red': '#f54747',
//   'red-light': '#f09797',
//   'gray': '#888',
//   'gray-light': '#ddd',
//   'white': '#fff',
//   'black': '#000',
// }

