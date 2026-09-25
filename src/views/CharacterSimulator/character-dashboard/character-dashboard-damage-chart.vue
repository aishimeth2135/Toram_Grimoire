<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

import type { DamageChartSeries } from './character-dashboard-damage-chart-types'
import { Chart, type ChartData, type ChartOptions } from './chart'

interface Props {
  series: DamageChartSeries[]
  resistanceValues: number[]
  defenseValues: number[]
  xAxisTitle: string
  yAxisTitle: string
}

const props = defineProps<Props>()

const canvas = useTemplateRef('canvas')
let chart: Chart<'line'> | null = null
const MILLION = 1_000_000

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
})

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title(tooltipItems) {
          return tooltipItems.at(0)?.label.split(',').join('/') ?? ''
        },
        label(context) {
          return `${context.dataset.label}: ${numberFormatter.format(context.parsed.y ?? 0)}m`
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: props.xAxisTitle,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: props.yAxisTitle,
      },
      ticks: {
        callback(value) {
          return `${numberFormatter.format(Number(value))}m`
        },
      },
    },
  },
}

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.resistanceValues.map((resistance, index) => [
    `${resistance}%`,
    props.defenseValues[index].toString(),
  ]),
  datasets: props.series.map(series => ({
    label: series.label,
    data: series.values.map(value => value / MILLION),
    borderColor: series.borderColor,
    backgroundColor: series.backgroundColor,
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.15,
  })),
}))

const copyData = (data: ChartData<'line'>): ChartData<'line'> => ({
  labels: data.labels ? [...data.labels] : [],
  datasets: data.datasets.map(dataset => ({
    ...dataset,
    data: [...dataset.data],
  })),
})

onMounted(() => {
  if (!canvas.value) {
    return
  }

  chart = new Chart(canvas.value, {
    type: 'line',
    data: copyData(chartData.value),
    options,
  })
})

watch(chartData, data => {
  if (!chart) {
    return
  }

  const nextData = copyData(data)
  const remainingDatasets = [...chart.data.datasets]
  chart.data.labels = nextData.labels
  chart.data.datasets = nextData.datasets.map(dataset => {
    const previousIndex = remainingDatasets.findIndex(previous => previous.label === dataset.label)
    if (previousIndex < 0) {
      return dataset
    }

    const previous = remainingDatasets.splice(previousIndex, 1)[0]
    return Object.assign(previous, dataset)
  })
  chart.update()
})

onBeforeUnmount(() => {
  chart?.destroy()
})
</script>

<template>
  <div class="h-96 min-h-72 w-full">
    <canvas ref="canvas"></canvas>
  </div>
</template>
