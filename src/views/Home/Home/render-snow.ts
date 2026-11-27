import { createEmptyArray } from '@/shared/utils/array'
import { getRandomInt } from '@/shared/utils/number'

type MessageData =
  | {
      type: 'start'
      canvas: OffscreenCanvas
      width: number
      height: number
      hidden: boolean
    }
  | {
      type: 'visibility'
      hidden: boolean
    }

const FRAME_INTERVAL = 1000 / 60
const MAX_FRAME_DELTA = 50
const MAX_SNOW_COUNT = 240

let setHidden: ((hidden: boolean) => void) | undefined

self.addEventListener('message', function (evt) {
  const data = evt.data as MessageData
  if (data.type === 'start') {
    setHidden?.(true)
    const ctx = data.canvas.getContext('2d')
    setHidden = ctx ? createDrawLoop(ctx, data) : undefined
  }
  setHidden?.(data.hidden)
})

function createDrawLoop(
  ctx: OffscreenCanvasRenderingContext2D,
  viewport: { width: number; height: number }
) {
  interface SnowItem {
    x: number
    y: number
    speed: number
    opacity: number
    radius: number
  }

  const getRandomSnow = (randomY: boolean): SnowItem => {
    return {
      x: Math.floor((viewport.width * getRandomInt(20, 981)) / 1000),
      y: randomY ? Math.floor((viewport.height * getRandomInt(20, 950)) / 1000) : -6,
      speed: getRandomInt(2, 5) / 8,
      opacity: getRandomInt(65, 101) / 100,
      radius: getRandomInt(2, 6),
    }
  }

  let frameHandle: number | undefined
  let lastTime: number | undefined
  let frameTime = FRAME_INTERVAL
  let framesUntilSnow = 1
  let snows: SnowItem[] = createEmptyArray(60).map(() => getRandomSnow(true))

  const draw = (timestamp: number) => {
    frameHandle = requestAnimationFrame(draw)
    frameTime += Math.min(timestamp - (lastTime ?? timestamp), MAX_FRAME_DELTA)
    lastTime = timestamp
    const frames = Math.floor((frameTime + 0.1) / FRAME_INTERVAL)
    if (frames === 0) {
      return
    }
    frameTime -= frames * FRAME_INTERVAL

    ctx.clearRect(0, 0, viewport.width, viewport.height)
    snows = snows.filter(snow => snow.y < viewport.height)
    framesUntilSnow -= frames
    if (framesUntilSnow <= 0) {
      framesUntilSnow += 30
      if (snows.length < MAX_SNOW_COUNT) {
        snows.push(getRandomSnow(false))
      }
    }
    snows.forEach(snow => {
      snow.y += snow.speed * frames
      ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity.toFixed(2)})`
      ctx.beginPath()
      ctx.arc(snow.x, snow.y, snow.radius, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  return (hidden: boolean) => {
    if (hidden) {
      if (frameHandle !== undefined) {
        cancelAnimationFrame(frameHandle)
        frameHandle = undefined
      }
      lastTime = undefined
      frameTime = FRAME_INTERVAL
    } else if (frameHandle === undefined) {
      frameHandle = requestAnimationFrame(draw)
    }
  }
}
