export function delay(ms = 500) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
