class CommonLogger {
  private _scope: string

  constructor(scope: string) {
    this._scope = scope
  }

  addTitle(title: string) {
    CommonLogger.addTitle(title)
    return this
  }

  info(desc: string) {
    CommonLogger.info(this._scope, desc)
  }

  warn(desc: string) {
    CommonLogger.warn(this._scope, desc)
  }

  start(title: string, collapsed: boolean = true) {
    return CommonLogger.start(this._scope, title, collapsed)
  }

  private static _title: string

  private static _handleLoggerContent(scope: string, desc: string, level: 'info' | 'warn') {
    const isDarkMode =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

    let result = `%c${scope}`
    let scopeBgColor = '#0284c7'
    if (level === 'warn') {
      scopeBgColor = '#ea580c'
    }
    const colors = [
      `color: white; background-color: ${scopeBgColor}; padding: 2px 4px; border-radius: 2px`,
    ]
    if (CommonLogger._title) {
      result += `%c [${CommonLogger._title}]`
      colors.push(`color: ${isDarkMode ? '#bfdbfe' : '#075985'};`)
      CommonLogger._title = ''
    }
    return [`${result}%c ${desc}`, ...colors, `color: ${isDarkMode ? 'white' : 'black'}`]
  }

  static addTitle(title: string) {
    CommonLogger._title = title
    return CommonLogger
  }

  static warn(scope: string, desc: string, ...datas: any[]): void {
    const contents = CommonLogger._handleLoggerContent(scope, desc, 'warn')
    console.log(...contents, ...datas)
  }

  static info(scope: string, desc: string, ...datas: any[]): void {
    const contents = CommonLogger._handleLoggerContent(scope, desc, 'info')
    console.log(...contents, ...datas)
  }

  static start(scope: string, desc: string, collapsed: boolean = true) {
    const handler = collapsed ? console.groupCollapsed : console.group
    const contents = CommonLogger._handleLoggerContent(scope, desc, 'info')
    handler(...contents)

    const item = {
      log: (...datas: any[]) => {
        console.log(...datas)
        return item
      },
      warn: (...datas: any[]) => {
        console.warn(...datas)
        return item
      },
      end: console.groupEnd as () => void,
    }

    return item
  }
}

export { CommonLogger }
