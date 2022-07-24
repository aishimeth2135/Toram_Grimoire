export function debounce<Handler extends ((...args: any[]) => any)>(handler: Handler, delay = 100) {
  let timer: number | undefined

  return ((...args: Parameters<Handler>) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      handler(...args)
    }, delay)
  }) as Handler
}
