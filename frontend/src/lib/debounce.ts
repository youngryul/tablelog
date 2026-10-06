export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}
