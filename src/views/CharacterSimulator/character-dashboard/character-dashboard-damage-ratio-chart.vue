<script lang="ts" setup>
import { Chart, type ChartData, type ChartOptions, registerables } from 'chart.js'
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

import type { DamageChartSeries } from './character-dashboard-damage-chart-types'

interface Props {
  series: DamageChartSeries[]
}

const props = defineProps<Props>()

Chart.register(...registerables)

const canvas = useTemplateRef('canvas')
let chart: Chart<'bar'> | null = null

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
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
        label(context) {
          return `${context.label}: ${(context.parsed.x ?? 0).toFixed(2)}%`
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback(value) {
          return `${value}%`
        },
      },
    },
    y: {
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
  },
}

const averageDamages = computed(() =>
  props.series
    .map(series => ({
      color: series.color,
      label: series.label,
      value: series.values.reduce((sum, value) => sum + value, 0) / series.values.length,
    }))
    .sort((left, right) => right.value - left.value)
)

const highestAverageDamage = computed(() =>
  Math.max(0, ...averageDamages.value.map(damage => damage.value))
)

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: averageDamages.value.map(damage => damage.label),
  datasets: [
    {
      data: averageDamages.value.map(damage =>
        highestAverageDamage.value === 0 ? 0 : (damage.value * 100) / highestAverageDamage.value
      ),
      backgroundColor: averageDamages.value.map(damage => damage.color),
      borderColor: averageDamages.value.map(damage => damage.color),
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
      maxBarThickness: 30,
    },
  ],
}))

const copyData = (data: ChartData<'bar'>): ChartData<'bar'> => ({
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
    type: 'bar',
    data: copyData(chartData.value),
    options,
  })
})

watch(
  chartData,
  data => {
    if (!chart) {
      return
    }

    chart.data = copyData(data)
    chart.update()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  chart?.destroy()
})
</script>

<template>
  <div class="mx-auto h-80">
    <canvas ref="canvas"></canvas>
  </div>
</template>
