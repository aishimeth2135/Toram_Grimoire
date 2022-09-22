import { Comment, Slot } from 'vue'

export const slotNotEmpty = (slot: Slot | undefined, slotProps = {}) => {
  if (!slot) {
    return false
  }
  return slot(slotProps).some((vnode) => {
    if (Array.isArray(vnode.children)) {
      return !!vnode.children.length
    }
    return vnode.type !== Comment
  })
}
