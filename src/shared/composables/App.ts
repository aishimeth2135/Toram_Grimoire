function scrollToPageTop() {
  document.getElementById('app-top')!.scrollIntoView()
}

export function useAppPageActions() {
  return { scrollToPageTop }
}
