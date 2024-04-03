// @ts-check
const path = require('path')
const fs = require('fs/promises')
const Color = require('tinycolor2')
const tcColors = require('tailwindcss/colors')

/**
 * @type Record<string, Record<string, string>>
 */
const baseColors = {
  // 'purple': '#c026d3',
  // 'blue-purple': '#7c3aed',
  // 'water-blue': '#2196f3',
  // 'blue-green': '#14a6c9',
  // 'orange': '#f0a51a',
  // 'green': '#10b981',
  // 'red': '#f54747',
  fuchsia: tcColors.fuchsia,
  violet: tcColors.violet,
  blue: tcColors.blue,
  cyan: tcColors.cyan,
  orange: tcColors.amber,
  emerald: tcColors.emerald,
  red: tcColors.rose,
  gray: tcColors.gray,
  stone: tcColors.slate,
}

// pattern: fuchsia|violet|blue|cyan|orange|emerald|red|gray|stone

// const primary = {
//   '50': '#FCF2F8',
//   '100': '#FCE8F5',
//   '200': '#FBCFEB',
//   '300': '#FAADDB',
//   '400': '#F77BC5',
//   '500': '#F254B0',
//   '600': '#E43A9D',
//   '700': '#CD268C',
//   '800': '#AB1872',
//   '900': '#800D58',
// }
// const primary = {
//   '50': '#FCF2F3',
//   '100': '#FCE8E9',
//   '200': '#FBD6D9',
//   '300': '#FDC1C5',
//   '400': '#FFA3A9',
//   '500': '#FD7A83',
//   '600': '#F6545F',
//   '700': '#E33641',
//   '800': '#BD222C',
//   '900': '#801219',
// }
// const primary = {
//   '50': '#FCFAFA',
//   '100': '#FEE9EB',
//   '200': '#FFCCCF',
//   '300': '#FFA3A9',
//   '400': '#FD7A8B',
//   '500': '#F5577A',
//   '600': '#E83B6D',
//   '700': '#CF2862',
//   '800': '#A91954',
//   '900': '#790F40',
// }
const primary = {
  50: '#FFF7FA',
  100: '#FFE7EF',
  200: '#FFCBDC',
  300: '#FFA3C2',
  400: '#FD7AA6',
  500: '#F5578C',
  600: '#E83B7F',
  700: '#CF286B',
  800: '#A91956',
  900: '#790F3F',
}

/**
 * @type Record<string, Record<string, string>>
 */
const colors = {
  ...baseColors,
  primary,
}

/**
 * @type Record<string, string>
 */
const color = {
  white: '#ffffff',
  black: '#171717',
}
const colorOrders = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
]

/**
 * @type Record<string, string>
 */
const dark = {
  white: '#171717',
  black: '#ffffff',
}

Object.entries(colors).map(([key, value]) => {
  colorOrders.forEach((num, idx) => {
    const subkey = num.slice(0, -1)

    color[`${key}-${subkey}`] = value[num]

    const reversedIdx = 9 - idx
    const darkColor = Color(value[colorOrders[reversedIdx]])
    const darkColorHsl = darkColor.toHsl()
    const fixedIdx = (reversedIdx + 11) / 2

    const desaturate = Math.min(
      10 + Math.floor((30 * fixedIdx) / 10),
      Math.ceil((darkColorHsl.s * 100) / 2)
    )
    darkColor.desaturate(desaturate)

    const lighten = Math.min(
      Math.floor((20 * (8 - reversedIdx)) / 5),
      Math.ceil((100 - darkColorHsl.l * 100) / 2)
    )
    lighten > 0 ? darkColor.lighten(lighten) : darkColor.darken(-1 * lighten)

    dark[`${key}-${subkey}`] = darkColor.toHexString()
  })
})

/**
 * @param {Record<string, string>} data
 */
const toRgbData = data => {
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
const toDesignTokenData = data => {
  /**
   * @type Record<string, { value: string }>
   */
  const designTokenData = {}

  Object.entries(data).map(([key, value]) => {
    designTokenData[key] = { value }
  })

  return designTokenData
}

async function start() {
  console.log('start...')
  const data = {
    'color': toDesignTokenData(color),
    'color-dark': toDesignTokenData(dark),
    'color-rgb': toDesignTokenData(toRgbData(color)),
    'color-dark-rgb': toDesignTokenData(toRgbData(dark)),
  }

  await fs.writeFile(
    path.join(__dirname, 'color.json'),
    JSON.stringify(data, null, 2)
  )
  console.log('done.')
}

start()
