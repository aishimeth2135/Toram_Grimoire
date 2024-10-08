import { Comment, type Slot } from 'vue'

export function slotNotEmpty(slot: Slot | undefined, slotProps = {}) {
  if (!slot) {
    return false
  }
  return slot(slotProps).some(vnode => {
    if (Array.isArray(vnode.children)) {
      return !!vnode.children.length
    }
    return vnode.type !== Comment
  })
}
