export function remToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

export function reflowElement(el: HTMLElement) {
  // Requesting an elements offsetHight will trigger a reflow of the element content
  return el.offsetHeight
}

export function nextFrame(cb: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb)
  })
}
