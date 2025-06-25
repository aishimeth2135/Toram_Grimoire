import { type Ref, computed, ref, watch } from 'vue'

export default function PageControl<Item = unknown>({
  items,
  step,
}: {
  items: Ref<Item[]>
  step: number
}) {
  const maxPage = computed(() => Math.ceil(items.value.length / step))
  const page = (() => {
    const _page = ref(1)
    return computed<number>({
      get() {
        return _page.value
      },
      set(value) {
        _page.value = Math.max(1, Math.min(maxPage.value, value))
      },
    })
  })()
  const currentItems = computed(() => items.value.slice((page.value - 1) * step, page.value * step))

  watch(items, () => {
    page.value = 1
  })

  return {
    page,
    maxPage,
    currentItems,
  }
}
