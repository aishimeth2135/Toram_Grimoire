import { createEmptyArray } from '@/shared/utils/array'
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

self.addEventListener('message', function (evt) {
  const data = evt.data as MessageData
  if (data.type === 'start') {
    const offscreenCanvas = data.canvas
    const ctx = offscreenCanvas.getContext('2d')!
    startDraw(ctx, {
      width: data.width,
      height: data.height,
    })
  }
})

let currentHandle: number

function startDraw(
  ctx: OffscreenCanvasRenderingContext2D,
  viewport: { width: number; height: number }
) {
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

  const getRandomSnow = (randowY: boolean, frames: number = 1): SnowItem => {
    let snowY = -6
    const speed = getRandomInt(2, 5) / 8
    if (randowY) {
      snowY = Math.floor((viewport.height * getRandomInt(20, 950)) / 1000)
    } else if (frames > 1) {
      snowY += speed * (frames - 1)
    }
    return {
      x: Math.floor((viewport.width * getRandomInt(20, 981)) / 1000),
      y: snowY,
      speed,
      opacity: getRandomInt(65, 101) / 100,
      radius: getRandomInt(2, 6),
    }
  }

  let lastTime = 0
  let snows: SnowItem[] = createEmptyArray(60).map(() => getRandomSnow(true))
  let count = 0

  const draw = () => {
    const now = Date.now()
    let frames = 1
    const timeOffset = now - lastTime
    if (lastTime === 0) {
      lastTime = now
    } else if (timeOffset > 16) {
      frames = Math.max(Math.floor(timeOffset / 16), 1)
      lastTime = now
    } else {
      currentHandle = requestAnimationFrame(draw)
      return
    }

    if (count === 0) {
      const newSnows = createEmptyArray(frames).map((_item, idx) => getRandomSnow(false, idx + 1))
      snows.push(...newSnows)
      count = 30
    }
    count -= 1
    ctx.clearRect(0, 0, viewport.width, viewport.height)
    snows = snows.filter(snow => snow.y < viewport.height)
    snows.forEach(snow => {
      snow.y += snow.speed * frames
      ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity.toFixed(2)})`
      ctx.beginPath()
      ctx.arc(snow.x, snow.y, snow.radius, 0, 2 * Math.PI)
      ctx.fill()
    })

    currentHandle = requestAnimationFrame(draw)
  }

  draw()
}
