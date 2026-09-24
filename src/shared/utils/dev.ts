export function measurePerformance<Result>(name: string, callback: () => Result): Result {
  if (!import.meta.env.DEV) {
    return callback()
  }

  const startMark = `${name}:start`
  const endMark = `${name}:end`

  performance.mark(startMark)
  try {
    return callback()
  } finally {
    performance.mark(endMark)
    performance.measure(name, startMark, endMark)
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
  }
}
