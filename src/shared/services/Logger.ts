class AppLogger {
  warn(scope: string, ...datas: any[]): void {
    console.warn(`[${scope}]`, datas)
  }

  log(scope: string, ...datas: any[]): void {
    console.log(`[${scope}]`, ...datas)
  }

  start(scope: string, title: string, collapsed: boolean = true) {
    ;(collapsed ? console.groupCollapsed : console.group)(`[${scope}] ${title}`)

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

export default new AppLogger()
