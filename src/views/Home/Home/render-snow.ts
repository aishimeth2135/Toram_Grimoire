import { getRandomInt } from '@/shared/utils/number'

type MessageData =
  | {
      type: 'start'
      canvas: OffscreenCanvas
      width: number
      height: number
    }
  | {
      type: 'viewport-changed'
      width: number
      height: number
    }

const viewport = {
  width: 0,
  height: 0,
}

let currentHandle: number

self.addEventListener('message', function (evt) {
  const data = evt.data as MessageData
  if (data.type === 'start') {
    const offscreenCanvas = data.canvas
    const ctx = offscreenCanvas.getContext('2d')!
    viewport.width = data.width
    viewport.height = data.height
    startDraw(ctx)
  } else if (data.type === 'viewport-changed') {
    viewport.width = data.width
    viewport.height = data.height
  }
})

function startDraw(ctx: OffscreenCanvasRenderingContext2D) {
  if (typeof currentHandle === 'number') {
    cancelAnimationFrame(currentHandle)
  }

  interface SnowItem {
    x: number
    y: number
    speed: number
    opacity: number
    radius: number
  }

  const getRandomSnow = (randowY: boolean = false): SnowItem => {
    return {
      x: (viewport.width * getRandomInt(20, 981)) / 1000,
      y: randowY ? (viewport.height * getRandomInt(20, 900)) / 1000 : 0,
      speed: getRandomInt(3, 5) / 32,
      opacity: getRandomInt(65, 101) / 100,
      radius: getRandomInt(2, 6),
    }
  }

  let snows: SnowItem[] = Array(50)
    .fill(null)
    .map(() => getRandomSnow(true))
  let count = 0

  const draw = () => {
    if (count === 0) {
      snows.push(getRandomSnow())
      count = 80
    }
    count -= 1
    ctx.clearRect(0, 0, viewport.width, viewport.height)
    snows = snows.filter(snow => snow.y < viewport.height)
    snows.forEach(snow => {
      ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity.toFixed(2)})`
      ctx.beginPath()
      snow.y += snow.speed
      ctx.arc(snow.x, snow.y, snow.radius, 0, 2 * Math.PI)
      ctx.fill()
    })

    currentHandle = requestAnimationFrame(draw)
  }

  draw()
}
