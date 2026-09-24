import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export { Chart }
export type { ChartData, ChartOptions } from 'chart.js'
